require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const connectDB = require('./db.js');
app.use(bodyParser.urlencoded())
app.use(cors());
app.use(express.json());

const routes = require('./routes/index.js');
app.use('/api', routes);

connectDB().then(() => {
    app.listen(process.env.PORT, () => {console.log(`Server started at: http://localhost:${process.env.PORT}`)});
})