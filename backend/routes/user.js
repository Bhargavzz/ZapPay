const express = require('express');
const router = express.Router();
const { User } = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { JWT_SECRET } = require("../config");
const zod = require("zod"); 

const signupBody = zod.object({
    username: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string().min(6)
});


const signinBody=zod.object({
    username:zod.string().email(),
    password:zod.string()
})

router.post("/signup", async (req, res) => {
    const { success } = signupBody.safeParse(req.body);

    if (!success) {
        return res.status(411).json({
            message: "Invalid inputs or email format"
        });
    }

    const existingUser = await User.findOne({
        username: req.body.username
    });

    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken"
        });
    }

    //  hash the password before saving
    const hashedPassword = await bcrypt.hash(req.body.password, 10); // 10 salt rounds

    const user = await User.create({
        username: req.body.username,
        password: hashedPassword,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    });

    const userId = user._id;
    const token = jwt.sign({ userId }, JWT_SECRET);

    res.json({
        message: "User created successfully",
        token: token
    });
});


router.post("/signin",async(req,res)=>{
    const {success}=signinBody.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            message:"Invalid inputs or email format"
            });
    }
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
        return res.status(411).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password); //  Compare hashes
    if (!isPasswordCorrect) {
        return res.status(411).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);

    res.json({
        message: "Logged in successfully",
        token
    });

    res.status(411).json({
        message:"Error while logging in"
    })

});



module.exports = router;
