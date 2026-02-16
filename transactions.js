// Transactions Page Script

document.addEventListener('DOMContentLoaded', function() {
    loadAccountSelects();
    setupEventListeners();
    setupFormPreviews();
    loadAllTransactionHistory();
});

function loadAccountSelects() {
    // Load deposit account select
    const depositAccountSelect = document.getElementById('depositAccount');
    if (depositAccountSelect) {
        depositAccountSelect.innerHTML = '<option value="">Choose an account...</option>';
        bank.accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.accountNumber;
            option.textContent = `${account.holder} - ${account.type} (#${account.accountNumber})`;
            depositAccountSelect.appendChild(option);
        });
    }
    
    // Load withdraw account select
    const withdrawAccountSelect = document.getElementById('withdrawAccount');
    if (withdrawAccountSelect) {
        withdrawAccountSelect.innerHTML = '<option value="">Choose an account...</option>';
        bank.accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.accountNumber;
            option.textContent = `${account.holder} - ${account.type} (#${account.accountNumber})`;
            withdrawAccountSelect.appendChild(option);
        });
    }
    
    // Load history account select
    const historyAccountSelect = document.getElementById('historyAccount');
    if (historyAccountSelect) {
        historyAccountSelect.innerHTML = '<option value="all">All Accounts</option>';
        bank.accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.accountNumber;
            option.textContent = `${account.holder} (#${account.accountNumber})`;
            historyAccountSelect.appendChild(option);
        });
    }
}

function setupEventListeners() {
    const depositForm = document.getElementById('depositForm');
    const withdrawForm = document.getElementById('withdrawForm');
    
    if (depositForm) {
        depositForm.addEventListener('submit', handleDeposit);
    }
    
    if (withdrawForm) {
        withdrawForm.addEventListener('submit', handleWithdraw);
    }
    
    // Deposit account change
    const depositAccountSelect = document.getElementById('depositAccount');
    if (depositAccountSelect) {
        depositAccountSelect.addEventListener('change', updateDepositPreview);
    }
    
    // Withdraw account change
    const withdrawAccountSelect = document.getElementById('withdrawAccount');
    if (withdrawAccountSelect) {
        withdrawAccountSelect.addEventListener('change', updateWithdrawPreview);
    }
    
    // Amount inputs
    const depositAmount = document.getElementById('depositAmount');
    if (depositAmount) {
        depositAmount.addEventListener('input', updateDepositPreview);
    }
    
    const withdrawAmount = document.getElementById('withdrawAmount');
    if (withdrawAmount) {
        withdrawAmount.addEventListener('input', updateWithdrawPreview);
    }
    
    // History filters
    const historyAccount = document.getElementById('historyAccount');
    const historyType = document.getElementById('historyType');
    const historyPeriod = document.getElementById('historyPeriod');
    
    if (historyAccount) historyAccount.addEventListener('change', filterHistory);
    if (historyType) historyType.addEventListener('change', filterHistory);
    if (historyPeriod) historyPeriod.addEventListener('change', filterHistory);
}

function setupFormPreviews() {
    // Load all account selects when DOM is ready
    loadAccountSelects();
}

function switchTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Mark button as active
    const selectedButton = Array.from(tabButtons).find(btn => {
        const onclick = btn.getAttribute('onclick');
        return onclick && onclick.includes(`switchTab('${tabName}')`);
    });
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
}

function updateDepositPreview() {
    const accountSelect = document.getElementById('depositAccount');
    const amountInput = document.getElementById('depositAmount');
    const preview = document.getElementById('depositPreview');
    const currentBalanceEl = document.getElementById('depositCurrentBalance');
    const newBalanceEl = document.getElementById('depositNewBalance');
    
    if (!accountSelect.value || !amountInput.value) {
        if (preview) preview.style.display = 'none';
        return;
    }
    
    const account = bank.findAccount(parseInt(accountSelect.value));
    if (!account) {
        if (preview) preview.style.display = 'none';
        return;
    }
    
    const amount = parseFloat(amountInput.value) || 0;
    const currentBalance = account.balance;
    const newBalance = currentBalance + amount;
    
    if (currentBalanceEl) {
        currentBalanceEl.textContent = `₹${currentBalance.toFixed(2)}`;
    }
    if (newBalanceEl) {
        newBalanceEl.textContent = `₹${newBalance.toFixed(2)}`;
    }
    
    if (preview && amount > 0) {
        preview.style.display = 'block';
    } else if (preview) {
        preview.style.display = 'none';
    }
}

