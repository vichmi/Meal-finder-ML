const authMiddleware = require('../middlewares/userAuth');
const User = require('../models/User');
const router = require('express').Router();
const Recipe = require('../models/Recipe');

// const grpcClient = require('../grpc_client.js');


function tokenizeDocument(recipe) {
  const titleTokens = recipe.title?.split(/\s+/) ?? [];
  const ingredientTokens = (recipe.ingredients ?? [])
    .flatMap(ing => (ing.name ?? "").split(/\s+/));
  return [...titleTokens, ...ingredientTokens]
    .map(w => w.toLowerCase().trim())
    .filter(Boolean);
}

function calculateAvgdl(recipes) {
  const total = recipes.reduce((sum, r) => sum + tokenizeDocument(r).length, 0);
  return total / recipes.length;
}

function termFrequency(t, docCounter, docLength, avgdl, k = 1.2, b = 0.75) {
  const f = docCounter[t] ?? 0;
  if (f === 0) return 0;
  return (f * (k + 1)) / (f + k * (1 - b + b * (docLength / avgdl)));
}

function inverseDocumentFrequency(t, docs, termDocFreq) {
  const nt = termDocFreq[t] ?? 0;
  const N = docs.length;
  return Math.log((N - nt + 0.5) / (nt + 0.5));
}

router.post("/recipe", async (req, res) => {
  try {
    const ingredients = req.body.ingredients?.join(" ").trim() ?? "";
    if (!ingredients) {
      return res.status(400).json({ message: "No ingredients provided" });
    }
    // load all recipes
    const recipes = await Recipe.find({});
    if (!recipes.length) {
      return res.status(404).json({ message: "No recipes in database" });
    }

    // pre-compute doc frequencies for IDF
    const termDocFreq = {};
    recipes.forEach(r => {
      const tokens = new Set(tokenizeDocument(r));
      for (const t of tokens) termDocFreq[t] = (termDocFreq[t] ?? 0) + 1;
    });

    const avgdl = calculateAvgdl(recipes);
    const queries = ingredients.toLowerCase().split(/\s+/);

    const scores = recipes.map(r => {
      const tokens = tokenizeDocument(r);
      const docLength = tokens.length;
      const docCounter = tokens.reduce((c, t) => {
        c[t] = (c[t] ?? 0) + 1;
        return c;
      }, {});
      let score = 0;
      for (const q of queries) {
        const tf = termFrequency(q, docCounter, docLength, avgdl);
        const idf = inverseDocumentFrequency(q, recipes, termDocFreq);
        score += tf * idf;
      }
      return {
        id: r._id.toString(),
        title: r.title,
        ingredients: r.ingredients,
        instructions: r.instructions,
        img: r.img || (r.imgs?.[0] ?? ""),
        score,
      };
    });

    // sort & limit
    const topResults = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    res.json(topResults);
  } catch (err) {
    console.error("Error in recipe search:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



// router.post('/recipe', async (req, res) => {
//     try {
//         const ingredients = req.body.ingredients.join(' ');
//         if(ingredients.length === 0) {
//             return res.status(400).json({ message: 'No ingredients provided' });
//         }
//         grpcClient.Search({ query: ingredients, top_k: 5 }, async (err, response) => {
//             if (err) {
//                 console.error('gRPC Error:', err);
//                 return res.status(500).json({ message: 'gRPC error', error: err.message });
//             }
//             return res.json(response.results);
//         });
//     }catch(err) {
//         console.error('Error fetching recipe by ID:', err);
//         res.status(500).json({ message: 'Server error', error: err.message });
//     }
// });

router.get('/recipe/:id', async (req, res) => {
    try {
        const recipeId = req.params.id;
        console.log(await Recipe.find({}));
        const recipe = await Recipe.findById(recipeId).select('-_id -embedding -source_id -recipe_hash')
        console.log(recipeId)
        console.log(recipe)
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