const mongoose = require('mongoose');

// ------------------- User Schema ------------------- //
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minlength: 3,
        maxlength: 30
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    }
});

// ------------------- Account Schema ------------------- //
// Note: Store balance in paise (integers), not float
const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to User model
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true,
        default: 0   // Always good to default to 0
    }
});

// ------------------- Models ------------------- //
const User = mongoose.model('User', userSchema);
const Account = mongoose.model('Account', accountSchema);

// ------------------- Export ------------------- //
module.exports = {
    User,
    Account
};
