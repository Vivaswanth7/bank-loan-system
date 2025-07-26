// backend/models/TransactionModel.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transaction_id: {
        type: String, // Using String for UUIDs
        required: true,
        unique: true
    },
    loan_id: {
        type: String, // Storing loan_id as String
        ref: 'Loan', // Optional: Indicates a relationship
        required: true
    },
    transaction_type: {
        type: String,
        enum: ['EMI', 'LUMP_SUM'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    transaction_date: {
        type: Date,
        default: Date.now
    },
    remarks: {
        type: String
    }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;