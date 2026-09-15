const router = require('express').Router();
const User = require("./../models/user");
const authMiddleware = require("./../middlewares/authMiddleware");

router.get('/get-logged-user', authMiddleware, async (req, res) => {
    try {

        let loggedInUser = await User.findOne({ _id: req.body.userId })
        loggedInUser.password = undefined

        res.status(200).send({

            message: "User fetched successfully!",
            success: true,
            data: loggedInUser

        })
    } catch (error) {
        res.status(500).send(
            {
                message: error.message,
                success: false
            }
        )
    }
})

router.get('/get-all-users', authMiddleware, async (req, res) => {
    try {
        const allUsers = await User.find({ _id: { $ne: req.body.userId } })

        res.status(200).send({

            message: "User fetched successfully!",
            success: true,
            data: allUsers

        })
    } catch (error) {
        res.status(500).send(
            {
                message: error.message,
                success: false
            }
        )
    }
})

module.exports = router;