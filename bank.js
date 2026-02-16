// Banking System Core Logic
//bank.js

// Transaction Class
class Transaction {
    constructor(type, amount, balanceAfter) {
        this.timestamp = new Date();
        this.type = type;
        this.amount = amount;
        this.balanceAfter = balanceAfter;
    }
}

// Base BankAccount Class
class BankAccount {
    static accountCounter = 1000;
    
    constructor(holder, initialBalance = 0) {
        if (initialBalance < 0) {
            throw new Error('Initial balance cannot be negative');
        }
        
        this.accountNumber = BankAccount.accountCounter++;
        this.holder = holder;
        this.balance = initialBalance;
        this.transactions = [];
        this.isActive = true;
        this.type = 'Basic';
        
        if (initialBalance > 0) {
            this.recordTransaction('INITIAL DEPOSIT', initialBalance);
        }
    }
    
    deposit(amount) {
        if (amount <= 0) {
            throw new Error('Deposit amount must be positive');
        }
        if (!this.isActive) {
            throw new Error('Account is closed');
        }
        
        this.balance += amount;
        this.recordTransaction('DEPOSIT', amount);
    }
    
    withdraw(amount) {
        if (amount <= 0) {
            throw new Error('Withdrawal amount must be positive');
        }
        if (!this.isActive) {
            throw new Error('Account is closed');
        }
        if (amount > this.balance) {
            throw new Error(`Insufficient funds. Available: ₹${this.balance.toFixed(2)}`);
        
        }
        
        this.balance -= amount;
        this.recordTransaction('WITHDRAWAL', amount);
    }
    
    recordTransaction(type, amount) {
        this.transactions.push(new Transaction(type, amount, this.balance));
    }
    
    getAvailableBalance() {
        return this.balance;
    }
}

// SavingsAccount Class
class SavingsAccount extends BankAccount {
    constructor(holder, initialBalance = 0, interestRate = 0.02) {
        super(holder, initialBalance);
        this.interestRate = interestRate;
        this.type = 'Savings';
    }
    
    applyInterest() {
        if (!this.isActive) {
            throw new Error('Cannot apply interest to closed account');
        }
        
        const interest = this.balance * this.interestRate;
        this.balance += interest;
        this.recordTransaction('INTEREST', interest);
        return interest;
    }
}

// CheckingAccount Class
class CheckingAccount extends BankAccount {
    constructor(holder, initialBalance = 0, overdraftLimit = 100) {
        super(holder, initialBalance);
        this.overdraftLimit = overdraftLimit;
        this.type = 'Checking';
    }
    
    withdraw(amount) {
        if (amount <= 0) {
            throw new Error('Withdrawal amount must be positive');
        }
        if (!this.isActive) {
            throw new Error('Account is closed');
        }
        if (amount > (this.balance + this.overdraftLimit)) {
            throw new Error(`Insufficient funds. Available: ₹${this.balance.toFixed(2)} + Overdraft: ₹${this.overdraftLimit.toFixed(2)}`);
        }
        
        this.balance -= amount;
        this.recordTransaction('WITHDRAWAL', amount);
    }
    
    getAvailableBalance() {
        return this.balance + this.overdraftLimit;
    }
}

// Bank Class
class Bank {
    constructor(name) {
        this.name = name;
        this.accounts = [];
        this.loadFromStorage();
    }
    
    createAccount(type, holder, initialBalance, options = {}) {
        let account;
        
        switch(type.toLowerCase()) {
            case 'savings':
                account = new SavingsAccount(holder, initialBalance, options.interestRate || 0.02);
                break;
            case 'checking':
                account = new CheckingAccount(holder, initialBalance, options.overdraftLimit || 100);
                break;
            default:
                account = new BankAccount(holder, initialBalance);
        }
        
        this.accounts.push(account);
        this.saveToStorage();
        return account;
    }
    
    findAccount(accountNumber) {
        const account = this.accounts.find(acc => acc.accountNumber === parseInt(accountNumber));
        if (!account) {
            throw new Error(`Account #${accountNumber} not found`);
        }
        return account;
    }
    
    transfer(fromNumber, toNumber, amount) {
        const fromAccount = this.findAccount(fromNumber);
        const toAccount = this.findAccount(toNumber);
        
        if (amount <= 0) {
            throw new Error('Transfer amount must be positive');
        }
        
        if (fromNumber === toNumber) {
            throw new Error('Cannot transfer to the same account');
        }
        
        fromAccount.withdraw(amount);
        toAccount.deposit(amount);
        
        fromAccount.transactions[fromAccount.transactions.length - 1].type = 'TRANSFER OUT';
        toAccount.transactions[toAccount.transactions.length - 1].type = 'TRANSFER IN';
        
        this.saveToStorage();
    }
    
    closeAccount(accountNumber) {
        const account = this.findAccount(accountNumber);
        account.isActive = false;
        this.saveToStorage();
    }
    
