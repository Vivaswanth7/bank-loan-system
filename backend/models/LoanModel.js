// backend/models/LoanModel.js
const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    loan_id: {
        type: String, // Using String for UUIDs
        required: true,
        unique: true
    },
    customer_id: {
        type: String, // Storing customer_id as String, not a direct Mongoose ObjectId reference for simplicity
        ref: 'Customer', // Optional: Indicates a relationship, but doesn't enforce referential integrity
        required: true
    },
    principal_amount: {
        type: Number,
        required: true,
        min: 0
    },
    loan_period_years: {
        type: Number,
        required: true,
        min: 1
    },
    interest_rate: {
        type: Number,
        required: true,
        min: 0
    },
    total_interest: {
        type: Number
    },
    total_amount: {
        type: Number
    },
    monthly_emi: {
        type: Number
    },
    amount_paid: {
        type: Number,
        default: 0.0
    },
    emi_paid_count: {
        type: Number,
        default: 0
    },
    start_date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'PAID'],
        default: 'ACTIVE'
    }
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;