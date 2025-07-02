// backend/routes/account.js
const express = require('express');
const mongoose = require('mongoose');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { Account } = require('../db');
const { inrToPaise, paiseToInr } = require('../utils/money');

const router = express.Router();

// Get balance (returns balance in INR)
router.get("/balance", authMiddleware, async (req, res) => {
    try {
        const account = await Account.findOne({ userId: req.userId });

        if (!account) {
            return res.status(404).json({ error: "Account not found" });
        }   

        return res.json({
            balance: paiseToInr(account.balance)
        });
    } catch (err) {
        return res.status(500).json({ error: "Failed to fetch balance" });
    }
});

// Transfer funds
router.post("/transfer", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { amount, to } = req.body;

        // Validate amount
        if (typeof amount !== "number" || amount <= 0) {
            throw new Error("Invalid transfer amount");
        }

        const paiseAmount = inrToPaise(amount); // convert ₹ to paise

        const fromAccount = await Account.findOne({ userId: req.userId }).session(session);
        if (!fromAccount || fromAccount.balance < paiseAmount) {
            throw new Error("Insufficient balance or invalid account");
        }

        const toAccount = await Account.findOne({ userId: to }).session(session);
        if (!toAccount) {
            throw new Error("Recipient account not found");
        }

        // Perform balance updates
        await Account.updateOne(
            { userId: req.userId },
            { $inc: { balance: -paiseAmount } }
        ).session(session);

        await Account.updateOne(
            { userId: to },
            { $inc: { balance: paiseAmount } }
        ).session(session);

        await session.commitTransaction();
        return res.json({ message: "Transfer successful" });

    } catch (err) {
        await session.abortTransaction();
        return res.status(400).json({ error: err.message });
    } finally {
        session.endSession();
    }
});

module.exports = router;
