// backend/config.js
require('dotenv').config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  MONGODB_URL: process.env.MONGODB_URL  
};
