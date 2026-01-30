# Crypto Trading Platform

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (.env.local):
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

3. Initialize database:
```bash
npx prisma migrate dev
npm run prisma:generate
```

4. Run development server:
```bash
npm run dev
```

5. Access the application:
- User Dashboard: http://localhost:3000
- Admin Panel: http://localhost:3000/admin

## Default Admin Account
- Email: admin@trading.com
- Password: admin123

## Features

### For Users
- Create account and login
- View balance
- Request deposits (shows master BTC address)
- Request withdrawals
- View transaction history

### For Admin
- View all users
- Manage user balances (credit/debit)
- Approve/reject withdrawals
- Configure platform settings
- View all transactions
- Set deposit & withdrawal limits

## Architecture

- **Frontend**: Next.js with React
- **Backend**: Next.js API routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT-based

## Security Notes

- Change default admin credentials immediately
- Use environment variables for sensitive data
- Implement 2FA for admin accounts
- Never expose private keys in code
- Use HTTPS in production