function updateWithdrawPreview() {
    const accountSelect = document.getElementById('withdrawAccount');
    const amountInput = document.getElementById('withdrawAmount');
    const preview = document.getElementById('withdrawPreview');
    const currentBalanceEl = document.getElementById('withdrawCurrentBalance');
    const availableEl = document.getElementById('withdrawAvailable');
    const newBalanceEl = document.getElementById('withdrawNewBalance');
    
    if (!accountSelect.value || !amountInput.value) {
        if (preview) preview.style.display = 'none';
        return;
    }
    
    const account = bank.findAccount(parseInt(accountSelect.value));
    if (!account) {
        if (preview) preview.style.display = 'none';
        return;
    }
    
    const amount = parseFloat(amountInput.value) || 0;
    const currentBalance = account.balance;
    const availableBalance = account.getAvailableBalance ? account.getAvailableBalance() : currentBalance;
    const newBalance = currentBalance - amount;
    
    if (currentBalanceEl) {
        currentBalanceEl.textContent = `₹${currentBalance.toFixed(2)}`;
    }
    if (availableEl) {
        const balanceColor = availableBalance < amount ? '#ef4444' : '#10b981';
        availableEl.innerHTML = `<span style="color: ${balanceColor};">₹${availableBalance.toFixed(2)}</span>`;
    }
    if (newBalanceEl) {
        const balanceColor = newBalance < 0 ? '#ef4444' : '#10b981';
        newBalanceEl.innerHTML = `<span style="color: ${balanceColor};">₹${newBalance.toFixed(2)}</span>`;
    }
    
    if (preview && amount > 0) {
        preview.style.display = 'block';
    } else if (preview) {
        preview.style.display = 'none';
    }
}

function setDepositAmount(amount) {
    const depositAmount = document.getElementById('depositAmount');
    if (depositAmount) {
        depositAmount.value = amount;
        updateDepositPreview();
        depositAmount.focus();
    }
}

function setWithdrawAmount(amount) {
    const withdrawAmount = document.getElementById('withdrawAmount');
    if (withdrawAmount) {
        withdrawAmount.value = amount;
        updateWithdrawPreview();
        withdrawAmount.focus();
    }
}

function handleDeposit(e) {
    e.preventDefault();
    
    try {
        const accountSelect = document.getElementById('depositAccount');
        const amountInput = document.getElementById('depositAmount');
        const noteInput = document.getElementById('depositNote');
        
        const accountNumber = parseInt(accountSelect.value);
        const amount = parseFloat(amountInput.value);
        const note = noteInput ? noteInput.value.trim() : '';
        
        if (!accountNumber) {
            showAlert('Please select an account', 'error');
            return;
        }
        
        if (!amount || amount <= 0) {
            showAlert('Please enter a valid amount greater than ₹0', 'error');
            return;
        }
        
        if (amount > 1000000) {
            showAlert('Deposit amount cannot exceed ₹10,00,000', 'error');
            return;
        }
        
        const account = bank.findAccount(accountNumber);
        if (!account) {
            showAlert('Account not found', 'error');
            return;
        }
        
        // Process deposit
        account.deposit(amount);
        bank.saveData();
        
        // Show success message
        showAlert(`✓ Successfully deposited ₹${amount.toFixed(2)} to ${account.holder}'s ${account.type} account!`, 'success');
        
        // Reset form and preview
        document.getElementById('depositForm').reset();
        document.getElementById('depositPreview').style.display = 'none';
        
        // Reload history
        loadAllTransactionHistory();
        
        // Update dashboard if available
        if (window.updateDashboard) {
            updateDashboard();
        }
    } catch (error) {
        showAlert(`Error: ${error.message}`, 'error');
    }
}

function handleWithdraw(e) {
    e.preventDefault();
    
    try {
        const accountSelect = document.getElementById('withdrawAccount');
        const amountInput = document.getElementById('withdrawAmount');
        const noteInput = document.getElementById('withdrawNote');
        
        const accountNumber = parseInt(accountSelect.value);
        const amount = parseFloat(amountInput.value);
        const note = noteInput ? noteInput.value.trim() : '';
        
        if (!accountNumber) {
            showAlert('Please select an account', 'error');
            return;
        }
        
        if (!amount || amount <= 0) {
            showAlert('Please enter a valid amount greater than ₹0', 'error');
            return;
        }
        
        if (amount > 1000000) {
            showAlert('Withdrawal amount cannot exceed ₹10,00,000', 'error');
            return;
        }
        
        const account = bank.findAccount(accountNumber);
        if (!account) {
            showAlert('Account not found', 'error');
            return;
        }
        
        const availableBalance = account.getAvailableBalance ? account.getAvailableBalance() : account.balance;
        
        if (amount > availableBalance) {
            showAlert(`Insufficient balance. Available: ₹${availableBalance.toFixed(2)}`, 'error');
            return;
        }
        
        // Process withdrawal
        account.withdraw(amount);
        bank.saveData();
        
        // Show success message
        showAlert(`✓ Successfully withdrawn ₹${amount.toFixed(2)} from ${account.holder}'s ${account.type} account!`, 'success');
        
        // Reset form and preview
        document.getElementById('withdrawForm').reset();
        document.getElementById('withdrawPreview').style.display = 'none';
        
        // Reload history
        loadAllTransactionHistory();
        
        // Update dashboard if available
        if (window.updateDashboard) {
            updateDashboard();
        }
    } catch (error) {
        showAlert(`Error: ${error.message}`, 'error');
    }
}

