#!/usr/bin/env bash
#
# One-shot local setup for the Multi-Currency Payment app.
# Clone the repo, run `./setup.sh`, then open http://localhost:8088
#
set -euo pipefail

cyan() { printf '\033[36m%s\033[0m\n' "$1"; }
green() { printf '\033[32m%s\033[0m\n' "$1"; }

# 1. Environment file ---------------------------------------------------------
if [ ! -f .env ]; then
    cyan "→ Creating .env from .env.example"
    cp .env.example .env
else
    cyan "→ .env already exists, keeping it"
fi

# 2. PHP dependencies (run via a throwaway Composer container so you don't even
#    need PHP installed on the host) -----------------------------------------
if [ ! -d vendor ]; then
    cyan "→ Installing PHP dependencies"
    docker run --rm -v "$(pwd)":/app -w /app composer:2 install --ignore-platform-reqs --no-interaction
fi

# 3. Boot the Sail containers (PHP/Octane + MySQL) ---------------------------
cyan "→ Starting Docker containers (Sail)"
./vendor/bin/sail up -d

cyan "→ Waiting for the database to be ready"
until ./vendor/bin/sail exec -T mysql mysqladmin ping -h localhost --silent >/dev/null 2>&1; do
    sleep 2
done

# 4. App key + Passport keys -------------------------------------------------
cyan "→ Generating application key"
./vendor/bin/sail artisan key:generate --force

cyan "→ Generating Passport encryption keys"
./vendor/bin/sail artisan passport:keys --force

# 5. Database: migrate + seed demo data --------------------------------------
cyan "→ Migrating and seeding the database"
./vendor/bin/sail artisan migrate:fresh --seed --force

# 6. Front-end ---------------------------------------------------------------
cyan "→ Installing and building front-end assets"
./vendor/bin/sail npm install
./vendor/bin/sail npm run build

green ""
green "✓ Setup complete!"
green "  App:      http://localhost:8088"
green "  API docs: http://localhost:8088/docs/api"
green ""
green "  Seeded login (password for everyone: 'password'):"
green "    finance@example.com   — finance role"
green "    bruna@example.com     — employee (BR / BRL)"
green ""
green "  For live front-end reloading during development, run:"
green "    ./vendor/bin/sail npm run dev"
