const router = require('express').Router();
const User = require("./../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');

router.post('/signup', async (req, res) => {

    try {
        const user = await User.findOne({ email: req.body.email })

        if (user) {
            return res.send({
                message: "User already exists.",
                success: false
            })
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        req.body.password = hashedPassword;

        const newUser = new User(req.body);
        await newUser.save();

        res.status(201).send({
            message: "User created successfully!",
            success: true
        })

    } catch (error) {
        res.send({
            message: error.message,
            success: false
        })
    }
})

router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })

        if (!user) {
            return res.send({
                message: "User does exists.",
                success: false
            })
        }

        const isValid = await bcrypt.compare(req.body.password, user.password);

        if (!isValid) {
            return res.send({
                message: "Invalid Password.",
                success: false
            })
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' })

        res.status(200).send({
            message: "User Logged in successfully.",
            success: true,
            token
        })

    } catch (error) {
        res.send({
            message: error.message,
            success: false
        })
    }
})

module.exports = router;