const mongoose = require('mongoose');
 
const userSchema = new mongoose.Schema({
    name: {type: String},
    code: {type: Number},
    price: {type: Number},
    image: {type: String}
}, {collection: 'lidl_products'});

module.exports = mongoose.model('Product', userSchema);