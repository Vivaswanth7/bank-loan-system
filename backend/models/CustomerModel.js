// backend/models/CustomerModel.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    customer_id: {
        type: String, // Using String for UUIDs
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address'] // Basic email validation
    },
    phone: {
        type: String
    }
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;