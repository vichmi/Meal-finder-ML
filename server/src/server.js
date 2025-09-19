require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(bodyParser())
app.use(cors());

const routes = require('./routes/index.js');
app.use('/api', routes);



app.listen(process.env.PORT, () => {console.log(`Server started at: http://localhost:${process.env.PORT}`)});