const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const { validateCreateStore } = require('../middleware/validate');

// All store routes require authentication
router.use(authenticate);

// GET /api/stores — List stores with avg rating, search, sorting
// If the requesting user is a normal user, also include their own submitted rating per store
router.get('/', async (req, res) => {
    try {
        const { name, address, sortBy, order } = req.query;
        const userId = req.user.id;
        const userRole = req.user.role;

        let query = `
            SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at,
                   COALESCE(AVG(r.rating), 0) AS average_rating,
                   COUNT(r.id) AS total_ratings
        `;

        // For normal users, also get their submitted rating via a subquery
        if (userRole === 'user') {
            query += `,
                (SELECT ur.rating FROM ratings ur WHERE ur.user_id = ? AND ur.store_id = s.id) AS my_rating
            `;
        }

        query += `
            FROM stores s
            LEFT JOIN ratings r ON r.store_id = s.id
            WHERE 1=1
        `;

        const params = [];
        if (userRole === 'user') {
            params.push(userId);
        }

        if (name) {
            query += ' AND s.name LIKE ?';
            params.push(`%${name}%`);
        }
        if (address) {
            query += ' AND s.address LIKE ?';
            params.push(`%${address}%`);
        }

        query += ' GROUP BY s.id';

        // Sorting
        const allowedSortColumns = ['name', 'average_rating', 'created_at'];
        if (sortBy && allowedSortColumns.includes(sortBy)) {
            const sortOrder = order && order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
            if (sortBy === 'average_rating') {
                query += ` ORDER BY average_rating ${sortOrder}`;
            } else {
                query += ` ORDER BY s.${sortBy} ${sortOrder}`;
            }
        } else {
            query += ' ORDER BY s.created_at DESC';
        }

        const [rows] = await pool.query(query, params);

        const stores = rows.map(store => ({
            ...store,
            average_rating: parseFloat(Number(store.average_rating).toFixed(2)),
            my_rating: store.my_rating || null
        }));

        res.json({ stores, total: stores.length });
    } catch (err) {
        console.error('List stores error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// POST /api/stores — Create a store (admin only)
router.post('/', authorize(['admin']), validateCreateStore, async (req, res) => {
    try {
        const { name, email, address, owner_id } = req.body;

        // Check duplicate store email
        const [existing] = await pool.query('SELECT id FROM stores WHERE email = ?', [email.trim().toLowerCase()]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Store email already exists.' });
        }

        // If owner_id provided, verify user exists and is a store_owner
        if (owner_id) {
            const [ownerRows] = await pool.query('SELECT id, role FROM users WHERE id = ?', [owner_id]);
            if (ownerRows.length === 0) {
                return res.status(404).json({ message: 'Owner user not found.' });
            }
            if (ownerRows[0].role !== 'store_owner') {
                return res.status(400).json({ message: 'Assigned user must have store_owner role.' });
            }
        }

        const [result] = await pool.query(
            'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
            [name.trim(), email.trim().toLowerCase(), address.trim(), owner_id || null]
        );

        res.status(201).json({
            message: 'Store created successfully.',
            store: {
                id: result.insertId,
                name: name.trim(),
                email: email.trim().toLowerCase(),
                address: address.trim(),
                owner_id: owner_id || null
            }
        });
    } catch (err) {
        console.error('Create store error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// POST /api/stores/:id/rate — Submit or update a rating (normal user only)
router.post('/:id/rate', authorize(['user']), async (req, res) => {
    try {
        const storeId = req.params.id;
        const userId = req.user.id;
        const { rating } = req.body;

        // Validate rating value
        if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
        }

        // Check if store exists
        const [storeRows] = await pool.query('SELECT id FROM stores WHERE id = ?', [storeId]);
        if (storeRows.length === 0) {
            return res.status(404).json({ message: 'Store not found.' });
        }

        // Upsert: insert or update on duplicate (user_id, store_id)
        await pool.query(
            `INSERT INTO ratings (user_id, store_id, rating) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE rating = VALUES(rating), updated_at = CURRENT_TIMESTAMP`,
            [userId, storeId, rating]
        );

        // Fetch the updated average rating for the store
        const [avgRows] = await pool.query(
            'SELECT COALESCE(AVG(rating), 0) AS average_rating FROM ratings WHERE store_id = ?',
            [storeId]
        );

        res.json({
            message: 'Rating submitted successfully.',
            rating,
            store_average: parseFloat(Number(avgRows[0].average_rating).toFixed(2))
        });
    } catch (err) {
        console.error('Rate store error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// GET /api/stores/:id/ratings — List users who rated this store with their ratings
// Accessible by: admin or the store's owner
router.get('/:id/ratings', async (req, res) => {
    try {
        const storeId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Check if store exists
        const [storeRows] = await pool.query('SELECT id, name, owner_id FROM stores WHERE id = ?', [storeId]);
        if (storeRows.length === 0) {
            return res.status(404).json({ message: 'Store not found.' });
        }

        const store = storeRows[0];

        // Only admin or the store's owner can view ratings list
        if (userRole !== 'admin' && store.owner_id !== userId) {
            return res.status(403).json({ message: 'Forbidden. You can only view ratings for your own store.' });
        }

        const [ratings] = await pool.query(
            `SELECT r.id, r.rating, r.created_at, r.updated_at,
                    u.id AS user_id, u.name AS user_name, u.email AS user_email
             FROM ratings r
             JOIN users u ON u.id = r.user_id
             WHERE r.store_id = ?
             ORDER BY r.created_at DESC`,
            [storeId]
        );

        // Calculate average
        const [avgRows] = await pool.query(
            'SELECT COALESCE(AVG(rating), 0) AS average_rating, COUNT(*) AS total_ratings FROM ratings WHERE store_id = ?',
            [storeId]
        );

        res.json({
            store: {
                id: store.id,
                name: store.name,
                average_rating: parseFloat(Number(avgRows[0].average_rating).toFixed(2)),
                total_ratings: avgRows[0].total_ratings
            },
            ratings
        });
    } catch (err) {
        console.error('Get store ratings error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
