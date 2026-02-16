// Dashboard Page Script

document.addEventListener('DOMContentLoaded', function() {
    updateDashboard();
    setupNavigation();
});

function setupNavigation() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function updateDashboard() {
    updateStats();
    updateAccountDistribution();
    updateRecentTransactions();
}

function updateStats() {
    const totalAccountsElement = document.getElementById('totalAccounts');
    const totalBalanceElement = document.getElementById('totalBalance');
    const accountTypesElement = document.getElementById('accountTypes');
    const totalTransactionsElement = document.getElementById('totalTransactions');
    
    const totalAccounts = bank.accounts.length;
    const totalBalance = bank.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const accountTypes = [...new Set(bank.accounts.map(acc => acc.type))].length;
    const totalTransactions = bank.accounts.reduce((sum, acc) => sum + acc.transactions.length, 0);
    
    if (totalAccountsElement) totalAccountsElement.textContent = totalAccounts;
    if (totalBalanceElement) totalBalanceElement.textContent = `₹${totalBalance.toFixed(2)}`;
    if (accountTypesElement) accountTypesElement.textContent = accountTypes;
    if (totalTransactionsElement) totalTransactionsElement.textContent = totalTransactions;
}

function updateAccountDistribution() {
    const distributionGrid = document.getElementById('accountDistribution');
    if (!distributionGrid) return;
    
    const accountTypes = {};
    bank.accounts.forEach(account => {
        accountTypes[account.type] = (accountTypes[account.type] || 0) + 1;
    });
    
    const typeEmojis = {
        'Basic': '💎',
        'Savings': '🏦',
        'Checking': '🏧'
    };
    
    const html = Object.entries(accountTypes).map(([type, count]) => `
        <div class="stat-item">
            <div class="stat-icon">${typeEmojis[type] || '💳'}</div>
            <div class="stat-info">
                <div class="stat-label">${type} Accounts</div>
                <div class="stat-value">${count}</div>
            </div>
        </div>
    `).join('');
    
    distributionGrid.innerHTML = html;
}

function updateRecentTransactions() {
    const recentListElement = document.getElementById('recentTransactionsList');
    if (!recentListElement) return;
    
    // Collect all transactions from all accounts
    const allTransactions = [];
    bank.accounts.forEach(account => {
        account.transactions.forEach(trans => {
            allTransactions.push({
                ...trans,
                accountNumber: account.accountNumber,
                holderName: account.holder
            });
        });
    });
    
    // Sort by timestamp (newest first) and get last 5
    const recentTransactions = allTransactions
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
    
    if (recentTransactions.length === 0) {
        recentListElement.innerHTML = `
            <div class="empty-state">
                <p>No transactions yet. Create an account and make a transaction to see them here.</p>
            </div>
        `;
        return;
    }
    
    const html = recentTransactions.map(trans => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-icon ${getTransactionClass(trans.type)}">${getTransactionIcon(trans.type)}</div>
                <div class="transaction-details">
                    <div class="transaction-type">${trans.type} - ${trans.holderName}</div>
                    <div class="transaction-time">${formatDate(trans.timestamp)}</div>
                </div>
            </div>
            <div class="transaction-amount ${getAmountClass(trans.type)}">
                ${getAmountPrefix(trans.type)}₹${trans.amount.toFixed(2)}
            </div>
        </div>
    `).join('');
    
    recentListElement.innerHTML = html;
}

function createNewAccountQuick() {
    window.location.href = 'accounts.html#new';
}

function goToTransactions() {
    window.location.href = 'transactions.html';
}

function goToTransfer() {
    window.location.href = 'transfer.html';
}
