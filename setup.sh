#!/bin/bash

echo "Installing dependencies..."
npm install

echo "Setting up environment variables..."
cp .env.local.example .env.local

echo "Initializing database..."
npx prisma migrate deploy --skip-generate || npx prisma migrate dev --name init

echo "Generating Prisma client..."
npm run prisma:generate

echo "Initializing admin user..."
curl -X GET http://localhost:3000/api/init 2>/dev/null || echo "Run server first: npm run dev"

echo "Setup complete!"
echo ""
echo "To start the development server:"
echo "npm run dev"
echo ""
echo "Default admin credentials:"
echo "Email: admin@trading.com"
echo "Password: admin123"