function loadAllTransactionHistory() {
    const historyContainer = document.getElementById('transactionHistory');
    if (!historyContainer) return;
    
    // Collect all transactions from all accounts
    let allTransactions = [];
    
    bank.accounts.forEach(account => {
        account.transactions.forEach(trans => {
            allTransactions.push({
                ...trans,
                accountNumber: account.accountNumber,
                holderName: account.holder,
                accountType: account.type
            });
        });
    });
    
    // Sort by timestamp (newest first)
    allTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (allTransactions.length === 0) {
        historyContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <p>No transactions found</p>
                <small>Your transactions will appear here</small>
            </div>
        `;
        return;
    }
    
    displayTransactionHistory(allTransactions);
}

function displayTransactionHistory(transactions) {
    const historyContainer = document.getElementById('transactionHistory');
    if (!historyContainer) return;
    
    if (transactions.length === 0) {
        historyContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <p>No transactions matching your filters</p>
                <small>Try adjusting your search criteria</small>
            </div>
        `;
        return;
    }
    
    const html = transactions.map(trans => {
        const typeEmoji = {
            'DEPOSIT': '💸',
            'WITHDRAWAL': '💵',
            'TRANSFER': '🔄',
            'INTEREST': '📈'
        }[trans.type] || '💳';
        
        const amountClass = trans.type === 'WITHDRAWAL' ? 'withdrawal' : 'deposit';
        const amountPrefix = trans.type === 'WITHDRAWAL' ? '- ' : '+ ';
        
        return `
            <div class="transaction-item">
                <div class="transaction-icon" style="background-color: ${getTransactionColor(trans.type)}; color: white;">
                    ${typeEmoji}
                </div>
                <div class="transaction-details">
                    <div class="transaction-type">${trans.type} - ${trans.holderName}</div>
                    <div class="transaction-time">${formatDate(trans.timestamp)}</div>
                </div>
                <div class="transaction-amount ${amountClass}">
                    ${amountPrefix}₹${trans.amount.toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
    
    historyContainer.innerHTML = html;
}

function getTransactionColor(type) {
    const colors = {
        'DEPOSIT': '#10b981',
        'WITHDRAWAL': '#ef4444',
        'TRANSFER': '#3b82f6',
        'INTEREST': '#8b5cf6'
    };
    return colors[type] || '#6b7280';
}

function filterHistory() {
    const accountSelect = document.getElementById('historyAccount');
    const typeSelect = document.getElementById('historyType');
    const periodSelect = document.getElementById('historyPeriod');
    
    const selectedAccount = accountSelect.value;
    const selectedType = typeSelect.value;
    const selectedPeriod = periodSelect.value;
    
    // Collect all transactions
    let allTransactions = [];
    bank.accounts.forEach(account => {
        account.transactions.forEach(trans => {
            allTransactions.push({
                ...trans,
                accountNumber: account.accountNumber,
                holderName: account.holder,
                accountType: account.type
            });
        });
    });
    
    // Filter by account
    if (selectedAccount !== 'all') {
        allTransactions = allTransactions.filter(t => t.accountNumber === parseInt(selectedAccount));
    }
    
    // Filter by type
    if (selectedType !== 'all') {
        allTransactions = allTransactions.filter(t => t.type === selectedType);
    }
    
    // Filter by period
    if (selectedPeriod !== 'all') {
        const now = new Date();
        const startDate = new Date();
        
        switch(selectedPeriod) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(now.getDate() - 7);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'month':
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                break;
        }
        
        allTransactions = allTransactions.filter(t => {
            const transDate = new Date(t.timestamp);
            return transDate >= startDate;
        });
    }
    
    // Sort by timestamp (newest first)
    allTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    displayTransactionHistory(allTransactions);
}
