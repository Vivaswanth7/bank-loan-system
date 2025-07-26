// backend/db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            // useNewUrlParser: true,  // These are often not needed in newer Mongoose versions
            // useUnifiedTopology: true,
            // useCreateIndex: true, // No longer supported in Mongoose 6+
            // useFindAndModify: false // No longer supported in Mongoose 6+
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;