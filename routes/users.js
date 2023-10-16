const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const Transaction = require('../models/Transactions');
const transactions = require("../models/transactions");
const {successResponse, errorResponse} = require("../middleware/response");
const Transactions = require("../models/transactions");


router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

router.get('/find-team/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const users = await User.find({ referedBy: id });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

router.get('/:id/transactions', async (req, res) => {
    try {
        const { id } = req.params;
        const transactions = await Transactions.find({ id});
        res.status(200).json({transactions});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

router.get('/getAll', async (req, res) => {
    try {
        const count = await User.countDocuments({});
        const perPage = 10
        const page = 0;
       // const results  = []
        try {
            let data = await User.find().limit(perPage)
                .skip(perPage * page)
            let results = []
            for(userObj of data){
                var tmpUser = userObj.toObject();
                // Add properties...
                const team = await User.countDocuments({referedBy:tmpUser?.referral});
                tmpUser.team = team;
                const referredUsers = await User.find({ referedBy: tmpUser?.referral });
                const referredUserIds = referredUsers.map(user => tmpUser.id);
                const teamTransactions = await Transactions.find({ id: { $in: referredUserIds } });
                const selfTransaction = await Transactions.find({ id: tmpUser.id });
                const totalTeamPurchase = teamTransactions.reduce((acc, transaction) => acc + transaction.amount, 0);
                const totalSelfPurchase = selfTransaction.reduce((acc, transaction) => acc + transaction.amount, 0);
                results.push({...tmpUser, totalTeamPurchase,totalSelfPurchase});
            }


            return successResponse(res, {
                message: "users get successfully",
                results: results,
                totalCount:count,
                page: page
            });
        } catch (error) {
            return errorResponse(error, res);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare the provided password with the hashed password in the database
        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id }, 'your-secret-key', {
            expiresIn: '1h', // Token expires in 1 hour
        });

        res.json({ token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/signup', async (req, res) => {
    const { email, password, referedBy } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash the password before storing it in the database
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Create a new user
        const newUser = new User({
            email,
            password: hashedPassword,
            referedBy,
        });

        await newUser.save();

        res.status(201).json({ message: 'Signup successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = router;
