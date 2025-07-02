// frontend/utils/money.js

export function formatINR(paiseAmount) {
    const inr = (paiseAmount / 100).toFixed(2);
    return `₹${inr}`;
}
