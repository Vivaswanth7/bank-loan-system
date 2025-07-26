// frontend/script.js
const API_BASE_URL = 'http://localhost:5000/api'; // Adjust if your backend port is different

// --- LEND LOAN ---
document.getElementById('lendLoanForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const customer_id = document.getElementById('customerId').value;
    const principal_amount = parseFloat(document.getElementById('principalAmount').value);
    const loan_period_years = parseInt(document.getElementById('loanPeriod').value);
    const interest_rate = parseFloat(document.getElementById('interestRate').value);

    try {
        const response = await fetch(`${API_BASE_URL}/loans`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ customer_id, principal_amount, loan_period_years, interest_rate }),
        });
        const data = await response.json();
        const resultDiv = document.getElementById('lendLoanResult');
        if (response.ok) {
            resultDiv.innerHTML = `<p><strong>Success:</strong> ${data.message}</p>
                                <p>Loan ID: ${data.loan.loan_id}</p>
                                <p>Total Amount to be Paid (A): $${data.loan.total_amount}</p>
                                <p>Monthly EMI: $${data.loan.monthly_emi}</p>`;
            document.getElementById('paymentLoanId').value = data.loan.loan_id; // Auto-fill for testing
            document.getElementById('ledgerLoanId').value = data.loan.loan_id; // Auto-fill for testing
        } else {
            resultDiv.innerHTML = `<p><strong>Error:</strong> ${data.message || 'Something went wrong'}</p>`;
        }
    } catch (error) {
        console.error('Error lending loan:', error);
        document.getElementById('lendLoanResult').innerHTML = `<p><strong>Network Error:</strong> ${error.message}</p>`;
    }
});

// --- MAKE PAYMENT ---
document.getElementById('makePaymentForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const loan_id = document.getElementById('paymentLoanId').value;
    const payment_type = document.getElementById('paymentType').value;
    const amount = parseFloat(document.getElementById('paymentAmount').value);

    try {
        const response = await fetch(`${API_BASE_URL}/loans/${loan_id}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ payment_type, amount }),
        });
        const data = await response.json();
        const resultDiv = document.getElementById('makePaymentResult');
        if (response.ok) {
            resultDiv.innerHTML = `<p><strong>Success:</strong> ${data.message}</p>
                                <p>New Balance: $${data.new_balance_amount}</p>
                                <p>Remaining EMIs: ${data.remaining_emis}</p>
                                <p>Loan Status: ${data.status}</p>`;
        } else {
            resultDiv.innerHTML = `<p><strong>Error:</strong> ${data.message || 'Something went wrong'}</p>`;
        }
    } catch (error) {
        console.error('Error making payment:', error);
        document.getElementById('makePaymentResult').innerHTML = `<p><strong>Network Error:</strong> ${error.message}</p>`;
    }
});

// --- GET LEDGER ---
document.getElementById('ledgerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const loan_id = document.getElementById('ledgerLoanId').value;

    try {
        const response = await fetch(`${API_BASE_URL}/loans/${loan_id}/ledger`);
        const data = await response.json();
        const resultDiv = document.getElementById('ledgerResult');
        if (response.ok) {
            let transactionsHtml = '<h3>Transactions:</h3>';
            if (data.transactions.length > 0) {
                transactionsHtml += '<ul>';
                data.transactions.forEach(t => {
                    transactionsHtml += `<li>[${new Date(t.transaction_date).toLocaleString()}] ${t.transaction_type}: $${t.amount}</li>`;
                });
                transactionsHtml += '</ul>';
            } else {
                transactionsHtml += '<p>No transactions yet.</p>';
            }

            resultDiv.innerHTML = `
                <p><strong>Loan ID:</strong> ${data.loan_id}</p>
                <p><strong>Principal Amount:</strong> $${data.principal_amount}</p>
                <p><strong>Total Amount:</strong> $${data.total_amount}</p>
                <p><strong>Monthly EMI:</strong> $${data.monthly_emi}</p>
                <p><strong>Total Interest:</strong> $${data.total_interest}</p>
                <p><strong>Amount Paid Till Date:</strong> $${data.amount_paid_till_date}</p>
                <p><strong>Balance Amount:</strong> $${data.balance_amount}</p>
                <p><strong>Number of EMI Left:</strong> ${data.number_of_emi_left}</p>
                <p><strong>Status:</strong> ${data.status}</p>
                ${transactionsHtml}
            `;
        } else {
            resultDiv.innerHTML = `<p><strong>Error:</strong> ${data.message || 'Something went wrong'}</p>`;
        }
    } catch (error) {
        console.error('Error getting ledger:', error);
        document.getElementById('ledgerResult').innerHTML = `<p><strong>Network Error:</strong> ${error.message}</p>`;
    }
});

// --- GET ACCOUNT OVERVIEW ---
document.getElementById('accountOverviewForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const customer_id = document.getElementById('overviewCustomerId').value;

    try {
        const response = await fetch(`${API_BASE_URL}/customers/${customer_id}/loans`);
        const data = await response.json();
        const resultDiv = document.getElementById('accountOverviewResult');
        if (response.ok) {
            let loansHtml = `<h3>Loans for ${data.customer_name} (ID: ${data.customer_id}):</h3>`;
            if (data.loans.length > 0) {
                loansHtml += '<ul>';
                data.loans.forEach(loan => {
                    loansHtml += `
                        <li>
                            <h4>Loan ID: ${loan.loan_id} (${loan.status})</h4>
                            <p>Principal: $${loan.principal_amount}</p>
                            <p>Total Amount: $${loan.total_amount}</p>
                            <p>EMI: $${loan.emi_amount}</p>
                            <p>Total Interest: $${loan.total_interest}</p>
                            <p>Paid Till Date: $${loan.amount_paid_till_date}</p>
                            <p>EMIs Left: ${loan.number_of_emi_left}</p>
                        </li>
                    `;
                });
                loansHtml += '</ul>';
            } else {
                loansHtml += '<p>No loans found for this customer.</p>';
            }
            resultDiv.innerHTML = loansHtml;
        } else {
            resultDiv.innerHTML = `<p><strong>Error:</strong> ${data.message || 'Something went wrong'}</p>`;
        }
    } catch (error) {
        console.error('Error getting account overview:', error);
        document.getElementById('accountOverviewResult').innerHTML = `<p><strong>Network Error:</strong> ${error.message}</p>`;
    }
});