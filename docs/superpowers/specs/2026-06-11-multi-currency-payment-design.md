# Multi-Currency Payment — Design Spec (Buzzvel 2026 Dev Team Test)

Date: 2026-06-11
Deadline: 5 days after receiving the test (PDF dated 8 June 2026 — deliver by ~13 June 2026)

## Goal

Laravel 12 application managing multi-currency payment requests. Authenticated
employees submit payment requests in their local currency; the EUR exchange
rate is fetched automatically at creation time and stored immutably; finance
users approve or reject pending requests; requests pending more than 48 hours
expire automatically.

Deliverables: REST API (evaluated), polished UI, tests, API docs, seeders,
strong README, demo video, Git repo.

## Stack

- Laravel 12, PHP 8.2+
- Auth API: **Laravel Passport** (Bearer tokens)
- UI: **Inertia + React** (session auth, `web` guard — not an API client)
- Environment: **Docker via Laravel Sail + MySQL**; SQLite in-memory for tests
- Tests: **Pest**
- API docs: **Scramble** (auto OpenAPI at `/docs/api`)

## Architecture

Two entry points, one domain layer:

```
Postman/evaluator ──Bearer (Passport)──▶ /api/v1/* controllers ─▶ Services
React UI (Inertia) ──session cookie───▶ web controllers ───────▶ same Services
```

Layers: `Controller → FormRequest (validation) → Service/Action → Model`.
API responses via Eloquent API Resources. Exchange rates behind a
`ExchangeRateProvider` interface; `ExchangeRateApiProvider` implementation
using Laravel HTTP client; faked in all tests.

## Data Model

**users**
- name, email, password
- `role` enum: `employee` | `finance` (column + Policy; no permission package)
- `country` (ISO 3166-1 alpha-2), `currency` (ISO 4217)

**payment_requests**
- user_id (FK)
- description
- `amount_local` decimal(15,2)
- `currency` char(3) ISO 4217 (copied from user at creation)
- `exchange_rate` decimal(15,8) — EUR → local rate at creation, **immutable**
- `amount_eur` decimal(15,2) — computed and stored at creation (`amount_local / exchange_rate`)
- `rate_source` string, `rate_fetched_at` timestamp
- `status` enum: `pending` | `approved` | `rejected` | `expired`
- approved_by (nullable FK users), approved_at (nullable)
- timestamps

Immutability rule: rate/amounts never accepted in any update. The only
mutation allowed after creation is status transition via dedicated endpoints
(`pending → approved | rejected | expired`).

## API Endpoints (`/api/v1`)

| Method | Route | Access |
|---|---|---|
| POST | /auth/register | public |
| POST | /auth/login | public |
| POST | /auth/logout | auth |
| POST | /payment-requests | auth — creates in user's currency, rate fetched automatically |
| GET | /payment-requests?status= | auth — employee sees own; finance sees all |
| GET | /payment-requests/{id} | auth + policy |
| PATCH | /payment-requests/{id}/approve | finance only, pending only |
| PATCH | /payment-requests/{id}/reject | finance only, pending only |

Error contract (JSON): 422 validation, 401 unauthenticated, 403 policy,
404 not found, 409 invalid status transition, 503 FX provider unavailable.
Consistent error shape with meaningful messages.

## Exchange Rate Integration

- Provider: `https://api.exchangerate-api.com/v4/latest/EUR` (no API key)
- On creation: fetch EUR → user currency rate; store rate, source, timestamp;
  compute and return `amount_eur` in the response.
- Short cache (~5 min) acceptable for resilience; stored rate is whatever was
  fetched at creation.
- FX API down → request NOT created; 503 with clear message.

## Scheduled Expiry

- Artisan command `payment-requests:expire-stale`: marks `pending` older than
  48h as `expired`.
- Registered in scheduler (hourly). Tested with time travel.

## UI (Inertia + React)

Pages: login, register, dashboard (list + status filter), create payment
request (shows converted EUR preview), request detail, approve/reject actions
(finance only). Clean, polished design — explicitly part of evaluation.

## Seeders

- 5+ employees across countries/currencies: BR/BRL, US/USD, PT/EUR, JP/JPY, GB/GBP
- 1 finance user
- Payment requests in assorted statuses

## Testing (Pest, `Http::fake()` for FX everywhere)

**Feature:** register/login/logout; create request (rate stored, EUR returned);
list + status filter; visibility (employee own only, finance all); approve/
reject happy paths; employee cannot approve (403); non-pending transition (409);
validation errors (missing fields, invalid currency, negative/zero amount);
rate immutability; 48h expiry command; FX API failure → 503.

**Unit:** conversion service, provider response parsing, expiry command logic.

## Documentation & Submission

- README (mandatory — test ignored without it): Sail setup step-by-step,
  architecture decisions, endpoint summary, how to run tests, seeded credentials.
- Scramble OpenAPI docs at `/docs/api` + request/response examples.
- Incremental, clean Git commits.
- Demo video (UI + API via docs/Postman) with public link; submit via ClickUp form.
