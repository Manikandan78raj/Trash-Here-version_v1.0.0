# Trash Here Enterprise — Master Project Context & Progress Log
> **Purpose**: This document serves as the persistent, authoritative context and progress ledger for **Trash Here Enterprise**. It is designed so that any engineer or AI assistant opening the repository in a new chat session can immediately retrieve complete architectural context, completed sprints, audit results, active configuration state, and strict development rules without re-scanning or asking redundant questions.

---

## 1. Project Architecture & Technical Stack

- **Platform Overview**: Enterprise-grade waste management and recycling logistics platform connecting households, commercial waste producers, logistics collectors, and automated recycling hub scale/weighbridge systems.
- **Backend Architecture**: NestJS 10 (TypeScript) employing modular Domain-Driven Design (DDD), Swagger/OpenAPI documentation, `ConfigService` centralized configuration, and rate-limiting (`@nestjs/throttler`).
- **Database & ORM**: PostgreSQL 16 managed via Prisma ORM (`schema.prisma` with automated migrations and seed scripts).
- **Authentication & Security**: JWT Access/Refresh Token rotation strategy, Redis blocklisting for revoked tokens (`POST /api/v1/auth/logout`), Cookie secure flags, and strict payload sanitization (`GET /api/v1/auth/me`).
- **Caching & Sessions**: Redis Cluster/Sentinel abstraction via `RedisCacheService` with seamless fallback to in-memory LRU caching when offline or in local development.
- **Frontend Architecture**: React 18 + Vite SPA, Tailwind CSS, Framer Motion animations, Radix UI accessible primitives, Lucide icons, and TanStack Query state synchronization.
- **Orchestration & DevOps**: Multi-stage Docker builds, `docker-compose.yml` multi-container network (`postgres`, `backend`, `frontend`), and Nginx reverse proxy serving frontend static assets and routing `/api/` traffic.

---

## 2. Completed Work & Sprint History

### Sprint 13: Enterprise Authentication & Security Module (Completed & Verified ✅)
- **Problem Solved**: Resolved chronic 401 Unauthorized API failures, infinite loading loops on Profile/Wallet/Rewards pages, and broken token refresh cycles.
- **Implemented Capabilities**:
  1. **Secure Token Rotation (`POST /api/v1/auth/refresh`)**: Validates long-lived refresh tokens against hashed/stored records, rotates tokens, and issues fresh access tokens without forcing re-login.
  2. **Enterprise Logout & Blocklisting (`POST /api/v1/auth/logout`)**: Immediately revokes active access/refresh tokens and records them in the Redis blocklist to prevent replay attacks.
  3. **Sanitized Profile (`GET /api/v1/auth/me`)**: Returns clean, type-safe user profile data without exposing sensitive internal password hashes or token signatures.
- **Strict Quality Gate & Certification (Phase 4 Results)**:
  - `npm test` (Backend): **100% pass rate** across all 39 unit/integration test suites.
  - `npm run build` & `npm run typecheck`: **Zero errors** across both backend and frontend workspaces.

---

### Sprint 14: Environment Variable Audit & Configuration Standardization (Completed & Verified ✅)
- **Problem Solved**: Eliminated configuration drift, missing placeholder templates, and environment variable formatting discrepancies across local `.env` files and `docker-compose.yml`.
- **Comprehensive Audit Findings**:
  - Scanned 27 total environment variable names across codebase and infrastructure.
  - Identified 6 unused placeholders (`FIREBASE_*`, `GOOGLE_MAPS_API_KEY`, `STRIPE_*`).
  - Identified 11 variables actively queried in code via `ConfigService` / `import.meta.env` but absent from `.env.example` templates (`TWILIO_*`, `SMTP_HOST`, `REDIS_*`, `POSTGRES_*`, `VITE_CLOUDINARY_*`).
  - Discovered 1 critical formatting mismatch: `API_PREFIX` defined as `api/v1` in `docker-compose.yml` versus `/api/v1` in `.env` / `main.ts`.
- **Configuration Improvements Implemented**:
  1. **Root `.env.example` (`x:/Projects/Trash_Here/.env.example`)**: Appended safe development placeholders for `TWILIO_*`, `SMTP_HOST`, `REDIS_*`, and `POSTGRES_*` without touching or duplicating existing variables.
  2. **Backend `.env.example` (`x:/Projects/Trash_Here/backend/.env.example`)**: Created a complete, standalone 29-variable backend template matching all active configurations and mock fallbacks.
  3. **Frontend `.env.example` (`x:/Projects/Trash_Here/frontend/.env.example`)**: Appended `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` templates.
  4. **Docker Compose Fix (`x:/Projects/Trash_Here/docker-compose.yml`)**: Standardized `API_PREFIX: /api/v1` under `services.backend.environment`.
  5. **Zero Disruption Policy**: Strictly preserved all existing live `.env` files (`x:/Projects/Trash_Here/.env`, `backend/.env`, and `frontend/.env` were not overwritten or modified).

