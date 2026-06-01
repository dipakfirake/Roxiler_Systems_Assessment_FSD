const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

// All dashboard routes require authentication
router.use(authenticate);

// GET /api/dashboard/admin — Admin dashboard stats
router.get('/admin', authorize(['admin']), async (req, res) => {
    try {
        const [userCount] = await pool.query('SELECT COUNT(*) AS total FROM users');
        const [storeCount] = await pool.query('SELECT COUNT(*) AS total FROM stores');
        const [ratingCount] = await pool.query('SELECT COUNT(*) AS total FROM ratings');

        res.json({
            totalUsers: userCount[0].total,
            totalStores: storeCount[0].total,
            totalRatings: ratingCount[0].total
        });
    } catch (err) {
        console.error('Admin dashboard error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// GET /api/dashboard/store-owner — Store owner dashboard
router.get('/store-owner', authorize(['store_owner']), async (req, res) => {
    try {
        const ownerId = req.user.id;

        // Find the owner's store
        const [stores] = await pool.query('SELECT id, name FROM stores WHERE owner_id = ?', [ownerId]);

        if (stores.length === 0) {
            return res.status(404).json({ message: 'No store found for this owner.' });
        }

        const store = stores[0];

        // Get average rating and rater details
        const [avgRows] = await pool.query(
            'SELECT COALESCE(AVG(rating), 0) AS average_rating, COUNT(*) AS total_ratings FROM ratings WHERE store_id = ?',
            [store.id]
        );

        const [raters] = await pool.query(
            `SELECT u.id AS user_id, u.name, u.email, r.rating, r.created_at, r.updated_at
             FROM ratings r
             JOIN users u ON u.id = r.user_id
             WHERE r.store_id = ?
             ORDER BY r.created_at DESC`,
            [store.id]
        );

        res.json({
            store: {
                id: store.id,
                name: store.name,
                average_rating: parseFloat(Number(avgRows[0].average_rating).toFixed(2)),
                total_ratings: avgRows[0].total_ratings
            },
            raters
        });
    } catch (err) {
        console.error('Store owner dashboard error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
