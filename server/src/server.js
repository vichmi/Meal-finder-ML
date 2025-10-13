require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const app = express();
const connectDB = require('./db.js');
const path = require('path');
app.set('trust proxy', 1);
app.use(bodyParser.urlencoded())
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const routes = require('./routes/index.js');
app.use('/api', routes);

connectDB().then(() => {
    app.listen(process.env.PORT, () => {console.log(`Server started`)});
})