// Accounts Page Script

document.addEventListener('DOMContentLoaded', function() {
    loadAccounts();
    setupEventListeners();
});

function setupEventListeners() {
    const createAccountForm = document.getElementById('createAccountForm');
    if (createAccountForm) {
        createAccountForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createNewAccount();
        });
    }
    
    const accountTypeSelect = document.getElementById('accountType');
    if (accountTypeSelect) {
        accountTypeSelect.addEventListener('change', updateAccountTypeInfo);
    }
    
    const importFile = document.getElementById('importFile');
    if (importFile) {
        importFile.addEventListener('change', handleFileSelect);
    }
}

function updateAccountTypeInfo() {
    const type = document.getElementById('accountType').value;
    const info = document.getElementById('accountTypeInfo');
    const interestGroup = document.getElementById('interestRateGroup');
    const overdraftGroup = document.getElementById('overdraftGroup');
    
    let html = '';
    
    switch(type) {
        case 'savings':
            html = '<h4>🏦 Savings Account</h4><p>Earn interest on your savings. Perfect for building wealth with automatic interest calculations.</p>';
            if (interestGroup) interestGroup.style.display = 'block';
            if (overdraftGroup) overdraftGroup.style.display = 'none';
            break;
        case 'checking':
            html = '<h4>🏧 Checking Account</h4><p>Everyday account with overdraft protection. Best for frequent transactions and bill payments.</p>';
            if (interestGroup) interestGroup.style.display = 'none';
            if (overdraftGroup) overdraftGroup.style.display = 'block';
            break;
        default:
            html = '<h4>💎 Basic Account</h4><p>A standard account with basic deposit and withdrawal features. No interest earned, no overdraft protection.</p>';
            if (interestGroup) interestGroup.style.display = 'none';
            if (overdraftGroup) overdraftGroup.style.display = 'none';
    }
    
    if (info) {
        info.innerHTML = html;
    }
}

function createNewAccount() {
    try {
        const holderName = document.getElementById('holderName').value.trim();
        const accountType = document.getElementById('accountType').value;
        const initialDeposit = parseFloat(document.getElementById('initialDeposit').value) || 0;
        
        if (!holderName) {
            showAlert('Please enter account holder name', 'error');
            return;
        }
        
        const options = {};
        
        if (accountType === 'savings') {
            options.interestRate = parseFloat(document.getElementById('interestRate').value) / 100 || 0.02;
        } else if (accountType === 'checking') {
            options.overdraftLimit = parseFloat(document.getElementById('overdraftLimit').value) || 1000;
        }
        
        const newAccount = bank.createAccount(accountType, holderName, initialDeposit, options);
        
        showAlert(`✓ Account created successfully! Account #${newAccount.accountNumber}`, 'success');
        
        // Reset form
        document.getElementById('createAccountForm').reset();
        hideCreateForm();
        
        // Reload accounts display
        loadAccounts();
        
        // Update dashboard if on dashboard
        if (window.updateDashboard) {
            updateDashboard();
        }
    } catch (error) {
        showAlert(`Error: ${error.message}`, 'error');
    }
}

function showCreateForm() {
    const card = document.getElementById('createAccountCard');
    if (card) {
        card.style.display = 'block';
        document.getElementById('accountType').value = 'basic';
        updateAccountTypeInfo();
    }
}

function hideCreateForm() {
    const card = document.getElementById('createAccountCard');
    if (card) {
        card.style.display = 'none';
    }
}

function loadAccounts() {
    const accountsGrid = document.getElementById('accountsGrid');
    if (!accountsGrid) return;
    
    const accounts = bank.accounts;
    
    if (accounts.length === 0) {
        accountsGrid.innerHTML = `
            <div class="empty-state-large">
                <div class="empty-state-icon">🏦</div>
                <h3>No Accounts Yet</h3>
                <p>Create your first account to start banking with Unix Bank</p>
                <button class="btn btn-primary" onclick="showCreateForm()">Create Your First Account</button>
            </div>
        `;
        return;
    }
    
    accountsGrid.innerHTML = accounts.map(account => `
        <div class="account-card" onclick="viewAccountDetails(${account.accountNumber})">
            <div class="account-card-header">
                <div>
                    <div class="account-name">${account.holder}</div>
                    <div class="account-number">Account #${account.accountNumber}</div>
                </div>
                <span class="account-type-badge">${account.type}</span>
            </div>
            <div class="account-balance">
                <div class="balance-label">Current Balance</div>
                <div class="balance-amount">₹${account.balance.toFixed(2)}</div>
            </div>
            <div class="account-actions">
                <button class="btn btn-primary" onclick="handleDeposit(event, ${account.accountNumber})">Deposit</button>
                <button class="btn btn-secondary" onclick="handleWithdraw(event, ${account.accountNumber})">Withdraw</button>
            </div>
        </div>
    `).join('');
}