---

### Sprint 15: Frontend Authentication & Backend API Wrapper Integration (Completed & Verified ✅)
- **Objective**: Make the frontend authentication flow (`AuthContext`, `client.ts`, `apiClient`) and TanStack Query hooks work seamlessly with the existing NestJS backend (`TransformInterceptor` wrapper and HttpOnly cookies) making the minimum necessary code changes without altering UI design, business logic, or database schema.
- **Root Causes Identified & Fixed**:
  1. **Nested Wrapper Mismatch**: Backend `TransformInterceptor` wraps all JSON responses inside `{ success, statusCode, message, data, timestamp }`. When the frontend interceptor or queries ran, they accessed `response.data` expecting raw entities or `response.data.accessToken` instead of `response.data.data.accessToken`. Fixed interceptors in `client.ts` (`x:/Projects/Trash_Here/frontend/src/common/api/client.ts`) and data extractors in `auth.api.ts`, `wallet.api.ts`, and `household.api.ts` (`(response.data as any)?.data || response.data`) while adding explicit Promise return types to maintain 100% type safety.
  2. **401 Token Refresh Loop & State Desync**: When `client.ts` interceptor caught `401 Unauthorized` and successfully refreshed the token via `POST /auth/refresh`, the React `AuthContext` state was unaware of the new token. Added custom event dispatch `window.dispatchEvent(new CustomEvent('auth:token-refreshed', { detail: newAccess }))` in `client.ts` and event listener in `AuthContext.tsx`. Also added exclusion for `/auth/logout` and `/auth/login` to prevent infinite retry loops.
  3. **Session Restoration on Mount**: Updated `AuthContext.tsx` (`initAuth()`) to verify/restore user session on app startup via `GET /auth/me` and clean up `localStorage` gracefully on `auth:unauthorized`.
  4. **Infinite Loading UI Spinner Fix**: In `ProfileTab.tsx`, `isLoading || !profile` caused infinite loading spinners whenever queries had an error or empty profile. Destructured `isError` and `refetch` from `useProfile()` and rendered a clean error card with a "Retry" button.
- **Strict Quality Gate & Verification (Phase 4 Results)**:
  - `npm run typecheck` (`x:/Projects/Trash_Here/frontend`): **0 errors (`tsc -b`)**.
  - `npm run build` (`x:/Projects/Trash_Here/frontend`): **Successfully built production bundle in 9.10s**.
  - `npm test` (`x:/Projects/Trash_Here/frontend`): **100% pass rate (31 passed test suites, 125 passed tests)**.

---

## 3. Master Environment Variable Matrix & Reference

