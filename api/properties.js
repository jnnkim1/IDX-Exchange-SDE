const express = require('express');
const router = express.Router();
const pool = require('../db');

const isValidListingId = (id) => /^\d{1,10}$/.test(id);

router.get('/', async (req, res) => {
    try {
        const { city, zipcode, minPrice, maxPrice, beds, baths } = req.query;
        const limit = req.query.limit === undefined
            ? 20
            : Number(req.query.limit);

        const offset = req.query.offset === undefined
            ? 0
            : Number(req.query.offset);

        if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
            return res.status(400).json({
                status: 'error',
                message: 'limit must be an integer between 1 and 100'
            });
        }

        if (!Number.isInteger(offset) || offset < 0) {
            return res.status(400).json({
                status: 'error',
                message: 'offset must be a non-negative integer'
            });
        }

        if (minPrice && isNaN(parseFloat(minPrice)) || minPrice < 0) {
            return res.status(400).json({ status: 'error', message: 'minPrice must be a valid positive number' });
        }

        if (maxPrice && isNaN(parseFloat(maxPrice)) || maxPrice < 0) {
            return res.status(400).json({ status: 'error', message: 'maxPrice must be a valid positive number' });
        }

        if (beds && !Number.isInteger(parseInt(beds)) || beds < 0) {
            return res.status(400).json({ status: 'error', message: 'beds must be a valid positive integer' });
        }

        if (baths && !Number.isInteger(parseInt(baths)) || baths < 0) {
            return res.status(400).json({ status: 'error', message: 'baths must be a valid positive integer' });
        }

        if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
            return res.status(400).json({ status: 'error', message: 'minPrice cannot be greater than maxPrice' });
        }

        let query = 'FROM rets_property WHERE 1=1';

        const values = [];

        if (city) {
            query += ' AND L_City = ?';
            values.push(city);
        }

        if (zipcode) {
            query += ' AND L_Zip = ?';
            values.push(zipcode);
        }

        if (minPrice) {
            query += ' AND L_SystemPrice >= ?';
            values.push(minPrice);
        }

        if (maxPrice) {
            query += ' AND L_SystemPrice <= ?';
            values.push(maxPrice);
        }

        if (beds) {
            query += ' AND L_Keyword2 = ?';
            values.push(beds);
        }

        if (baths) {
            query += ' AND LM_Dec_3 = ?';
            values.push(baths);
        }
        
        const [countRows] = await pool.query(`SELECT COUNT(*) AS total ${query}`, values);

        const pageValues = [...values, limit, offset];
        const [rows] = await pool.query(
            `SELECT L_ListingID, L_Address, L_City, L_State, L_Zip,
                    L_SystemPrice, L_Keyword2, LM_Dec_3, LM_Int2_3
             ${query} ORDER BY id ASC LIMIT ? OFFSET ?`,
            pageValues
        );

        res.status(200).json({ total: countRows[0].total, limit, offset, results: rows });
    } catch (error) {
        console.error('Invalid input', error);
        res.status(500).json({ status: 'error', message: 'Could not retrieve properties' });
    }
});

router.get('/:id/openhouses', async (req, res) => {
    if (!isValidListingId(req.params.id)) {
        return res.status(400).json({
            status: 'error',
            message: 'Listing ID must be 1 to 10 digits'
        });
    }

    try {
        const [properties] = await pool.query(
            'SELECT L_ListingID FROM rets_property WHERE L_ListingID = ?',
            [req.params.id]
        );

        if (properties.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Property with listing ID ${req.params.id} was not found`
            });
        }

        const [rows] = await pool.query(
            `SELECT * FROM rets_openhouse
             WHERE L_ListingID = ?
             ORDER BY OpenHouseDate ASC, OH_StartTime ASC`,
            [req.params.id]
        );

        res.status(200).json(rows);
    } catch (error) {
        console.error('Error retrieving open houses:', error);
        res.status(500).json({ status: 'error', message: 'Could not retrieve open houses' });
    }
});

router.get('/:id', async (req, res) => {
    if (!isValidListingId(req.params.id)) {
        return res.status(400).json({
            status: 'error',
            message: 'Listing ID must be 1 to 10 digits'
        });
    }

    try {
        const [rows] = await pool.query(
            'SELECT * FROM rets_property WHERE L_ListingID = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Property with listing ID ${req.params.id} was not found`
            });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error retrieving property:', error);
        res.status(500).json({ status: 'error', message: 'Could not retrieve property' });
    }
});

module.exports = router;
