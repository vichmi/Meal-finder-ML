const authMiddleware = require('../middlewares/userAuth');
const User = require('../models/User');
const router = require('express').Router();
const Recipe = require('../models/Recipe');

const grpcClient = require('../grpc_client.js');

router.post('/recipe', async (req, res) => {
    try {
        const ingredients = req.body.ingredients.join(' ');
        if(ingredients.length === 0) {
            return res.status(400).json({ message: 'No ingredients provided' });
        }
        grpcClient.Search({ query: ingredients, top_k: 5 }, async (err, response) => {
            if (err) {
                console.error('gRPC Error:', err);
                return res.status(500).json({ message: 'gRPC error', error: err.message });
            }
            return res.json(response.results);
        });
    }catch(err) {
        console.error('Error fetching recipe by ID:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.get('/recipe/:id', async (req, res) => {
    try {
        const recipeId = req.params.id;
        const recipe = await Recipe.findById(recipeId).select('-_id -embedding -source_id -recipe_hash')
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json(recipe);
    } catch (err) {
        console.error('Error fetching recipe by ID:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.post('/recipe/:id/bookmark', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        if(!user) {
            return res.status(400).send({message: 'Invalid user'})
        }
        
        const findUser = await User.findById(user.id);
        if(!findUser) {
            return res.status(404).send({message: 'User was not found'});
        }
        if(!findUser.bookmarkedRecipes.includes(req.params.id)) {
            findUser.bookmarkedRecipes.push(req.params.id)
            await findUser.save();
        }
        res.status(200).send({message: 'Successfully saved recipe.'});

    }catch(err) {
        return res.status(500).send({message: 'Server error', error: err.message})
    }
});

router.delete('/recipe/:id/bookmark', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        if(!user) {
            return res.status(400).send({message: 'Invalid user'});
        }
        const findUser = await User.findById(user.id);
        if(!findUser) {
            return res.status(404).send({message: 'User was not found'});
        }
        if(findUser.bookmarkedRecipes.includes(req.params.id)) {
            const rIndex = findUser.bookmarkedRecipes.indexOf(req.params.id);
            if(rIndex > -1) {
                findUser.bookmarkedRecipes.splice(rIndex, 1);
                await findUser.save();
            }
        }
        return res.status(200).send({message: 'Successfully removed recipe'});
    }catch(err) {
        return res.status(500).send({message: 'Server error', error: err.message});
    }
});

router.get('/bookmarked', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        if(!user) {
            return res.status(400).send({message: 'Invalid user'});
        }
        const findUser = await User.findById(user.id);
        if(!findUser) {
            return res.status(404).send({message: 'User was not found'});
        }
        const bookmarkedRecipes = await Recipe.find({_id: {$in: findUser.bookmarkedRecipes}});
        return res.status(200).send(bookmarkedRecipes);
    }catch(err) {
        return res.status(500).send({message: 'Server error', error: err.message});
    }
});

module.exports = router;