| Variable Name | Tier / Scope | Default Dev / Placeholder Value | Consuming Module / File | Required Local? | Required Prod? |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **DATABASE_URL** | Backend / Prisma | `postgresql://postgres:password123@localhost:5432/trash_here?schema=public` | `schema.prisma`, `docker-compose.yml` | Yes | Yes |
| **PORT** | Backend Core | `3000` | `main.ts`, `docker-compose.yml` | No (default `3000`) | Yes |
| **NODE_ENV** | Global | `development` (`production` in Docker) | `auth.controller.ts`, `main.ts` | No | Yes |
| **API_PREFIX** | Backend Core | `/api/v1` | `main.ts`, `docker-compose.yml` | No (default `/api/v1`) | Yes |
| **FRONTEND_URL** | Backend CORS | `http://localhost:5173` | `main.ts` | No | Yes |
| **JWT_SECRET** | Backend Auth | `super-secret-trash-here-enterprise-jwt-key-2026` | `auth.module.ts`, `auth.service.ts`, `jwt.strategy.ts` | Yes | Yes |
| **JWT_EXPIRES_IN** | Backend Auth | `15m` (`7d` in dev template) | `auth.module.ts`, `auth.service.ts` | No | Yes |
| **REFRESH_TOKEN_SECRET** | Backend Auth | `super-secret-refresh-trash-here-key-2026` | `auth.service.ts` | Yes | Yes |
| **REFRESH_TOKEN_EXPIRES_IN**| Backend Auth | `30d` | `auth.service.ts` | No | Yes |
| **CLOUDINARY_CLOUD_NAME** | Backend Storage | `trash-here-cloud` | `cloudinary.provider.ts` | No (simulates) | Yes |
| **CLOUDINARY_API_KEY** | Backend Storage | `mock-api-key` | `cloudinary.provider.ts` | No | Yes |
| **CLOUDINARY_API_SECRET** | Backend Storage | `mock-api-secret` | `cloudinary.provider.ts` | No | Yes |
| **TWILIO_ACCOUNT_SID** | Backend SMS | `AC_mock_twilio_account_sid_2026` | `sms.provider.ts` | No (simulates) | Yes |
| **TWILIO_AUTH_TOKEN** | Backend SMS | `mock_twilio_auth_token_2026` | `sms.provider.ts` | No | Yes |
| **TWILIO_PHONE_NUMBER** | Backend SMS | `+15005550006` | `sms.provider.ts` | No | Yes |
| **SMTP_HOST** | Backend Email | `smtp.mailtrap.io` | `email.provider.ts` | No (simulates) | Yes |
| **REDIS_ENABLED** | Backend Cache | `false` | `redis-cache.service.ts` | No (LRU fallback)| Yes |
| **REDIS_URL** | Backend Cache | `redis://localhost:6379` | `redis-cache.service.ts` | No | Yes |
| **REDIS_HOST** | Backend Cache | `localhost` | `redis-cache.service.ts` | No | Yes |
| **REDIS_PORT** | Backend Cache | `6379` | `redis-cache.service.ts` | No | Yes |
| **POSTGRES_USER** | Docker Postgres | `postgres` | `docker-compose.yml` | Yes (in Docker) | Yes |
| **POSTGRES_PASSWORD** | Docker Postgres | `password123` | `docker-compose.yml` | Yes (in Docker) | Yes |
| **POSTGRES_DB** | Docker Postgres | `trash_here` | `docker-compose.yml` | Yes (in Docker) | Yes |
| **VITE_API_BASE_URL** | Frontend Client | `http://localhost:3000/api/v1` | `env.config.ts`, `client.ts`, socket services | No (default local)| Yes |
| **VITE_APP_NAME** | Frontend UI | `Trash Here Enterprise` | `env.config.ts` | No | Yes |
| **VITE_ENVIRONMENT** | Frontend Env | `development` | `env.config.ts` | No | Yes |
| **VITE_CLOUDINARY_CLOUD_NAME**| Frontend Upload | `trash-here-cloud` | `cloudinary.service.ts` | No (simulates) | Yes |
| **VITE_CLOUDINARY_UPLOAD_PRESET**| Frontend Upload| `mock_preset` | `cloudinary.service.ts` | No (simulates) | Yes |
| **FIREBASE_* / STRIPE_* / GOOGLE_MAPS_*** | Roadmap / Unused| `mock-...` | *Unused defined in `.env` templates* | No | No |

---

## 4. Strict Engineering Rules & Continuation Guidelines for Future Sessions

Whenever a new chat session is opened or work resumes on **Trash Here Enterprise**, all engineers and AI assistants must strictly adhere to these rules:

1. **Do Not Rewrite Verified Production Code**: Modules verified during previous sprints (`AuthModule`, `UsersModule`, `WasteCategoriesModule`, `PickupsModule`, etc.) must not be rewritten, restructured, or touched unless a specific bug is discovered during formal testing.
2. **Never Generate Real Secrets or Overwrite `.env` Files**: Always use safe `mock_...` development placeholders when updating `.env.example` templates. Never overwrite the developer's live `.env`, `backend/.env`, or `frontend/.env` files.
3. **Zero Compilation & Zero Lint Warning Quality Gate**: All code modifications must pass:
   - `npm run typecheck` (in both `backend` and `frontend`) with **0 errors**.
   - `npm test` across unit test suites.
   - `npm run build` without failure.
4. **Preserve Existing UI and Business Logic**: Do not alter frontend components, design systems (Tailwind/Framer Motion/Radix), or API payload contracts without explicit user authorization.
5. **Always Reference this Progress Ledger**: Before starting a new task, review `PROJECT_CONTEXT_AND_PROGRESS.md` and `ENGINEERING_EXCELLENCE.md` to ensure architectural alignment.

---
*Last Updated: July 2026 — Trash Here Enterprise Engineering Team*
