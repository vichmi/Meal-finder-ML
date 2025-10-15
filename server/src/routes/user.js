const router = require('express').Router();
const authMiddleware = require('../middlewares/userAuth');
const User = require('../models/User');
const Product = require('../models/Product');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Recipe = require('../models/Recipe');

const uploadDir = path.join(__dirname, '../uploads');
if(!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({storage});

router.post('/addFridgeItem', authMiddleware, async(req, res) => {
    try {
        const item = req.body.item;
        if(!item) {return res.status().send('failed')}
        const user = req.user;
        if(!user) {
            return res.status(404).json({message: 'user not found'});
        }
        const findUser = await User.findById(user.id);
        if(findUser.fridge.indexOf(item) != -1) {return res.status(400).send({message: 'Already in fridge'})}
        findUser.fridge.push(item);
        await findUser.save();
        return res.status(200).json({message: 'Successfully saved item'});
    }catch(err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
});
router.post('/addShoppinglistItem', authMiddleware, async(req, res) => {
    try {
        const item = req.body.item;
        if(!item) {return res.status().send('failed')}
        const user = req.user;
        if(!user) {
            return res.status(404).json({message: 'user not found'});
        }
        const findUser = await User.findById(user.id);
        if(findUser.shoppingList.indexOf(item) != -1) {return res.status(400).send({message: 'Already in shoppingList'})}
        findUser.shoppingList.push(item);
        await findUser.save();
        return res.status(200).json({message: 'Successfully saved item'});
    }catch(err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.delete('/addFridgeItem', authMiddleware, async(req, res) => {
    try {
        const item = req.body.item;
        if(!item) {return res.status().send('failed')}
        const user = req.user;
        if(!user) {
            return res.status(404).json({message: 'user not found'});
        }
        const findUser = await User.findById(user.id);
        const index = findUser.fridge.indexOf(item);
        if(index > -1) {
            findUser.fridge.splice(index, 1);
            await findUser.save();
        }
        return res.status(200).send(findUser.fridge);
    }catch(err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
});
router.delete('/addShoppinglistItem', authMiddleware, async(req, res) => {
    try {
        const item = req.body.item;
        if(!item) {return res.status().send('failed')}
        const user = req.user;
        if(!user) {
            return res.status(404).json({message: 'user not found'});
        }
        const findUser = await User.findById(user.id);
        const index = findUser.shoppingList.indexOf(item);
        if(index > -1) {
            findUser.shoppingList.splice(index, 1);
            await findUser.save();
        }
        return res.status(200).send(findUser.shoppingList)
    }catch(err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.delete('/clearFridge', authMiddleware, async(req, res) => {
    try {
        const user = req.user;
        if(!user) {
            return res.status(404).json({message: 'user not found'});
        }
        const findUser = await User.findById(user.id);
        findUser.fridge = [];
        await findUser.save();
        return res.status(200).json({message: 'Successfully deleted item'});
    }catch(err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
})

router.get('/userItems', authMiddleware, async(req, res) => {
    const user = req.user;
    if(!user) {
        return res.status(404).json({message: 'user not found'});
    }
    const findUser = await User.findById(user.id);
    
    return res.status(200).send({fridge: findUser.fridge, shoppingList: findUser.shoppingList || []});
});

router.get('/getLidl', authMiddleware, async(req, res) => {
        try {
        const user = req.user;
        if(!user) {
            return res.status(404).json({message: 'user not found'});
        }
        const findUser = await User.findById(user.id);
        const shoppingList = findUser.shoppingList;
        const conditions = shoppingList.map(item => ({name: {$regex: item, $options: 'i'}}));
        const displayitems = await Product.find({$or: conditions});
        return res.status(200).send(displayitems);
    }catch(err) {
        console.error(err);
        return res.status(500).send({err});
    }
});

router.post('/createRecipe', upload.array('images', 5), authMiddleware, async(req, res) => {
    try {
        const user = req.user;
        if(!user) {
            return res.status(404).send({message: 'User was not found'});
        }
        const findUser = await User.findById(user.id);
        if(!findUser) {
            return res.status(404).send({message: 'User was not found'});
        }
        const images = (req.files).map(file => `${process.env.SERVER_URL}/uploads/${file.filename}`);
        const recipe = new Recipe({
            title: req.body.title,
            instructions: req.body.instructions,
            information: [
                "servings: " + req.body.servings,
                "prep time: " + req.body.prepTime + " min",
                "cook time: " + req.body.cookTime + " min",
            ],
            imgs: images,
            categories: JSON.parse(req.body.categories),
            ingredients: JSON.parse(req.body.ingredients),
            source: 'AllInOneRecipes',
            author: user.username
        });
        if(recipe.title.trim().length == 0 || recipe.categories.length == 0 || recipe.ingredients.length < 3 || recipe.instructions.length == 0) {
            return res.status(400).send({message: 'Not valid form'})
        }
        findUser.createdRecipes.push(recipe);
        await findUser.save();
        await Recipe.insertOne(recipe);
        return res.status(201).json(recipe);
    }catch(err) {
        return res.status(500).send({err});
    }
});

router.patch("/user/profile/image", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const findUser = await User.findById(user.id);
    if (!findUser) {
      return res.status(404).send({ message: "User not found" });
    }

    if (!req.file) {
      return res.status(400).send({ message: "No image uploaded" });
    }

    // Ако вече има снимка, изтриваме я от сървъра
    if (findUser.profileImage) {
      const oldPath = path.join(__dirname, "../uploads", findUser.profileImage);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    // Запазваме новия път
    const imagePath = `/uploads/${req.file.filename}`;
    findUser.profileImage = imagePath;
    await findUser.save();

    return res.status(200).json({
      message: "Profile image updated successfully",
      image: imagePath,
    });
  } catch (err) {
    console.error("Profile image upload error:", err);
    return res.status(500).send({ message: "Internal server error" });
  }
});

router.patch('/user/profile', authMiddleware, async(req, res) => {
    const user = req.user;
    if(!user) {
        return res.status(400).send({message: 'Token was not provided'})
    }
    const findUser = await User.findById(user.id);
    if(!findUser) {
        return res.status(404).send({message: 'User was not found'})
    }
    findUser.preferedDiet = req.body.diet;
    await findUser.save();
    return res.status(201).send({message: 'user updated successfully'});
});

module.exports = router;