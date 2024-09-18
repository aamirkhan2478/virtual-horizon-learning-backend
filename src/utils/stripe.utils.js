// Desc: Stripe utility to create a stripe instance
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Export stripe
module.exports = stripe;