function viewAccountDetails(accountNumber) {
    const account = bank.findAccount(accountNumber);
    const modal = document.getElementById('accountModal');
    const details = document.getElementById('accountDetails');
    
    const typeEmoji = {
        'Basic': '💎',
        'Savings': '🏦',
        'Checking': '🏧'
    }[account.type] || '💳';
    
    let html = `
        <h3>${typeEmoji} ${account.holder} - Account #${account.accountNumber}</h3>
        <div class="account-details-grid">
            <div class="detail-item">
                <label>Account Type</label>
                <span>${account.type}</span>
            </div>
            <div class="detail-item">
                <label>Status</label>
                <span>${account.isActive ? '✓ Active' : '✗ Closed'}</span>
            </div>
            <div class="detail-item">
                <label>Current Balance</label>
                <span class="highlight">₹${account.balance.toFixed(2)}</span>
            </div>
    `;
    
    if (account.type === 'Savings') {
        html += `
            <div class="detail-item">
                <label>Interest Rate</label>
                <span>${(account.interestRate * 100).toFixed(1)}%</span>
            </div>
        `;
    }
    
    if (account.type === 'Checking') {
        html += `
            <div class="detail-item">
                <label>Overdraft Limit</label>
                <span>₹${account.overdraftLimit.toFixed(2)}</span>
            </div>
            <div class="detail-item">
                <label>Available Balance</label>
                <span>₹${account.getAvailableBalance().toFixed(2)}</span>
            </div>
        `;
    }
    
    html += `
        </div>
        <h4 style="margin-top: 20px; margin-bottom: 15px;">Transaction History</h4>
        <div class="transaction-list">
    `;
    
    if (account.transactions.length === 0) {
        html += '<div class="empty-state"><p>No transactions yet</p></div>';
    } else {
        html += account.transactions.map(trans => `
            <div class="transaction-item">
                <div class="transaction-icon ${getTransactionClass(trans.type)}">${getTransactionIcon(trans.type)}</div>
                <div class="transaction-details">
                    <div class="transaction-type">${trans.type}</div>
                    <div class="transaction-time">${formatDate(trans.timestamp)}</div>
                </div>
                <div class="transaction-amount ${getAmountClass(trans.type)}">
                    ${getAmountPrefix(trans.type)}₹${trans.amount.toFixed(2)}
                </div>
            </div>
        `).join('');
    }
    
    html += '</div>';
    
    details.innerHTML = html;
    modal.classList.add('active');
}

function closeAccountModal() {
    const modal = document.getElementById('accountModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function handleDeposit(e, accountNumber) {
    e.stopPropagation();
    closeAccountModal();
    window.location.href = `transactions.html?action=deposit&account=${accountNumber}`;
}

function handleWithdraw(e, accountNumber) {
    e.stopPropagation();
    closeAccountModal();
    window.location.href = `transactions.html?action=withdraw&account=${accountNumber}`;
}

function filterAccounts() {
    const filterType = document.getElementById('filterType').value;
    const accounts = filterType === 'all' 
        ? bank.accounts 
        : bank.accounts.filter(acc => acc.type === filterType);
    
    displayAccounts(accounts);
}

function sortAccounts() {
    const sortBy = document.getElementById('sortBy').value;
    let sorted = [...bank.accounts];
    
    switch(sortBy) {
        case 'newest':
            sorted.reverse();
            break;
        case 'oldest':
            break;
        case 'balance-high':
            sorted.sort((a, b) => b.balance - a.balance);
            break;
        case 'balance-low':
            sorted.sort((a, b) => a.balance - b.balance);
            break;
        case 'name':
            sorted.sort((a, b) => a.holder.localeCompare(b.holder));
            break;
    }
    
    displayAccounts(sorted);
}

function searchAccounts() {
    const searchTerm = document.getElementById('searchAccount').value.toLowerCase();
    const filtered = bank.accounts.filter(acc => 
        acc.holder.toLowerCase().includes(searchTerm) ||
        acc.accountNumber.toString().includes(searchTerm)
    );
    
    displayAccounts(filtered);
}

function displayAccounts(accounts) {
    const accountsGrid = document.getElementById('accountsGrid');
    if (!accountsGrid) return;
    
    if (accounts.length === 0) {
        accountsGrid.innerHTML = `
            <div style="grid-column: 1/-1;">
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <p>No accounts found</p>
                </div>
            </div>
        `;
        return;
    }
    
    accountsGrid.innerHTML = accounts.map(account => `
        <div class="account-card" onclick="viewAccountDetails(${account.accountNumber})">
            <div class="account-card-header">
                <div>
                    <div class="account-name">${account.holder}</div>
                    <div class="account-number">Account #${account.accountNumber}</div>
                </div>
                <span class="account-type-badge">${account.type}</span>
            </div>
            <div class="account-balance">
                <div class="balance-label">Current Balance</div>
                <div class="balance-amount">₹${account.balance.toFixed(2)}</div>
            </div>
            <div class="account-actions">
                <button class="btn btn-primary" onclick="handleDeposit(event, ${account.accountNumber})">Deposit</button>
                <button class="btn btn-secondary" onclick="handleWithdraw(event, ${account.accountNumber})">Withdraw</button>
            </div>
        </div>
    `).join('');
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    document.getElementById('importFileName').textContent = file.name;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const jsonData = e.target.result;
            bank.importData(jsonData);
            showAlert('✓ Data imported successfully!', 'success');
            loadAccounts();
        } catch (error) {
            showAlert(`Error importing data: ${error.message}`, 'error');
        }
    };
    reader.readAsText(file);
}
