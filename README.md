# Multi-Currency Payment Requests

A Laravel 12 application for managing multi-currency payment requests across a
company with employees in different countries. Employees submit payment requests
in **their own local currency**; the EUR exchange rate is fetched in real time
and **frozen** at creation; the finance team approves or rejects pending
requests; anything left pending for more than 48 hours expires automatically.

> Built for the Buzzvel 2026 Dev Team Test.

---

## Table of contents

- [Stack](#stack)
- [Quick start](#quick-start)
- [Manual setup](#manual-setup)
- [Seeded accounts](#seeded-accounts)
- [API](#api)
- [Architecture & decisions](#architecture--decisions)
- [Exchange rate integration](#exchange-rate-integration)
- [Scheduled expiry](#scheduled-expiry)
- [Testing](#testing)
- [Extras](#extras)

---

## Stack

| Concern | Choice |
|---|---|
| Framework | **Laravel 12**, PHP 8.3 |
| Runtime | **Laravel Octane + FrankenPHP** (app kept warm in memory) |
| Environment | **Docker via Laravel Sail** + MySQL 8 |
| API auth | **Laravel Passport** (OAuth2 Bearer tokens) |
| Web UI | **Inertia + React** (session auth) with Tailwind |
| API docs | **Scramble** (auto-generated OpenAPI at `/docs/api`) |
| Tests | **Pest** (SQLite in-memory) |

The app has **two entry points over one domain layer**: the REST API
(`/api/v1/*`, Passport Bearer tokens — for the evaluator/Postman) and the React
UI (session cookies — for humans). Both call the same Services, so business
rules live in exactly one place.

---

## Quick start

Requires **Docker** only. Clone, then run the setup script:

```bash
git clone <repo-url> multi-currency-payment
cd multi-currency-payment
./setup.sh
```

The script copies `.env`, installs dependencies, boots the containers,
generates the app & Passport keys, migrates + seeds the database, and builds the
front-end. When it finishes:

- **App:** http://localhost:8088
- **API docs:** http://localhost:8088/docs/api

> Ports are intentionally uncommon (`8088` app, `33061` MySQL, `5188` Vite) to
> avoid clashing with anything already running on your machine. Change them in
> `.env` if needed.

For live front-end reloading while developing:

```bash
./vendor/bin/sail npm run dev
```

---

## Manual setup

If you'd rather run the steps yourself:

```bash
cp .env.example .env
docker run --rm -v "$(pwd)":/app -w /app composer:2 install   # or: composer install

./vendor/bin/sail up -d
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan passport:keys
./vendor/bin/sail artisan migrate:fresh --seed
./vendor/bin/sail npm install
./vendor/bin/sail npm run build
```

---

## Seeded accounts

The seeder creates 6 users across 5 countries/currencies, each with payment
requests in every status. **Password for everyone: `password`.**

| Email | Role | Country / Currency |
|---|---|---|
| `finance@example.com` | finance | PT / EUR |
| `bruna@example.com` | employee | BR / BRL |
| `alex@example.com` | employee | US / USD |
| `tiago@example.com` | employee | PT / EUR |
| `yuki@example.com` | employee | JP / JPY |
| `olivia@example.com` | employee | GB / GBP |

> Log in as a non-EUR user (e.g. `bruna@example.com`) to see the EUR conversion
> in action — `finance@example.com` is a EUR user, so her amounts convert 1:1.

---

## API

Base URL: `http://localhost:8088/api/v1`. All responses are JSON.
**Interactive docs with request/response schemas live at `/docs/api`.**

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | public | Register (creates an `employee`), returns a token |
| POST | `/auth/login` | public | Login, returns a Bearer token |
| POST | `/auth/logout` | Bearer | Revoke the current token |
| GET | `/user` | Bearer | Current authenticated user |
| POST | `/payment-requests` | Bearer | Create a request in the user's currency (rate fetched automatically) |
| GET | `/payment-requests?status=&search=` | Bearer | List (employee: own; finance: all) with optional status filter |
| GET | `/payment-requests/{id}` | Bearer | Show one (owner or finance) |
| PATCH | `/payment-requests/{id}/approve` | Bearer | Approve a pending request (finance only) |
| PATCH | `/payment-requests/{id}/reject` | Bearer | Reject a pending request (finance only) |

### Authentication flow

```bash
# 1. Login
curl -X POST http://localhost:8088/api/v1/auth/login \
  -H "Accept: application/json" \
  -d "email=finance@example.com&password=password"
# → { "data": { ... }, "token": "<bearer-token>" }

# 2. Use the token
curl http://localhost:8088/api/v1/payment-requests \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <bearer-token>"
```

### Creating a payment request

```bash
curl -X POST http://localhost:8088/api/v1/payment-requests \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <bearer-token>" \
  -d "description=Team dinner&amount_local=615"
```

The currency is **always** taken from the authenticated user — any `currency`
in the payload is ignored. The response includes the stored rate and the
computed `amount_eur`.

### Error contract

Consistent JSON errors with meaningful messages:

| Status | When |
|---|---|
| 401 | Missing / invalid / revoked token |
| 403 | Policy denies (e.g. employee trying to approve) |
| 404 | Resource not found |
| 409 | Invalid status transition (e.g. approving a non-pending request) |
| 422 | Validation failed (missing fields, bad currency, amount ≤ 0) |
| 503 | Exchange-rate provider unavailable — request **not** created |

---

## Architecture & decisions

```
Postman / evaluator ──Bearer (Passport)──▶  /api/v1/* controllers ─┐
                                                                    ├─▶ Services ─▶ Models
React UI (Inertia)  ──session cookie──────▶  web controllers ──────┘
```

- **Layered:** `Controller → FormRequest (validation) → Service/Action → Model`.
  API output goes through Eloquent API Resources.
- **Exchange rates behind an interface.** `ExchangeRateProvider` is an interface;
  `ExchangeRateApiProvider` is the HTTP implementation. It is bound in the
  container and **faked in every test**, so no test ever hits the network.
- **Immutability is enforced structurally.** There is no update/delete route for
  a payment request; the rate and amounts are never accepted in any mutation.
  The only allowed change after creation is a status transition through the
  dedicated `approve`/`reject` endpoints (a `DecidePaymentRequest` service that
  rejects non-pending requests with a 409).
- **Money is stored as `decimal`**, not float — `amount_local`/`amount_eur` as
  `decimal(15,2)` and `exchange_rate` as `decimal(15,8)` — to avoid binary
  floating-point error.
- **Authorization via a Policy.** `PaymentRequestPolicy` decides visibility
  (finance sees all, employees see their own) and who can approve/reject.

---

## Exchange rate integration

- Provider: `https://api.exchangerate-api.com/v4/latest/EUR` (no API key),
  configurable via `EXCHANGE_RATE_API_URL`.
- On creation, the EUR → user-currency rate is fetched, and the **rate, source
  and timestamp** are stored alongside the request; `amount_eur =
  amount_local / rate` is computed and stored once.
- A short (~5 min) cache reduces load and adds resilience; a failed fetch is
  **not** cached.
- If the provider is unreachable, the request is **not** created and the API
  returns **503**.

---

## Scheduled expiry

An Artisan command marks stale requests as expired:

```bash
./vendor/bin/sail artisan payment-requests:expire-stale
```

It flips `pending` requests older than 48 hours to `expired` in a single bulk
update. It is registered to run **hourly** (`routes/console.php`) and is tested
with time-travel.

---

## Testing

```bash
./vendor/bin/sail pest                 # full suite
./vendor/bin/sail pest tests/Unit      # unit tests only
./vendor/bin/sail pest --filter=Auth   # by name
```

Tests run against an **in-memory SQLite** database and **fake the exchange-rate
HTTP calls**. Coverage spans: auth (register/login/logout + token revocation),
request creation (rate stored, EUR returned, currency taken from the user),
listing + status filter + search, visibility rules, approve/reject happy paths
and 403/409 cases, validation errors, rate immutability, FX failure → 503, and
the 48-hour expiry command.

---

## Extras

Beyond the brief:

- **Polished Inertia + React UI** with light/dark theme, an interactive
  animated landing page, and toast notifications.
- **Internationalisation (EN / PT-BR)** with Laravel as the single source of
  truth (`lang/*.json`), shared to the front-end and switchable live.
- **Live search** on the dashboard (description, plus requester name for finance).
- **Currency-aware amount input** that formats as you type.
