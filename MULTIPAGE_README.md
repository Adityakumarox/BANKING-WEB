# Python Bank - Multi-Page Banking System

A complete, modern banking web application with multiple pages, built using HTML, CSS, and JavaScript. Demonstrates Object-Oriented Programming, inheritance, exception handling, and localStorage data persistence.

## 🎯 Features

### Complete Banking Functionality
- ✅ Create multiple account types (Basic, Savings, Checking)
- ✅ Deposits and withdrawals with real-time preview
- ✅ Transfer money between accounts
- ✅ Apply interest to savings accounts
- ✅ Complete transaction history
- ✅ Export/Import data
- ✅ Demo data loading

### Account Types
1. **Basic Account** - Standard deposits and withdrawals
2. **Savings Account** - Earns interest at customizable rates
3. **Checking Account** - Includes overdraft protection

## 📁 Project Structure

```
python-bank/
├── index.html          # Dashboard/Homepage
├── accounts.html       # Account management
├── transactions.html   # Deposits & withdrawals
├── transfer.html       # Transfer between accounts
├── settings.html       # Settings & data management
├── styles.css          # Global stylesheet
├── bank.js             # Core banking logic & classes
├── dashboard.js        # Dashboard page logic
├── accounts.js         # Accounts page logic
├── transactions.js     # Transactions page logic
├── transfer.js         # Transfer page logic
└── settings.js         # Settings page logic
```

## 🚀 Getting Started

### Option 1: Direct Use (Recommended)
1. Download all files to a folder
2. Open `index.html` in any modern web browser
3. Start using the banking system!

### Option 2: Local Server
```bash
# If you want to use a local server
python -m http.server 8000
# Then navigate to http://localhost:8000
```

## 📖 Pages Overview

### 1. Dashboard (`index.html`)
- Overview of all accounts
- Total balance statistics
- Recent activity feed
- Account distribution charts
- Quick action buttons

### 2. Accounts (`accounts.html`)
- Create new accounts
- View all accounts
- Filter by account type
- Sort by various criteria
- Search functionality
- View detailed account information
- Quick deposit/withdraw buttons

### 3. Transactions (`transactions.html`)
Three tabs:
- **Deposit**: Add money to accounts
- **Withdraw**: Remove money from accounts
- **History**: View all transactions with filters

### 4. Transfer (`transfer.html`)
- Transfer money between accounts
- Real-time preview of balance changes
- Recent transfers history
- Transfer statistics

### 5. Settings (`settings.html`)
- Apply interest to savings accounts
- Export data (accounts, transactions, complete backup)
- Import data from backup
- System information
- Clear all data
- Load demo data

## 🎨 Design Features

### Visual Design
- **Dark theme** with neon green accents
- **Animated grid background**
- **Smooth animations** on page load and interactions
- **Responsive design** for all screen sizes
- **Modern typography** using Syne and Space Mono fonts

### User Experience
- **Persistent navigation** across all pages
- **Real-time balance updates**
- **Preview before committing** transactions
- **Alert notifications** for success/error messages
- **Empty states** with helpful guidance
- **Quick action shortcuts**

## 💾 Data Persistence

### LocalStorage
- All data is automatically saved to browser localStorage
- Data persists between sessions
- No server or database required

### Export/Import
- Export individual components (accounts, transactions)
- Export complete backup
- Import from JSON file
- Portable between browsers/computers

## 🔧 Technical Details

### Object-Oriented Programming

**Classes:**
```javascript
BankAccount (Base Class)
├── SavingsAccount (inherits from BankAccount)
└── CheckingAccount (inherits from BankAccount)

Transaction (records individual transactions)
Bank (manages all accounts)
```

**Inheritance Example:**
```javascript
class SavingsAccount extends BankAccount {
    applyInterest() {
        const interest = this.balance * this.interestRate;
        this.balance += interest;
        this.recordTransaction('INTEREST', interest);
        return interest;
    }
}
```

**Polymorphism:**
```javascript
// CheckingAccount overrides withdraw() for overdraft
class CheckingAccount extends BankAccount {
    withdraw(amount) {
        // Can overdraw up to overdraftLimit
        if (amount > (this.balance + this.overdraftLimit)) {
            throw new Error('Insufficient funds...');
        }
        // ... rest of implementation
    }
}
```

### Exception Handling

Custom error messages for:
- Insufficient funds
- Invalid amounts (negative, zero)
- Closed accounts
- Account not found
- Transfer to same account

### Data Flow

```
User Action → Form Validation → Try/Catch Block → 
Bank Class Method → Account Class Method → 
Update Balance → Record Transaction → 
Save to LocalStorage → Update UI → Show Alert
```

