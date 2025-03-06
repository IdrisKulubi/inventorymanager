#!/bin/bash

# Exit on error
set -e

echo "Starting inventory management system migration..."

# Step 1: Apply database migrations
echo "Step 1: Applying database migrations..."
npx drizzle-kit push:pg

# Step 2: Update existing data
echo "Step 2: Updating existing data..."
npx tsx src/scripts/update-inventory-data.ts

echo "Migration completed successfully!"
echo "You can now start the application with 'npm run dev'" 