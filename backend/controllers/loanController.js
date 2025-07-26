// backend/controllers/loanController.js
const { v4: uuidv4 } = require('uuid');
const moment = require('moment'); // For date/time handling (optional, can use native Date)

// Import Mongoose Models
const Customer = require('../models/CustomerModel');
const Loan = require('../models/LoanModel');
const Transaction = require('../models/TransactionModel');


// Helper function to create a dummy customer if they don't exist (for easy testing)
async function ensureCustomerExists(customerId) {
    let customer = await Customer.findOne({ customer_id: customerId });
    if (!customer) {
        customer = new Customer({
            customer_id: customerId,
            name: `Auto-Generated Customer ${customerId.substring(0, 8)}`,
            email: `${customerId}@example.com`,
            phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`
        });
        await customer.save();
        console.log(`Created new dummy customer: ${customerId}`);
    }
    return customer;
}


exports.lendMoney = async (req, res) => {
    const { customer_id, principal_amount, loan_period_years, interest_rate } = req.body;

    // Basic validation
    if (!customer_id || principal_amount === undefined || loan_period_years === undefined || interest_rate === undefined) {
        return res.status(400).json({ message: 'Missing required loan parameters.' });
    }

    const P = parseFloat(principal_amount);
    const N = parseInt(loan_period_years);
    const R = parseFloat(interest_rate);

    if (isNaN(P) || isNaN(N) || isNaN(R) || P <= 0 || N <= 0 || R < 0) {
        return res.status(400).json({ message: 'Invalid loan parameters.' });
    }

    try {
        // Ensure customer exists (create if not for simple testing, in real app, validate existence)
        await ensureCustomerExists(customer_id);

        const total_interest = P * N * R;
        const total_amount = P + total_interest;
        const monthly_emi = total_amount / (N * 12);

        const newLoan = new Loan({
            loan_id: uuidv4(),
            customer_id,
            principal_amount: P,
            loan_period_years: N,
            interest_rate: R,
            total_interest: parseFloat(total_interest.toFixed(2)),
            total_amount: parseFloat(total_amount.toFixed(2)),
            monthly_emi: parseFloat(monthly_emi.toFixed(2)),
            amount_paid: 0.0,
            emi_paid_count: 0,
            start_date: moment().toDate(), // Store as Date object for Mongoose
            status: 'ACTIVE'
        });

        await newLoan.save(); // Save to MongoDB

        res.status(201).json({
            message: 'Loan successfully disbursed.',
            loan: newLoan.toObject() // Return plain object
        });

    } catch (error) {
        console.error('Error lending money:', error);
        res.status(500).json({ message: 'Server error while disbursing loan.', error: error.message });
    }
};

exports.makePayment = async (req, res) => {
    const { loan_id } = req.params;
    const { payment_type, amount } = req.body;

    if (!payment_type || amount === undefined) {
        return res.status(400).json({ message: 'Missing payment type or amount.' });
    }

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
        return res.status(400).json({ message: 'Invalid payment amount.' });
    }

    try {
        const loan = await Loan.findOne({ loan_id });
        if (!loan) {
            return res.status(404).json({ message: 'Loan not found.' });
        }
        if (loan.status === 'PAID') {
            return res.status(400).json({ message: 'Loan is already fully paid.' });
        }

        // Update loan amount paid
        loan.amount_paid = parseFloat((loan.amount_paid + paymentAmount).toFixed(2));

        // Record transaction
        const newTransaction = new Transaction({
            transaction_id: uuidv4(),
            loan_id: loan.loan_id, // Use loan's loan_id
            transaction_type: payment_type,
            amount: paymentAmount,
            transaction_date: moment().toDate(),
            remarks: payment_type === 'EMI' ? `EMI Payment` : `Lump Sum Payment`
        });
        await newTransaction.save(); // Save transaction to MongoDB

        // Update EMI count if it's an EMI payment and sufficient
        if (payment_type === 'EMI' && paymentAmount >= loan.monthly_emi) {
            loan.emi_paid_count += Math.floor(paymentAmount / loan.monthly_emi);
        }

        // Recalculate balance and remaining EMIs
        let balance_amount = parseFloat((loan.total_amount - loan.amount_paid).toFixed(2));
        let number_of_emi_left = 0;
        if (loan.monthly_emi > 0) {
            // Use ceil for remaining EMIs to ensure any fraction implies one more payment needed
            number_of_emi_left = Math.ceil(Math.max(0, balance_amount / loan.monthly_emi));
        }

        // Update loan status if fully paid
        if (balance_amount <= 0) {
            loan.status = 'PAID';
            balance_amount = 0;
            number_of_emi_left = 0;
        }

        await loan.save(); // Save updated loan to MongoDB

        res.status(200).json({
            message: 'Payment processed successfully.',
            loan_id: loan.loan_id,
            amount_paid_this_transaction: paymentAmount,
            new_balance_amount: balance_amount,
            remaining_emis: number_of_emi_left,
            status: loan.status
        });

    } catch (error) {
        console.error('Error making payment:', error);
        res.status(500).json({ message: 'Server error while processing payment.', error: error.message });
    }
};

exports.getLoanLedger = async (req, res) => {
    const { loan_id } = req.params;

    try {
        const loan = await Loan.findOne({ loan_id });
        if (!loan) {
            return res.status(404).json({ message: 'Loan not found.' });
        }

        const transactions = await Transaction.find({ loan_id }).sort({ transaction_date: 1 });

        const balance_amount = parseFloat((loan.total_amount - loan.amount_paid).toFixed(2));
        let number_of_emi_left = 0;
        if (loan.monthly_emi > 0) {
            number_of_emi_left = Math.ceil(Math.max(0, balance_amount / loan.monthly_emi));
        }

        res.status(200).json({
            loan_id: loan.loan_id,
            principal_amount: loan.principal_amount,
            total_amount: loan.total_amount,
            monthly_emi: loan.monthly_emi,
            total_interest: loan.total_interest,
            amount_paid_till_date: parseFloat(loan.amount_paid.toFixed(2)),
            balance_amount: balance_amount,
            number_of_emi_left: number_of_emi_left,
            status: loan.status,
            transactions: transactions.map(t => t.toObject()) // Convert Mongoose docs to plain objects
        });

    } catch (error) {
        console.error('Error getting loan ledger:', error);
        res.status(500).json({ message: 'Server error while fetching ledger.', error: error.message });
    }
};

exports.getCustomerAccountOverview = async (req, res) => {
    const { customer_id } = req.params;

    try {
        const customer = await Customer.findOne({ customer_id });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found.' });
        }

        const customerLoans = await Loan.find({ customer_id });

        const loansOverview = customerLoans.map(loan => {
            const balance_amount = parseFloat((loan.total_amount - loan.amount_paid).toFixed(2));
            let number_of_emi_left = 0;
            if (loan.monthly_emi > 0) {
                number_of_emi_left = Math.ceil(Math.max(0, balance_amount / loan.monthly_emi));
            }
            return {
                loan_id: loan.loan_id,
                principal_amount: loan.principal_amount,
                total_amount: loan.total_amount,
                emi_amount: loan.monthly_emi,
                total_interest: loan.total_interest,
                amount_paid_till_date: parseFloat(loan.amount_paid.toFixed(2)),
                number_of_emi_left: number_of_emi_left,
                status: loan.status
            };
        });

        res.status(200).json({
            customer_id: customer.customer_id,
            customer_name: customer.name,
            loans: loansOverview
        });

    } catch (error) {
        console.error('Error getting customer account overview:', error);
        res.status(500).json({ message: 'Server error while fetching account overview.', error: error.message });
    }
};