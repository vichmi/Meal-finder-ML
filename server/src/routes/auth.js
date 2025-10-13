const router = require('express').Router(); 
const User = require('../models/User.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const authMiddleware = require('../middlewares/userAuth.js');

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        const findUser = await User.find({ username });
        if (findUser.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        return res.status(201).json({ message: 'User registered successfully' });
    }catch(err) {
        console.error('Error during registration:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.post('/login', async(req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        const user = await User.find({ username });
        if (user.length === 0) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const validPassword = await bcrypt.compare(password, user[0].password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const token = jwt.sign({ id: user[0]._id, username: user[0].username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000});
        return res.json({ message: 'Login successful' });
    }catch(err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.post('/logout', async(req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'lax'
        });
        return res.status(200).json({message: 'Succesfulyy logged out'});
    }catch(err) {
        console.error(err);
        return res.status(500).json({message: 'Server error', err: err.message});
    }
});

router.get('/profile', authMiddleware, async(req, res) => {
    const findUser = await User.findById(req.user.id);
    if(!findUser) {
        return res.status(404).send({message: 'User was not found'});
    }
    res.json({ 
        diet: findUser.diet,
        img: findUser.profileImage ? process.env.SERVER_URL+findUser.profileImage : '',
        createdRecipes: findUser.createdRecipes
    });
}); 


module.exports = router;