## 📱 Responsive Design

Works perfectly on:
- ✅ Desktop (1920x1080 and above)
- ✅ Laptop (1366x768)
- ✅ Tablet (768px and above)
- ✅ Mobile (320px and above)

## 🎮 Try It Out

### Quick Start Guide

1. **Open `index.html`** in your browser
2. **Load Demo Data**:
   - Go to Settings page
   - Click "Load Demo Data"
   - Explore pre-populated accounts and transactions
3. **Create Your Own Account**:
   - Go to Accounts page
   - Click "+ Create New Account"
   - Fill in details and submit
4. **Make Transactions**:
   - Navigate to Transactions page
   - Try deposits and withdrawals
5. **Transfer Money**:
   - Go to Transfer page
   - Select accounts and transfer amount

## 🎯 Use Cases

### Educational
- Learn OOP concepts
- Understand inheritance and polymorphism
- Practice JavaScript and DOM manipulation
- Study localStorage API

### Portfolio
- Showcase full-stack web development skills
- Demonstrate UI/UX design
- Highlight JavaScript expertise

### Demo
- Banking system prototype
- Teaching tool for programming concepts
- Interview coding challenge solution

## 🔒 Security Note

⚠️ **This is a demonstration application**:
- No real money involved
- Data stored in browser only (localStorage)
- No authentication/authorization
- Not suitable for production use without significant enhancements

For production use, you would need:
- Backend server (Node.js, Python, etc.)
- Database (PostgreSQL, MongoDB, etc.)
- User authentication
- Encryption
- Security measures (HTTPS, CSRF protection, etc.)

## 🛠️ Customization

### Change Colors
Edit `styles.css`:
```css
:root {
    --primary: #00ff88;      /* Change primary color */
    --secondary: #0066ff;    /* Change secondary color */
    --bg-dark: #0a0e14;      /* Change background */
}
```

### Add Features
- Loan accounts
- Credit cards
- Bill payments
- Recurring transfers
- Account statements
- Multi-currency support

### Modify Account Types
Edit `bank.js` to add new account types:
```javascript
class LoanAccount extends BankAccount {
    // Your implementation
}
```

## 📊 Statistics

- **5 HTML pages** - Complete navigation
- **6 JavaScript files** - Modular architecture
- **1 CSS file** - Centralized styling (1300+ lines)
- **~500 lines** - Core banking logic
- **~300 lines** - Each page-specific logic
- **0 dependencies** - Pure vanilla JavaScript

## 🌟 Key Highlights

1. **Multi-Page Architecture**: Proper separation of concerns
2. **Modular JavaScript**: Each page has its own logic file
3. **Shared Core Logic**: `bank.js` used across all pages
4. **Data Persistence**: LocalStorage with import/export
5. **Professional UI**: Modern design with animations
6. **Responsive**: Works on all devices
7. **No Framework**: Pure HTML, CSS, JavaScript
8. **No Server Required**: Runs entirely in browser

## 🎓 Learning Outcomes

After exploring this project:
- ✅ Multi-page web application structure
- ✅ OOP in JavaScript (classes, inheritance, polymorphism)
- ✅ DOM manipulation and event handling
- ✅ LocalStorage API for data persistence
- ✅ Form validation and error handling
- ✅ CSS animations and transitions
- ✅ Responsive web design
- ✅ Modular JavaScript architecture

## 🐛 Troubleshooting

**Issue**: Navigation doesn't work
- **Solution**: Make sure all files are in the same directory

**Issue**: Data doesn't persist
- **Solution**: Check if localStorage is enabled in your browser

**Issue**: Styles look broken
- **Solution**: Ensure internet connection for Google Fonts

**Issue**: JavaScript errors
- **Solution**: Check browser console for specific errors. Ensure all JS files are loaded.

## 📄 Browser Compatibility

Tested and working on:
- ✅ Chrome 120+
- ✅ Firefox 120+
- ✅ Safari 17+
- ✅ Edge 120+
- ✅ Opera 105+

Requires ES6+ JavaScript support.

## 🎉 Enjoy Your Banking System!

This is a complete, professional-grade banking application that demonstrates modern web development practices. Feel free to explore, modify, and learn from the code!

### Quick Links
- Open `index.html` to start
- Visit Settings → Load Demo Data for instant exploration
- Check `bank.js` for core OOP implementation
- View `styles.css` for design system

---

**Built with ❤️ using HTML, CSS, and JavaScript**

*No frameworks, no dependencies, just pure web technology!*
