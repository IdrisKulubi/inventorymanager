#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting database migration...${NC}"

# Run drizzle-kit generate to create migration files
echo "Generating migration files..."
npx drizzle-kit generate:pg

# Run drizzle-kit push to apply migrations
echo "Applying migrations to database..."
npx drizzle-kit push:pg

# Run the SQL files in the drizzle directory
echo "Running SQL scripts..."
psql "$DATABASE_URL" -f "./drizzle/0000_dear_vermin.sql"
psql "$DATABASE_URL" -f "./drizzle/0001_add_selling_price.sql"

echo -e "${GREEN}Migration completed successfully!${NC}" 