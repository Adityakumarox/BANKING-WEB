// Transfer Page Script - Professional Banking Transfer System

document.addEventListener('DOMContentLoaded', function() {
    // Check if there are any accounts
    if (!bank.accounts || bank.accounts.length === 0) {
        showAlert('📢 No accounts found. Please create an account first from the Accounts page.', 'info');
    }
    
    loadAccountSelects();
    setupEventListeners();
    loadTransferStatistics();
    loadRecentTransfers();
});

function setupEventListeners() {
    const transferForm = document.getElementById('transferForm');
    if (transferForm) {
        transferForm.addEventListener('submit', handleTransfer);
    }
    
    const fromAccountSelect = document.getElementById('transferFrom');
    const toAccountSelect = document.getElementById('transferTo');
    const amountInput = document.getElementById('transferAmount');
    
    if (fromAccountSelect) {
        fromAccountSelect.addEventListener('change', updateTransferPreview);
    }
    
    if (toAccountSelect) {
        toAccountSelect.addEventListener('change', updateTransferPreview);
    }
    
    if (amountInput) {
        amountInput.addEventListener('input', updateTransferPreview);
    }
}

function loadAccountSelects() {
    const fromSelect = document.getElementById('transferFrom');
    const toSelect = document.getElementById('transferTo');
    
    [fromSelect, toSelect].forEach(select => {
        if (!select) return;
        select.innerHTML = '<option value="">Select an account...</option>';
        
        bank.accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.accountNumber;
            option.textContent = `${account.holder} - ${account.type} (#${account.accountNumber})`;
            select.appendChild(option);
        });
    });
}

function loadAccountSelects() {
    const fromSelect = document.getElementById('transferFrom');
    const toSelect = document.getElementById('transferTo');
    
    if (!fromSelect || !toSelect) {
        console.error('Account select elements not found');
        return;
    }
    
    // Clear existing options
    fromSelect.innerHTML = '<option value="">Select source account...</option>';
    toSelect.innerHTML = '<option value="">Select destination account...</option>';
    
    // Check if there are any accounts
    if (!bank.accounts || bank.accounts.length === 0) {
        const optionText = 'No accounts available - Create one first';
        fromSelect.innerHTML += `<option value="" disabled>${optionText}</option>`;
        toSelect.innerHTML += `<option value="" disabled>${optionText}</option>`;
        return;
    }
    
    // Populate account options
    bank.accounts.forEach(account => {
        const option1 = document.createElement('option');
        option1.value = account.accountNumber;
        option1.textContent = `${account.holder} - ${account.type} (#${account.accountNumber})`;
        fromSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = account.accountNumber;
        option2.textContent = `${account.holder} - ${account.type} (#${account.accountNumber})`;
        toSelect.appendChild(option2);
    });
}

