const express = require('express');
const router = express.Router();
const { User } = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { JWT_SECRET } = require("../config");
const zod = require("zod"); 
const { authMiddleware } = require("../middlewares/authMiddleware");

// ------------------- Zod Schemas ------------------- //
const signupBody = zod.object({
    username: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string().min(6)
});

const signinBody = zod.object({
    username: zod.string().email(),
    password: zod.string()
});

const updateBody = zod.object({
    password: zod.string().min(6).optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
});

// ------------------- Routes ------------------- //

// SIGNUP
router.post("/signup", async (req, res) => {
    const { success } = signupBody.safeParse(req.body);

    if (!success) {
        return res.status(411).json({
            message: "Invalid inputs or email format"
        });
    }

    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken"
        });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
        username: req.body.username,
        password: hashedPassword,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);

    return res.status(201).json({
        message: "User created successfully",
        token
    });
});

// SIGNIN
router.post("/signin", async (req, res) => {
    const { success } = signinBody.safeParse(req.body);

    if (!success) {
        return res.status(411).json({
            message: "Invalid inputs or email format"
        });
    }

    const user = await User.findOne({ username: req.body.username });
    if (!user) {
        return res.status(411).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordCorrect) {
        return res.status(411).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);

    return res.json({
        message: "Logged in successfully",
        token
    });
});

// UPDATE PROFILE
router.put("/", authMiddleware, async (req, res) => {
    const { success } = updateBody.safeParse(req.body);

    if (!success) {
        return res.status(411).json({
            message: "Error while updating information"
        });
    }

    const updateData = { ...req.body };

    // Hash new password if present
    if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await User.updateOne({ _id: req.userId }, updateData);

    return res.json({
        message: "Updated successfully"
    });
});

// BULK USER SEARCH
router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [
            { firstName: { $regex: filter, $options: "i" } },
            { lastName: { $regex: filter, $options: "i" } }
        ]
    });

    return res.json({
        users: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    });
});

module.exports = router;
