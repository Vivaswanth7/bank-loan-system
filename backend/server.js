// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db'); // Import the DB connection

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const loanRoutes = require('./routes/LoanRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', loanRoutes);

// Basic route for testing server
app.get('/', (req, res) => {
    res.send('Bank System API is running!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});