    // Storage Methods
    saveToStorage() {
        const data = {
            accountCounter: BankAccount.accountCounter,
            accounts: this.accounts.map(acc => ({
                accountNumber: acc.accountNumber,
                holder: acc.holder,
                balance: acc.balance,
                transactions: acc.transactions.map(t => ({
                    timestamp: t.timestamp.toISOString(),
                    type: t.type,
                    amount: t.amount,
                    balanceAfter: t.balanceAfter
                })),
                isActive: acc.isActive,
                type: acc.type,
                interestRate: acc.interestRate,
                overdraftLimit: acc.overdraftLimit
            }))
        };
        
        localStorage.setItem('pythonBankData', JSON.stringify(data));
    }
    
    loadFromStorage() {
        const data = localStorage.getItem('pythonBankData');
        if (!data) return;
        
        try {
            const parsed = JSON.parse(data);
            BankAccount.accountCounter = parsed.accountCounter || 1000;
            
            this.accounts = parsed.accounts.map(accData => {
                let account;
                
                switch(accData.type) {
                    case 'Savings':
                        account = new SavingsAccount(accData.holder, 0, accData.interestRate);
                        break;
                    case 'Checking':
                        account = new CheckingAccount(accData.holder, 0, accData.overdraftLimit);
                        break;
                    default:
                        account = new BankAccount(accData.holder, 0);
                }
                
                account.accountNumber = accData.accountNumber;
                account.balance = accData.balance;
                account.isActive = accData.isActive;
                account.transactions = accData.transactions.map(t => {
                    const trans = new Transaction(t.type, t.amount, t.balanceAfter);
                    trans.timestamp = new Date(t.timestamp);
                    return trans;
                });
                
                return account;
            });
        } catch (error) {
            console.error('Error loading data from storage:', error);
        }
    }
    
    // Alias for saveToStorage (for convenience)
    saveData() {
        this.saveToStorage();
    }
    
    clearStorage() {
        localStorage.removeItem('pythonBankData');
        this.accounts = [];
        BankAccount.accountCounter = 1000;
    }
    
    clearAllData() {
        this.clearStorage();
    }
    
    exportData() {
        return JSON.stringify({
            accountCounter: BankAccount.accountCounter,
            accounts: this.accounts
        }, null, 2);
    }
    
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            this.clearStorage();
            BankAccount.accountCounter = data.accountCounter || 1000;
            
            data.accounts.forEach(accData => {
                let account;
                const options = {};
                
                if (accData.type === 'Savings') {
                    options.interestRate = accData.interestRate;
                } else if (accData.type === 'Checking') {
                    options.overdraftLimit = accData.overdraftLimit;
                }
                
                account = this.createAccount(
                    accData.type,
                    accData.holder,
                    accData.balance,
                    options
                );
                
                // Restore transactions
                account.transactions = accData.transactions.map(t => {
                    const trans = new Transaction(t.type, t.amount, t.balanceAfter);
                    if (typeof t.timestamp === 'string') {
                        trans.timestamp = new Date(t.timestamp);
                    } else {
                        trans.timestamp = t.timestamp;
                    }
                    return trans;
                });
            });
            
            this.saveToStorage();
            return true;
        } catch (error) {
            throw new Error('Invalid import data: ' + error.message);
        }
    }
}

// Global Bank Instance
const bank = new Bank('Unix Bank');

// Utility Functions
function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.style.animation = 'slideInRight 0.4s ease-out reverse';
        setTimeout(() => alert.remove(), 400);
    }, 4000);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(date) {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getTransactionIcon(type) {
    if (type.includes('DEPOSIT') || type.includes('TRANSFER IN') || type.includes('INITIAL')) return '💰';
    if (type.includes('WITHDRAWAL') || type.includes('TRANSFER OUT')) return '💸';
    if (type.includes('INTEREST')) return '📈';
    return '📝';
}

function getTransactionClass(type) {
    if (type.includes('DEPOSIT') || type.includes('TRANSFER IN') || type.includes('INITIAL')) return 'deposit';
    if (type.includes('WITHDRAWAL') || type.includes('TRANSFER OUT')) return 'withdrawal';
    if (type.includes('INTEREST')) return 'interest';
    return 'transfer';
}

function getAmountClass(type) {
    if (type.includes('DEPOSIT') || type.includes('TRANSFER IN') || type.includes('INTEREST') || type.includes('INITIAL')) return 'positive';
    return 'negative';
}

function getAmountPrefix(type) {
    if (type.includes('DEPOSIT') || type.includes('TRANSFER IN') || type.includes('INTEREST') || type.includes('INITIAL')) return '+';
    return '-';
}

// Demo Data Function
function createDemoData() {
    bank.clearStorage();
    
    // Create accounts
    const savings = bank.createAccount('savings', 'Alice Johnson', 5000, { interestRate: 0.03 });
    const checking = bank.createAccount('checking', 'Bob Smith', 2500, { overdraftLimit: 500 });
    const basic = bank.createAccount('basic', 'Charlie Brown', 1000);
    
    // Add some transactions
    savings.deposit(1000);
    savings.withdraw(500);
    savings.applyInterest();
    
    checking.deposit(500);
    checking.withdraw(200);
    
    basic.deposit(250);
    
    // Make a transfer
    bank.transfer(savings.accountNumber, checking.accountNumber, 300);
    
    bank.saveToStorage();
    
    return { savings, checking, basic };
}

console.log('Unix Bank System Loaded');