function updateTransferPreview() {
    try {
        const fromAccountSelect = document.getElementById('transferFrom');
        const toAccountSelect = document.getElementById('transferTo');
        const amountInput = document.getElementById('transferAmount');
        const previewContainer = document.getElementById('transferPreview');
        
        if (!previewContainer || !fromAccountSelect || !toAccountSelect || !amountInput) {
            return;
        }
        
        const fromAccountNumber = fromAccountSelect.value ? parseInt(fromAccountSelect.value) : null;
        const toAccountNumber = toAccountSelect.value ? parseInt(toAccountSelect.value) : null;
        const amount = parseFloat(amountInput.value) || 0;
        
        // Get accounts safely
        let fromAccount = null;
        let toAccount = null;
        
        if (fromAccountNumber) {
            try {
                fromAccount = bank.accounts.find(acc => acc.accountNumber === fromAccountNumber);
            } catch (e) {
                console.error('Error finding from account:', e);
            }
        }
        
        if (toAccountNumber) {
            try {
                toAccount = bank.accounts.find(acc => acc.accountNumber === toAccountNumber);
            } catch (e) {
                console.error('Error finding to account:', e);
            }
        }
        
        // Update balance hints
        const fromBalanceEl = document.getElementById('fromBalance');
        const toBalanceEl = document.getElementById('toBalance');
        
        if (fromAccount && fromBalanceEl) {
            const availBal = fromAccount.getAvailableBalance ? fromAccount.getAvailableBalance() : fromAccount.balance;
            fromBalanceEl.textContent = `Available: ₹${availBal.toFixed(2)}`;
        } else if (fromBalanceEl) {
            fromBalanceEl.textContent = '';
        }
        
        if (toAccount && toBalanceEl) {
            toBalanceEl.textContent = `Current: ₹${toAccount.balance.toFixed(2)}`;
        } else if (toBalanceEl) {
            toBalanceEl.textContent = '';
        }
        
        // Hide preview if not ready
        if (!fromAccount || !toAccount || amount <= 0) {
            previewContainer.style.display = 'none';
            return;
        }
        
        if (fromAccountNumber === toAccountNumber) {
            previewContainer.style.display = 'none';
            return;
        }
        
        const availableBalance = fromAccount.getAvailableBalance ? fromAccount.getAvailableBalance() : fromAccount.balance;
        const fromAfterBalance = fromAccount.balance - amount;
        const toAfterBalance = toAccount.balance + amount;
        const canTransfer = availableBalance >= amount;
        
        // Update preview elements
        const previewFromAccount = document.getElementById('previewFromAccount');
        const previewToAccount = document.getElementById('previewToAccount');
        const previewFromCurrent = document.getElementById('previewFromCurrent');
        const previewFromAfter = document.getElementById('previewFromAfter');
        const previewToCurrent = document.getElementById('previewToCurrent');
        const previewToAfter = document.getElementById('previewToAfter');
        
        if (previewFromAccount) previewFromAccount.textContent = `${fromAccount.holder} (${fromAccount.type})`;
        if (previewToAccount) previewToAccount.textContent = `${toAccount.holder} (${toAccount.type})`;
        if (previewFromCurrent) previewFromCurrent.textContent = `₹${fromAccount.balance.toFixed(2)}`;
        if (previewFromAfter) {
            const color = canTransfer ? '#10b981' : '#ef4444';
            previewFromAfter.innerHTML = `<span style="color: ${color}; font-weight: 600;">₹${fromAfterBalance.toFixed(2)}</span>`;
        }
        if (previewToCurrent) previewToCurrent.textContent = `₹${toAccount.balance.toFixed(2)}`;
        if (previewToAfter) previewToAfter.innerHTML = `<span style="color: #10b981; font-weight: 600;">₹${toAfterBalance.toFixed(2)}</span>`;
        
        previewContainer.style.display = 'block';
    } catch (error) {
        console.error('Error in updateTransferPreview:', error);
    }
    const toAccountNumber = parseInt(toAccountSelect.value);
    const amount = parseFloat(amountInput.value) || 0;
    
    const fromAccount = fromAccountNumber ? bank.findAccount(fromAccountNumber) : null;
    const toAccount = toAccountNumber ? bank.findAccount(toAccountNumber) : null;
    
    if (!fromAccount || !toAccount || amount <= 0) {
        previewContainer.style.display = 'none';
        return;
    }
    
    const fee = amount * 0.01; // 1% fee
    const totalDebit = amount + fee;
    const availableBalance = fromAccount.getAvailableBalance ? fromAccount.getAvailableBalance() : fromAccount.balance;
    
    let previewHTML = `
        <div class="transfer-preview-steps">
            <div class="transfer-step">
                <div class="step-number">1</div>
                <div class="step-content">
                    <div class="step-label">From Account</div>
                    <div class="step-value">${fromAccount.holder}</div>
                </div>
            </div>
            <div class="transfer-arrow">→</div>
            <div class="transfer-step">
                <div class="step-number">2</div>
                <div class="step-content">
                    <div class="step-label">To Account</div>
                    <div class="step-value">${toAccount.holder}</div>
                </div>
            </div>
        </div>
        
        <div class="transfer-summary">
            <div class="summary-row">
                <span>Transfer Amount</span>
                <span class="summary-amount">₹${amount.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Transfer Fee (1%)</span>
                <span class="summary-amount">₹${fee.toFixed(2)}</span>
            </div>
            <div class="summary-row total">
                <span>Total Debit</span>
                <span class="summary-amount">₹${totalDebit.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Available Balance</span>
                <span class="summary-amount" style="color: ${availableBalance >= totalDebit ? '#10b981' : '#ef4444'}">
                    ₹${availableBalance.toFixed(2)}
                </span>
            </div>
            ${availableBalance < totalDebit ? `
                <div style="color: #ef4444; margin-top: 10px; font-size: 0.9em;">
                    ⚠️ Insufficient balance for this transfer
                </div>
            ` : ''}
        </div>
    `;
    
    previewContainer.innerHTML = previewHTML;
    previewContainer.style.display = 'block';
}

