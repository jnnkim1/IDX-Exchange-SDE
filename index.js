require('dotenv').config();

const express = require('express');
const cors = require('cors');
const healthRouter = require('./api/health');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/health', healthRouter);
app.use('/api/properties', require('./api/properties'));

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});