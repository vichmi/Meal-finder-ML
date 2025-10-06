const router = require('express').Router();
const Recipe = require('../models/Recipe.js');

const authRoutes = require('./auth.js');
const recipeRoutes = require('./recipe.js')
const userRoutes = require('./user.js');
router.use('/auth/', authRoutes);
router.use('/', recipeRoutes);
router.use('/', userRoutes);

router.get('/recommendations', async (req, res) => {
    try {
        const randomRecipe = await Recipe.aggregate([
                { $match: { img: { $exists: true, $ne: "" } } },
                { $sample: { size: 1 } }
            ]);
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
        let recipes = [];
        if(categoryTitle == 'Нови') {
            recipes = await Recipe.find({img: {$exists: true, $ne: ""}}).sort({_id: -1}).limit(5);
        }else if(categoryTitle == "Топ предложения") {
            recipes = await Recipe.aggregate([
                { $match: { img: { $exists: true, $ne: "" } } },
                { $sample: { size: 5 } }
            ]);
        }
        return res.status(200).send(recipes);
    }catch(err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.get('/search', async (req, res) => {
    try {
        const searchQuery = req.query.q;
        const amountQuery = req.query.k || '5';
        const recipes = await Recipe.find(
            {title: {$regex: '^' + searchQuery, $options: 'i'}},
            {title: 1, img: 1, ingredients: 1}
        ).limit(Number(amountQuery));
        return res.json(recipes)
    } catch(err) {
        console.error('Error performing search:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


module.exports = router;