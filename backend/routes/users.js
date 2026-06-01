const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const { validateCreateUser } = require('../middleware/validate');

// All user routes are admin-only
router.use(authenticate, authorize(['admin']));

// GET /api/users — List all users with optional filters and sorting
router.get('/', async (req, res) => {
    try {
        const { name, email, address, role, sortBy, order } = req.query;

        let query = 'SELECT id, name, email, address, role, created_at FROM users WHERE 1=1';
        const params = [];

        if (name) {
            query += ' AND name LIKE ?';
            params.push(`%${name}%`);
        }
        if (email) {
            query += ' AND email LIKE ?';
            params.push(`%${email}%`);
        }
        if (address) {
            query += ' AND address LIKE ?';
            params.push(`%${address}%`);
        }
        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }

        // Sorting — whitelist allowed columns
        const allowedSortColumns = ['name', 'email', 'role', 'created_at'];
        if (sortBy && allowedSortColumns.includes(sortBy)) {
            const sortOrder = order && order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
            query += ` ORDER BY ${sortBy} ${sortOrder}`;
        } else {
            query += ' ORDER BY created_at DESC';
        }

        const [rows] = await pool.query(query, params);
        res.json({ users: rows, total: rows.length });
    } catch (err) {
        console.error('List users error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// GET /api/users/:id — Get user details. For store_owner, include their store's avg rating
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        const [rows] = await pool.query(
            'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = rows[0];

        // If user is a store_owner, fetch their store and its average rating
        if (user.role === 'store_owner') {
            const [stores] = await pool.query(
                `SELECT s.id, s.name, s.email, s.address, 
                        COALESCE(AVG(r.rating), 0) AS average_rating,
                        COUNT(r.id) AS total_ratings
                 FROM stores s
                 LEFT JOIN ratings r ON r.store_id = s.id
                 WHERE s.owner_id = ?
                 GROUP BY s.id`,
                [userId]
            );

            user.stores = stores.map(s => ({
                ...s,
                average_rating: parseFloat(Number(s.average_rating).toFixed(2))
            }));
        }

        res.json({ user });
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// POST /api/users — Admin creates a user with any role
router.post('/', validateCreateUser, async (req, res) => {
    try {
        const { name, email, password, address, role } = req.body;

        // Check duplicate email
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Email already registered.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userRole = role || 'user';

        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
            [name.trim(), email.trim().toLowerCase(), hashedPassword, address ? address.trim() : null, userRole]
        );

        res.status(201).json({
            message: 'User created successfully.',
            user: {
                id: result.insertId,
                name: name.trim(),
                email: email.trim().toLowerCase(),
                role: userRole
            }
        });
    } catch (err) {
        console.error('Create user error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
