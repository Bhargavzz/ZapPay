// backend/utils/money.js

function inrToPaise(amountInInr) {
    // Convert INR to paise (stored as integer)
    return Math.round(amountInInr * 100);
}

function paiseToInr(paiseAmount) {
    // Convert paise (integer) back to INR string (e.g., "99.99")
    return (paiseAmount / 100).toFixed(2);
}

module.exports = {
    inrToPaise,
    paiseToInr
};
