require('dotenv').config();

const express = require('express');
const cors = require('cors');
const healthRouter = require('./api/health');

const app = express();
const port = process.env.PORT || 5000;

app.use((req, res, next) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();

    res.on('finish', () => {
        console.log(`${timestamp} ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
    });

    next();
});

app.use(cors());
app.use(express.json());
app.use('/api/health', healthRouter);
app.use('/api/properties', require('./api/properties'));

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
    });
}

module.exports = app;
