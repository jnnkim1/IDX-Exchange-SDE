const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT 1');
        res.status(200).json({ status: 'ok', database: 'connected' });
    } catch (error) {
        console.error('Error occurred while checking database connection:', error);
        res.status(500).json({ status: 'error', database: 'disconnected' });
    }

})

module.exports = router;