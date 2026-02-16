// Settings Page Script

let selectedImportFile = null;

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateSystemInfo();
    populateSavingsList();
});

function setupEventListeners() {
    const importInput = document.getElementById('importFile');
    
    if (importInput) {
        importInput.addEventListener('change', handleFileImport);
    }
}

// ========== Export Functions ==========

function exportAccounts() {
    try {
        const dataStr = JSON.stringify(bank.accounts, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `python-bank-accounts-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        showAlert('✓ Accounts exported successfully!', 'success');
    } catch (error) {
        showAlert(`Error exporting accounts: ${error.message}`, 'error');
    }
}

function exportTransactions() {
    try {
        const allTransactions = [];
        bank.accounts.forEach(account => {
            account.transactions.forEach(transaction => {
                allTransactions.push({
                    accountId: account.id,
                    accountName: account.name,
                    ...transaction
                });
            });
        });
        
        const dataStr = JSON.stringify(allTransactions, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `python-bank-transactions-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        showAlert('✓ Transactions exported successfully!', 'success');
    } catch (error) {
        showAlert(`Error exporting transactions: ${error.message}`, 'error');
    }
}

function exportComplete() {
    try {
        const completeData = {
            accounts: bank.accounts,
            exportDate: new Date().toISOString(),
            totalBalance: bank.accounts.reduce((sum, acc) => sum + acc.balance, 0),
            totalTransactions: bank.accounts.reduce((sum, acc) => sum + acc.transactions.length, 0)
        };
        
        const dataStr = JSON.stringify(completeData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `python-bank-complete-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        showAlert('✓ Complete data exported successfully!', 'success');
    } catch (error) {
        showAlert(`Error exporting complete data: ${error.message}`, 'error');
    }
}

// ========== Import Functions ==========

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    selectedImportFile = file;
    const fileNameEl = document.getElementById('importFileName');
    const confirmBtn = document.getElementById('confirmImportBtn');
    
    if (fileNameEl) {
        fileNameEl.textContent = `✓ ${file.name} selected (${(file.size / 1024).toFixed(2)} KB)`;
    }
    
    if (confirmBtn) {
        confirmBtn.style.display = 'block';
    }
    
    showAlert(`✓ File selected: ${file.name}. Click "Import Data" to confirm.`, 'info');
}

function confirmImport() {
    if (!selectedImportFile) {
        showAlert('No file selected. Please choose a file first.', 'error');
        return;
    }
    
    if (!confirm('⚠️ This will replace all current accounts and transactions. Export your current data first if needed. Continue?')) {
        return;
    }
    
    if (!confirm('This is your last warning. Import data from selected file?')) {
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const jsonData = e.target.result;
            const parsedData = JSON.parse(jsonData);
            
            // Handle both complete export format and accounts-only format
            const accountsToImport = Array.isArray(parsedData) ? parsedData : (parsedData.accounts || parsedData);
            
            if (!Array.isArray(accountsToImport)) {
                throw new Error('Invalid file format. Expected accounts array.');
            }
            
            bank.accounts = accountsToImport;
            bank.saveData();
            
            selectedImportFile = null;
            const fileNameEl = document.getElementById('importFileName');
            const confirmBtn = document.getElementById('confirmImportBtn');
            
            if (fileNameEl) {
                fileNameEl.textContent = 'No file selected';
            }
            if (confirmBtn) {
                confirmBtn.style.display = 'none';
            }
            
            document.getElementById('importFile').value = '';
            
            showAlert('✓ Data imported successfully! Reloading...', 'success');
            updateSystemInfo();
            populateSavingsList();
            
            setTimeout(() => location.reload(), 1500);
        } catch (error) {
            showAlert(`Error importing data: ${error.message}`, 'error');
        }
    };
    
    reader.readAsText(selectedImportFile);
}

// ========== Interest Functions ==========

function populateSavingsList() {
    const savingsList = document.getElementById('savingsList');
    if (!savingsList) return;
    
    const savingsAccounts = bank.accounts.filter(acc => acc.type === 'Savings');
    
    if (savingsAccounts.length === 0) {
        savingsList.innerHTML = '<div class="empty-state"><p style="margin: 0;">No savings accounts found</p></div>';
        return;
    }
    
    let html = '';
    savingsAccounts.forEach(account => {
        const monthlyInterest = account.balance * (account.interestRate / 100 / 12);
        html += `
            <div class="savings-item">
                <div style="flex: 1;">
                    <strong>${account.name}</strong>
                    <div style="font-size: 0.85rem; color: var(--text-dim);">
                        Balance: ₹${account.balance.toFixed(2)} • Rate: ${account.interestRate}%
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="color: var(--success-color); font-size: 0.9rem;">
                        ~₹${monthlyInterest.toFixed(2)}/month
                    </div>
                </div>
            </div>
        `;
    });
    
    savingsList.innerHTML = html;
}

function applyInterest() {
    try {
        let interestApplied = 0;
        let totalInterest = 0;
        
        bank.accounts.forEach(account => {
            if (account.type === 'Savings' && account.applyInterest) {
                const previousBalance = account.balance;
                account.applyInterest();
                const interestEarned = account.balance - previousBalance;
                totalInterest += interestEarned;
                interestApplied++;
            }
        });
        
        bank.saveData();
        
        if (interestApplied === 0) {
            showAlert('No savings accounts found to apply interest', 'info');
        } else {
            showAlert(
                `✓ Interest applied! ${interestApplied} account(s) earned ₹${totalInterest.toFixed(2)} in interest`,
                'success'
            );
            updateSystemInfo();
            populateSavingsList();
        }
    } catch (error) {
        showAlert(`Error applying interest: ${error.message}`, 'error');
    }
}

// ========== Demo Data Functions ==========

function createDemoData() {
    if (confirm('🎮 This will create demo accounts with sample transactions. Continue?')) {
        try {
            // Clear existing data
            bank.accounts = [];
            
            // Create demo accounts
            const basicAcc = new BankAccount('Demo Basic Account', 'Basic', 50000);
            const savingsAcc = new SavingsAccount('Demo Savings Account', 100000, 6.5);
            const checkingAcc = new CheckingAccount('Demo Checking Account', 25000, 5000);
            
            bank.accounts.push(basicAcc, savingsAcc, checkingAcc);
            
            // Add sample transactions
            basicAcc.deposit(5000);
            basicAcc.withdraw(2000);
            savingsAcc.deposit(15000);
            checkingAcc.withdraw(3000);
            
            bank.saveData();
            showAlert('✓ Demo data created successfully!', 'success');
            updateSystemInfo();
            populateSavingsList();
            setTimeout(() => location.reload(), 1500);
        } catch (error) {
            showAlert(`Error creating demo data: ${error.message}`, 'error');
        }
    }
}

// ========== Data Management Functions ==========

function clearAllData() {
    if (confirm('⚠️ This will permanently delete ALL accounts and transactions. This cannot be undone. Are you absolutely sure?')) {
        if (confirm('🗑️ This is your last warning. Type "YES" in the next prompt to delete everything.')) {
            try {
                bank.accounts = [];
                bank.saveData();
                showAlert('✓ All data has been cleared', 'success');
                updateSystemInfo();
                populateSavingsList();
                setTimeout(() => location.reload(), 1500);
            } catch (error) {
                showAlert(`Error clearing data: ${error.message}`, 'error');
            }
        }
    }
}

// ========== System Information Functions ==========

function updateSystemInfo() {
    const totalAccountsEl = document.getElementById('totalAccountsInfo');
    const totalBalanceEl = document.getElementById('totalBalanceInfo');
    const totalTransEl = document.getElementById('totalTransInfo');
    const storageUsedEl = document.getElementById('storageUsed');
    
    const totalAccounts = bank.accounts.length;
    const totalBalance = bank.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalTransactions = bank.accounts.reduce((sum, acc) => sum + acc.transactions.length, 0);
    
    if (totalAccountsEl) {
        totalAccountsEl.textContent = totalAccounts;
    }
    
    if (totalBalanceEl) {
        totalBalanceEl.textContent = `₹${totalBalance.toFixed(2)}`;
    }
    
    if (totalTransEl) {
        totalTransEl.textContent = totalTransactions;
    }
    
    if (storageUsedEl) {
        try {
            const data = localStorage.getItem('pythonBankData');
            const sizeInBytes = data ? data.length : 0;
            const sizeInKB = (sizeInBytes / 1024).toFixed(2);
            storageUsedEl.textContent = `${sizeInKB} KB`;
        } catch (error) {
            storageUsedEl.textContent = 'Unable to calculate';
        }
    }
}
