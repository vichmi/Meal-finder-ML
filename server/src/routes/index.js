const router = require('express').Router();
const Recipe = require('../models/Recipe.js');
const grpcClient = require('../grpc_client.js');

const authRoutes = require('./auth.js');

router.use('/auth/', authRoutes);

router.get('/recommendations', async (req, res) => {
    try {
        const randomRecipe = await Recipe.aggregate([{ $sample: { size: 1 } }]);
        if (randomRecipe.length === 0) {
            return res.status(404).json({ message: 'No recipes found' });
        }
        res.json(randomRecipe[0]);
    } catch (error) {
        console.error('Error fetching random recipe:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/category', async (req, res) => {
    try {
        const categoryTitle = req.query.title;
        grpcClient.Search({ query: categoryTitle, top_k: 5 }, async (err, response) => {
            if (err) {
                console.error('gRPC Error:', err);
                return res.status(500).json({ message: 'gRPC error', error: err.message });
            }
            return res.json(response.results);
        });
    }catch(err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.get('/search', async (req, res) => {
    try {
        const searchQuery = req.query.q;
        const amountQuery = req.query.k || '5';
        // console.log(Number(amountQuery));
        const recipes = await Recipe.find(
            {title: {$regex: '^' + searchQuery, $options: 'i'}},
            {title: 1, img: 1, ingredients: 1}
        ).limit(Number(amountQuery));
        console.log(recipes.length)
        return res.json(recipes)
    } catch(err) {
        console.error('Error performing search:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.get('/recipe/:id', async (req, res) => {
    try {
        const recipeId = req.params.id;
        const recipe = await Recipe.findById(recipeId).select('-_id -embedding -source_id -recipe_hash')
        console.log(recipeId)
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json(recipe);
    } catch (err) {
        console.error('Error fetching recipe by ID:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

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

module.exports = router;