function handleTransfer(e) {
    e.preventDefault();
    
    try {
        const fromAccountSelect = document.getElementById('transferFrom');
        const toAccountSelect = document.getElementById('transferTo');
        const amountInput = document.getElementById('transferAmount');
        const noteInput = document.getElementById('transferNote');
        
        if (!fromAccountSelect || !toAccountSelect || !amountInput) {
            showAlert('Form elements not found', 'error');
            return;
        }
        
        const fromAccountNumber = fromAccountSelect.value ? parseInt(fromAccountSelect.value) : null;
        const toAccountNumber = toAccountSelect.value ? parseInt(toAccountSelect.value) : null;
        const amount = parseFloat(amountInput.value) || 0;
        const note = noteInput ? noteInput.value.trim() : '';
        
        // Validation
        if (!fromAccountNumber || !toAccountNumber) {
            showAlert('Please select both source and destination accounts', 'error');
            return;
        }
        
        if (fromAccountNumber === toAccountNumber) {
            showAlert('Cannot transfer to the same account. Please select a different destination.', 'error');
            return;
        }
        
        if (!amount || amount <= 0) {
            showAlert('Please enter a valid transfer amount', 'error');
            return;
        }
        
        if (amount > 1000000) {
            showAlert('Transfer amount cannot exceed ₹10,00,000', 'error');
            return;
        }
        
        // Find accounts
        const fromAccount = bank.accounts.find(acc => acc.accountNumber === fromAccountNumber);
        const toAccount = bank.accounts.find(acc => acc.accountNumber === toAccountNumber);
        
        if (!fromAccount || !toAccount) {
            showAlert('One or both accounts not found', 'error');
            return;
        }
        
        const availableBalance = fromAccount.getAvailableBalance ? fromAccount.getAvailableBalance() : fromAccount.balance;
        
        if (availableBalance < amount) {
            showAlert(`Insufficient balance. Available: ₹${availableBalance.toFixed(2)}`, 'error');
            return;
        }
        
        // Execute transfer
        fromAccount.withdraw(amount);
        toAccount.deposit(amount);
        bank.saveData();
        
        showAlert(`✓ Successfully transferred ₹${amount.toFixed(2)} from ${fromAccount.holder} to ${toAccount.holder}!`, 'success');
        
        // Reset form
        amountInput.value = '';
        noteInput.value = '';
        document.getElementById('transferPreview').style.display = 'none';
        
        // Reload statistics and recent transfers
        loadTransferStatistics();
        loadRecentTransfers();
        
        // Update dashboard if available
        if (window.updateDashboard) {
            updateDashboard();
        }
    } catch (error) {
        console.error('Transfer error:', error);
        showAlert(`Error: ${error.message}`, 'error');
    }
}

function swapAccounts() {
    const fromSelect = document.getElementById('transferFrom');
    const toSelect = document.getElementById('transferTo');
    
    const tempValue = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = tempValue;
    
    updateTransferPreview();
}

function loadTransferStatistics() {
    // Collect all account transfers
    let allTransactions = [];
    
    bank.accounts.forEach(account => {
        account.transactions.forEach(trans => {
            allTransactions.push({
                type: trans.type,
                amount: trans.amount,
                timestamp: trans.timestamp
            });
        });
    });
    
    // Calculate statistics
    const totalCount = allTransactions.length;
    const totalAmount = allTransactions.reduce((sum, t) => sum + t.amount, 0);
    const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;
    
    // Count this month's transfers
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthTransactions = allTransactions.filter(t => new Date(t.timestamp) >= monthStart);
    
    // Update UI
    document.getElementById('totalTransferCount').textContent = totalCount;
    document.getElementById('totalTransferAmount').textContent = `₹${totalAmount.toFixed(2)}`;
    document.getElementById('avgTransferAmount').textContent = `₹${averageAmount.toFixed(2)}`;
    document.getElementById('monthTransferCount').textContent = monthTransactions.length;
}

function loadRecentTransfers() {
    const container = document.getElementById('recentTransfers');
    
    // Collect all transactions
    let allTransactions = [];
    bank.accounts.forEach(account => {
        account.transactions.forEach(trans => {
            allTransactions.push({
                type: trans.type,
                amount: trans.amount,
                timestamp: trans.timestamp,
                account: account.holder,
                accountType: account.type
            });
        });
    });
    
    // Sort by timestamp (newest first) and get last 10
    allTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recentTransactions = allTransactions.slice(0, 10);
    
    if (recentTransactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔄</div>
                <p>No transfers yet</p>
                <small>Your transfers will appear here</small>
            </div>
        `;
        return;
    }
    
    const html = recentTransactions.map(transaction => {
        const icon = transaction.type === 'DEPOSIT' ? '💰' : transaction.type === 'WITHDRAWAL' ? '💸' : '🔄';
        let label = transaction.type;
        let color = '#6b7280';
        let prefix = '';
        
        if (transaction.type === 'DEPOSIT') {
            label = 'Received';
            color = '#10b981';
            prefix = '+';
        } else if (transaction.type === 'WITHDRAWAL') {
            label = 'Sent';
            color = '#ef4444';
            prefix = '-';
        } else if (transaction.type === 'INTEREST') {
            label = 'Interest';
            color = '#8b5cf6';
            prefix = '+';
        }
        
        return `
            <div class="transaction-item">
                <div class="transaction-icon" style="background-color: ${color}; color: white;">
                    ${icon}
                </div>
                <div class="transaction-details">
                    <div class="transaction-type">${label} - ${transaction.account}</div>
                    <div class="transaction-time">${formatDate(transaction.timestamp)}</div>
                </div>
                <div class="transaction-amount" style="color: ${color}; font-weight: 600;">
                    ${prefix}₹${transaction.amount.toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}
