// backend/routes/loanRoutes.js
const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

// LEND: The bank can give loans to customers.
router.post('/loans', loanController.lendMoney);

// PAYMENT: Customers can pay back loans.
router.post('/loans/:loan_id/payments', loanController.makePayment);

// LEDGER: Customers can check all the transactions for a loan id.
router.get('/loans/:loan_id/ledger', loanController.getLoanLedger);

// ACCOUNT OVERVIEW: This should list all the loans customers have taken.
router.get('/customers/:customer_id/loans', loanController.getCustomerAccountOverview);

module.exports = router;