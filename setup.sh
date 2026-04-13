#!/bin/bash
# =============================================================================
# setup.sh - PostgreSQL Database Auto-Setup Script
# =============================================================================
# This script checks if the PostgreSQL database and user exist.
# If not, it creates them automatically.
#
# Usage: bash setup.sh
# Requires: psql command-line tool with superuser access
# =============================================================================

set -e

# Configuration (can be overridden by environment variables)
DB_NAME="${DB_NAME:-pgqiospay}"
DB_USER="${DB_USER:-pgqiospay}"
DB_PASS="${DB_PASS:-pgqiospay_secret}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
PG_SUPERUSER="${PG_SUPERUSER:-postgres}"

echo "=================================================="
echo "  QRIS Payment Gateway - Database Setup"
echo "=================================================="
echo ""
echo "Database: $DB_NAME"
echo "User:     $DB_USER"
echo "Host:     $DB_HOST:$DB_PORT"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "[ERROR] psql command not found. Please install PostgreSQL client."
    exit 1
fi

# Check if database user exists
echo "[1/4] Checking if database user '$DB_USER' exists..."
USER_EXISTS=$(psql -U "$PG_SUPERUSER" -h "$DB_HOST" -p "$DB_PORT" -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" 2>/dev/null || echo "0")

if [ "$USER_EXISTS" != "1" ]; then
    echo "       Creating user '$DB_USER'..."
    psql -U "$PG_SUPERUSER" -h "$DB_HOST" -p "$DB_PORT" -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null
    echo "       [OK] User created."
else
    echo "       [OK] User already exists."
fi

# Check if database exists
echo "[2/4] Checking if database '$DB_NAME' exists..."
DB_EXISTS=$(psql -U "$PG_SUPERUSER" -h "$DB_HOST" -p "$DB_PORT" -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null || echo "0")

if [ "$DB_EXISTS" != "1" ]; then
    echo "       Creating database '$DB_NAME'..."
    psql -U "$PG_SUPERUSER" -h "$DB_HOST" -p "$DB_PORT" -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null
    echo "       [OK] Database created."
else
    echo "       [OK] Database already exists."
fi

# Grant privileges
echo "[3/4] Granting privileges..."
psql -U "$PG_SUPERUSER" -h "$DB_HOST" -p "$DB_PORT" -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null
echo "       [OK] Privileges granted."

# Run Prisma migrations
echo "[4/4] Running Prisma migrations..."
if command -v npx &> /dev/null; then
    npx prisma migrate deploy 2>/dev/null || npx prisma db push 2>/dev/null || echo "       [WARN] Migration skipped. Run 'npx prisma db push' manually."
else
    echo "       [WARN] npx not found. Run 'npx prisma db push' manually."
fi

echo ""
echo "=================================================="
echo "  Setup completed successfully!"
echo "=================================================="
echo ""
echo "Database URL: postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME?schema=public"
echo ""
echo "Next steps:"
echo "  1. Ensure your .env file has the correct DATABASE_URL"
echo "  2. Run 'npm run build' to build the application"
echo "  3. Run 'npm start' or 'node server.js' to start the server"
echo "  4. Visit the application to complete initial setup"
echo ""
