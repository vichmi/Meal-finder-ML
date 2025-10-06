const mongoose = require('mongoose');
 
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    bookmarkedRecipes: {
        type: Array
    },
    createdRecipes: {
        type: Array
    },
    fridge: {
        type: Array
    },
    shoppingList: {
        type: Array
    },
    profileImage: {
        type: String
    },
    preferedDiet: {
        type: String
    }
}, {collection: 'users'});

module.exports = mongoose.model('User', userSchema);