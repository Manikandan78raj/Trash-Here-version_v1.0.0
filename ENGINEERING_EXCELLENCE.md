# Trash Here — Engineering Excellence Documentation
> Built to Google Staff Software Engineer, Netflix Senior SRE, and Uber Platform Engineer standards.

## 1. Architecture & Monorepo Overview
The Trash Here platform is structured as an enterprise monorepo managing both backend micro-services and modern web frontend clients:
- **Backend Service**: NestJS (TypeScript, Express engine) utilizing modular domain-driven design, Swagger OpenAPI documentation, and Prisma ORM for database persistence.
- **Frontend Application**: React 18 with Vite, Tailwind CSS, Framer Motion animations, Radix UI accessible primitives, and TanStack Query state synchronization.
- **State & Persistence**: PostgreSQL 16 with automated schema migrations and seed state management.

---

## 2. Testing Strategy & Coverage Verification
Our testing strategy enforces strict quality gates across the pyramid:
- **Backend Unit Tests (Jest)**: 100% test suite pass rate covering all domain services (`Admin`, `Auth`, `Collectors`, `Pickups`, `Users`, `Wallet`, `WasteCategories`). Enforces a strict **>80% code coverage threshold** across statements, lines, functions, and branches.
- **Backend E2E Integration Tests (Supertest)**: Verifies full HTTP request-response lifecycles, authentication guards, input validation pipes, and error exception filters.
- **Frontend Component Tests (Vitest & RTL)**: 100% test suite pass rate across core design system components (`Button`, `Card`, `Badge`, `Input`, `Typography`) and feature components (`WelcomeBanner`).
- **E2E Browser Automation (Playwright)**: End-to-end user journey verification simulating real browser interactions across household booking and tracking flows.

---

## 3. Continuous Integration & Continuous Delivery (CI/CD)
The project utilizes GitHub Actions (`.github/workflows/ci.yml`) to enforce an automated, zero-defect pipeline on all pull requests and branch merges:
1. **Dependency Installation**: Clean reproducible installs via `npm ci`.
2. **Prisma Validation**: Verifies schema integrity and generates Prisma client artifacts (`npm run db:validate`).
3. **Linting (Zero Warnings Policy)**: Executes ESLint across backend and frontend workspaces (`npm run lint`).
4. **Type Checking (Zero Compilation Errors)**: Strict TypeScript compilation checks (`npm run typecheck`).
5. **Production Build Gate**: Compiles standalone production bundles for API and SPA (`npm run build`).
6. **Automated Test suites**: Executes Jest unit tests, Vitest component tests, and Supertest E2E integration tests (`npm run test`).

---

## 4. Docker Containerization & Orchestration
The application is fully dockerized for cloud-native deployment using multi-stage builds:
- **Backend Dockerfile**: Multi-stage build (`node:20-alpine`) compiling TypeScript to JavaScript and pruning dev dependencies for minimal production image footprint.
- **Frontend Dockerfile**: Multi-stage build compiling Vite SPA static assets and deploying onto a hardened `nginx:alpine` runtime server.
- **Nginx Reverse Proxy & Security**: Hardened `nginx.conf` serving static SPA assets with 1-year immutable caching, Gzip compression, API reverse proxying to `http://backend:3000/api/`, and enterprise security headers (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`).
- **Docker Compose Orchestration**: Multi-container network connecting `trash_here_db` (PostgreSQL with healthcheck probes), `trash_here_backend` (NestJS API), and `trash_here_frontend` (Nginx SPA).

---

## 5. Observability, Security & Health Monitoring
- **Health & Readiness Probes (`@nestjs/terminus`)**:
  - `GET /api/v1/health/liveness`: Monitors memory heap (<300MB) and RSS consumption (<500MB) for container orchestration liveness checks.
  - `GET /api/v1/health/readiness`: Verifies active database ping connectivity with PostgreSQL and system memory availability.
- **Rate Limiting & DDOS Protection (`@nestjs/throttler`)**: Enforces global API rate limits (100 requests per minute per client IP) using `ThrottlerGuard`.
- **Security Hardening**: Integrated Helmet middleware setting HTTP security headers, CORS policies with explicit origin allowlists, and global input validation pipes with implicit type conversion.
- **Structured Logging**: Enterprise logger formatting startup telemetry and API routing documentation endpoints.
