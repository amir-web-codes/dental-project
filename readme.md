# Dental Project — Backend Platform for Verified Dental Services

> A security-focused, modular backend foundation for a dental services platform — built around OTP authentication, verified dentist profiles, role-based access control, account moderation, and scalable service architecture.

**TypeScript • Node.js • Express • PostgreSQL • Prisma • Redis • JWT • Zod • Docker**

---

## Overview

**Dental Project** is a backend-focused platform designed as the foundation of a modern dental services ecosystem.

Rather than starting with a simple CRUD application, the project focuses on the infrastructure required by a real-world healthcare-oriented product:

- secure phone-based authentication,
- session and refresh-token management,
- user lifecycle management,
- role-based authorization,
- dentist onboarding and verification,
- administrative moderation,
- audit-friendly account actions,
- filtering and pagination,
- Redis-backed temporary state,
- structured logging,
- validation,
- rate limiting,
- and a modular architecture designed to grow into a complete booking platform.

The current implementation primarily covers **identity, authorization, account management, and dentist verification/discovery**. Appointment scheduling and other clinic-management capabilities are part of the planned roadmap.

---

## Why This Project Matters

This project demonstrates more than endpoint implementation.

It focuses on backend concerns commonly encountered in production systems:

- Authentication without traditional passwords
- Short-lived access tokens and refresh-token lifecycle management
- Device-aware sessions
- Revocable refresh tokens
- Role and permission boundaries
- Admin moderation flows
- Soft-delete and ban history
- Professional profile verification workflows
- Persistent relational data modeling
- Redis-backed OTP workflows
- Request validation
- API rate limiting
- Centralized error handling
- Structured application logs
- Clear feature boundaries

The architecture is intentionally prepared for future modules such as appointments, dentist availability, payments, reviews, notifications, and clinic management.

---

## Current Project Status

| Area                              | Status         |
| --------------------------------- | -------------- |
| Backend foundation                | ✅ Implemented |
| OTP authentication                | ✅ Implemented |
| Refresh-token sessions            | ✅ Implemented |
| User management                   | ✅ Implemented |
| Role management                   | ✅ Implemented |
| User moderation                   | ✅ Implemented |
| Dentist profiles                  | ✅ Implemented |
| Dentist verification workflow     | ✅ Implemented |
| Public dentist discovery          | ✅ Implemented |
| PostgreSQL persistence            | ✅ Implemented |
| Redis integration                 | ✅ Implemented |
| Docker development infrastructure | ✅ Implemented |
| Appointment scheduling            | 🗺️ Roadmap     |
| Payments                          | 🗺️ Roadmap     |
| Reviews & ratings                 | 🗺️ Roadmap     |
| Frontend application              | 🗺️ Roadmap     |
| OpenAPI / Swagger documentation   | 🗺️ Roadmap     |
| Automated test suite              | 🗺️ Roadmap     |

---

# Features

## 🔐 Passwordless OTP Authentication

Authentication is designed around a phone-number + OTP flow.

The backend supports:

- Requesting an OTP
- Verifying an OTP
- Creating users from verified phone numbers
- Access-token issuance
- Refresh-token issuance
- Refresh-token rotation
- Logout and token revocation
- Redis-backed OTP storage
- OTP expiration
- Verification-attempt protection
- Phone/IP-based request limiting

This keeps temporary authentication state out of the main relational database while allowing fast expiration and rate-control behavior.

---

## 🔄 Session & Token Management

The authentication layer uses separate access and refresh tokens.

Refresh sessions are persisted so that they can be managed instead of remaining completely stateless.

The session model supports information such as:

- hashed refresh tokens,
- user ownership,
- device identifier,
- user agent,
- expiration time,
- revocation state,
- and creation time.

This architecture makes features such as session revocation and device-level session control possible.

---

## 👤 User Account Management

Authenticated users can manage their own account while administrators have access to moderation and account-management operations.

Implemented capabilities include:

- View current profile
- Update current profile
- User dashboard
- Admin user dashboard
- Admin user details
- Role changes
- User banning
- User unbanning
- Soft deletion
- Profile-completion checks
- Role-change requests
- Administrative request review

---

## 🛡️ Role-Based Access Control

The platform currently defines three roles:

| Role      | Purpose               |
| --------- | --------------------- |
| `USER`    | Regular platform user |
| `DENTIST` | Dental professional   |
| `ADMIN`   | Administrative access |

Authorization middleware protects sensitive routes and separates regular user, dentist, and administrator capabilities.

---

## 🦷 Dentist Profiles

Dentist accounts have a dedicated profile model rather than storing professional metadata directly on the base user.

A dentist profile can contain:

- License number
- Biography
- Specialty
- Years of experience
- Clinic name
- Clinic address
- Verification state
- Rejection reason
- Operational status
- Soft-delete metadata

### Supported Dental Specialties

- General Dentistry
- Orthodontics
- Endodontics
- Periodontics
- Prosthodontics
- Oral Surgery

---

## ✅ Dentist Verification Workflow

Professional verification is implemented as an explicit workflow.

Verification states include:

```text
DRAFT
PENDING
VERIFIED
REJECTED
```

Typical lifecycle:

```text
Dentist creates/completes profile
          ↓
Requests verification
          ↓
        PENDING
          ↓
   Admin reviews profile
      ↙          ↘
 VERIFIED      REJECTED
```

Administrative endpoints allow pending profiles to be reviewed while verification-specific rate limits help protect sensitive operations.

---

## 🔎 Public Dentist Discovery

Public dentist listing is available independently of administrative APIs.

The listing logic can work with filters such as:

- specialty,
- minimum years of experience,
- clinic search,
- pagination,
- verification status where appropriate,
- and account/profile status.

Public discovery is restricted to profiles that meet the application's visibility rules, while privileged administrative flows can access additional profile states.

---

## 🚫 Account Moderation

Administrative account controls include:

- User banning
- User unbanning
- Role updates
- Soft deletion
- Request review
- Dentist verification review

The relational model keeps moderation-related metadata such as:

- who performed the action,
- when the action happened,
- ban expiration,
- ban reason,
- unban information,
- and deletion information.

This is more audit-friendly than simply toggling a boolean flag.

---

## 📝 Role Request Workflow

Users can request a role change through a dedicated request system.

Requests support:

```text
OPEN
APPROVED
REJECTED
```

Administrators can:

- list requests,
- inspect individual requests,
- approve requests,
- reject requests,
- and record review metadata.

---

# Tech Stack

| Layer                    | Technology                |
| ------------------------ | ------------------------- |
| Runtime                  | Node.js                   |
| Language                 | TypeScript                |
| Web Framework            | Express 5                 |
| Database                 | PostgreSQL                |
| ORM                      | Prisma                    |
| Cache / Temporary State  | Redis                     |
| Validation               | Zod                       |
| Authentication           | JWT + OTP                 |
| Password / Token Hashing | bcrypt                    |
| Phone Utilities          | libphonenumber-js         |
| Security Headers         | Helmet                    |
| Rate Limiting            | express-rate-limit        |
| File Handling            | Multer                    |
| HTTP Logging             | Morgan                    |
| Application Logging      | Winston                   |
| Log Rotation             | winston-daily-rotate-file |
| Local Infrastructure     | Docker Compose            |

---

# Architecture

The backend follows a **feature-oriented modular architecture**.

Instead of placing every controller, service, and validation file in large global directories, domain-specific code is grouped by feature.

```text
dental-project/
└── backend/
    ├── prisma/
    │   └── schema.prisma
    │
    ├── src/
    │   ├── configs/
    │   │   ├── cors.ts
    │   │   ├── database.ts
    │   │   ├── logger.ts
    │   │   ├── middlewares.ts
    │   │   ├── prisma.ts
    │   │   ├── rateLimiter.ts
    │   │   └── redis.ts
    │   │
    │   ├── errors/
    │   │
    │   ├── middlewares/
    │   │
    │   ├── modules/
    │   │   ├── auth/
    │   │   ├── dentist/
    │   │   └── user/
    │   │
    │   ├── types/
    │   │
    │   ├── utils/
    │   │
    │   ├── app.ts
    │   └── server.ts
    │
    ├── docker-compose.yml
    ├── package.json
    └── tsconfig.json
```

### Why Feature-Based Modules?

This structure keeps related logic together.

A domain can own its:

- router,
- controller,
- service,
- validation,
- rate limiter,
- types,
- and supporting logic.

As the application grows, modules such as `appointment`, `payment`, `review`, or `clinic` can be added without turning the project into one large shared folder structure.

---

# Data Model

The current relational schema revolves around four primary entities.

## User

Stores the platform identity and account lifecycle.

Important concepts include:

- unique phone number,
- personal profile fields,
- role,
- account status,
- profile completion,
- ban metadata,
- soft deletion,
- last login,
- and audit relations.

## Token

Stores refresh-session information.

Important concepts include:

- hashed token,
- associated user,
- device ID,
- user agent,
- expiration,
- and revocation.

## Dentist

Extends a user with professional dental information.

Important concepts include:

- license number,
- specialty,
- experience,
- clinic details,
- verification status,
- and dentist operational status.

## Request

Represents user role-change requests and their administrative review lifecycle.

---

# API Overview

The following table describes the currently exposed API surface.

## Authentication

| Method | Endpoint              | Description                           | Access         |
| ------ | --------------------- | ------------------------------------- | -------------- |
| `POST` | `/auth/request-otp`   | Request authentication OTP            | Public         |
| `POST` | `/auth/verify-otp`    | Verify OTP and authenticate           | Public         |
| `POST` | `/auth/refresh-token` | Refresh authentication session        | Public/session |
| `POST` | `/auth/logout`        | Revoke current authentication session | Authenticated  |

## Users

| Method   | Endpoint                        | Description                    |
| -------- | ------------------------------- | ------------------------------ |
| `GET`    | `/users/me`                     | Get current user profile       |
| `PATCH`  | `/users/me`                     | Update current profile         |
| `GET`    | `/users/me/dashboard`           | Get current user dashboard     |
| `GET`    | `/users/admin/:id/dashboard`    | Admin view of a user dashboard |
| `GET`    | `/users/admin/:id`              | Get user details as admin      |
| `DELETE` | `/users/admin/:id`              | Soft-delete a user             |
| `PATCH`  | `/users/admin/:id/role`         | Change user role               |
| `PATCH`  | `/users/admin/:id/ban`          | Ban a user                     |
| `PATCH`  | `/users/admin/:id/unban`        | Unban a user                   |
| `POST`   | `/users/requests/create`        | Create role request            |
| `GET`    | `/users/admin/requests/get-all` | List role requests             |
| `GET`    | `/users/admin/requests/:id`     | Get a role request             |
| `PATCH`  | `/users/admin/requests/:id`     | Review a role request          |

## Dentists

| Method  | Endpoint                            | Description                         |
| ------- | ----------------------------------- | ----------------------------------- |
| `GET`   | `/dentists/get-all`                 | Browse visible dentist profiles     |
| `GET`   | `/dentists/me`                      | Get own dentist profile             |
| `PATCH` | `/dentists/me`                      | Update own dentist profile          |
| `POST`  | `/dentists/me/request-verification` | Request professional verification   |
| `GET`   | `/dentists/admin/pending/get-all`   | List pending dentist profiles       |
| `GET`   | `/dentists/admin/:id`               | Inspect dentist profile as admin    |
| `PATCH` | `/dentists/admin/:id/verification`  | Approve/reject dentist verification |

> Authentication, role, ban, profile-completion, validation, and rate-limiter middleware are applied according to the sensitivity of each route.

---

# Security Design

Security is handled across several layers.

## Authentication

- OTP-based login
- Redis-backed temporary OTP state
- Short-lived access tokens
- Persistent refresh sessions
- Refresh-token hashing
- Session revocation

## Authorization

- Authentication middleware
- Role checks
- User-ban checks
- Profile-completion checks
- Administrator-only operations
- Dentist-specific operations

## Request Protection

- Zod schema validation
- IP-based OTP throttling
- Phone-based OTP throttling
- Sensitive-action rate limits
- Helmet security headers
- CORS configuration
- Centralized error processing

## Auditability

Important administrative actions retain actor/time metadata rather than only changing the final state.

---

# Logging & Observability

The backend includes structured application logging with **Winston**.

Logging support includes:

- JSON-oriented structured logs
- error logs
- warning logs
- informational logs
- combined logs
- daily rotation
- archive compression
- retention limits

The project also contains request-level infrastructure that makes production debugging and future request tracing easier.

---

# Getting Started

## Prerequisites

Install the following before starting:

- A recent Node.js LTS release
- npm
- Docker
- Docker Compose
- Git

PostgreSQL and Redis can be started through the included Docker Compose configuration, so installing them directly on the host is optional.

---

## 1. Clone the Repository

Using SSH:

```bash
git clone git@github.com:amir-web-codes/dental-project.git
cd dental-project/backend
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Create the Environment File

Copy the example file:

```bash
cp .env.example .env
```

A practical local configuration looks like:

```env
PORT=3000
NODE_ENV=development

ACCESS_TOKEN_KEY=replace_with_a_long_random_access_token_secret
REFRESH_TOKEN_KEY=replace_with_a_long_random_refresh_token_secret

POSTGRES_USER=User
POSTGRES_PASSWORD=StrongPassword
POSTGRES_DB=Dental

DATABASE_URL=postgresql://User:StrongPassword@localhost:5432/Dental?schema=public

REDIS_PASSWORD=StrongRedisPassword
REDIS_URL=redis://:StrongRedisPassword@localhost:6379
```

### Important Redis Setup Note

The current repository's `.env.example` contains the PostgreSQL and JWT variables, but the application also reads `REDIS_URL`, while `docker-compose.yml` expects `REDIS_PASSWORD`.

For local development, add both values to your `.env` as shown above.

This is a good candidate for a small future cleanup of `.env.example`.

---

## 4. Start PostgreSQL and Redis

```bash
docker compose up -d
```

Check the containers:

```bash
docker compose ps
```

The development infrastructure exposes:

```text
PostgreSQL → localhost:5432
Redis      → localhost:6379
```

---

## 5. Generate Prisma Client

```bash
npx prisma generate
```

---

## 6. Apply Database Migrations

For local development:

```bash
npx prisma migrate dev
```

For a production/deployment environment with committed migrations:

```bash
npx prisma migrate deploy
```

---

## 7. Start the Development Server

```bash
npm run dev
```

Default backend address:

```text
localhost:3000
```

---

# Available Scripts

Run commands from the `backend` directory.

| Command         | Description                                       |
| --------------- | ------------------------------------------------- |
| `npm run dev`   | Start development server with Nodemon and ts-node |
| `npm run build` | Compile TypeScript into JavaScript                |
| `npm start`     | Start the compiled application                    |

### Production Build

```bash
npm run build
npm start
```

---

# Development Tips

## Prisma Schema Changes

After modifying the Prisma schema:

```bash
npx prisma migrate dev --name meaningful_migration_name
npx prisma generate
```

Inspect your local database with:

```bash
npx prisma studio
```

---

## Reset Local Infrastructure

Stop containers:

```bash
docker compose down
```

Stop containers **and delete local database/Redis volumes**:

```bash
docker compose down -v
```

> `-v` permanently removes local Docker volumes. Use it only when you intentionally want a clean database.

---

## macOS / Linux Development Script

The current `dev` script uses the Windows `cls` command before starting `ts-node`.

If your shell reports that `cls` does not exist, run the underlying development command directly or remove `cls &&` from the script for cross-platform development.

For example:

```bash
npx nodemon --watch src --ext ts --exec "ts-node --files src/server.ts"
```

---

# Engineering Highlights

From an engineering perspective, this project demonstrates:

- Feature-oriented TypeScript architecture
- Relational domain modeling with Prisma
- PostgreSQL indexes and relations
- Redis as ephemeral authentication infrastructure
- Secure refresh-session persistence
- Device-aware token management
- Role-based authorization
- Stateful moderation workflows
- Dentist verification lifecycle
- Soft-delete strategy
- Administrative auditing
- Reusable validation middleware
- Rate-limit strategies based on endpoint sensitivity
- Structured logging
- Centralized error handling
- Dockerized development infrastructure

---

# Roadmap / Future Improvements

The existing backend is designed to become the foundation of a broader dental-services product.

## Appointment & Availability System

- Dentist working hours
- Weekly availability rules
- Time-slot generation
- Appointment booking
- Rescheduling
- Cancellation policies
- Appointment states
- Prevention of overlapping bookings
- Time-zone-aware scheduling

## Clinic Management

- Multiple clinics per dentist
- Clinic staff
- Clinic schedules
- Services and treatment types
- Service pricing
- Holiday/closure management

## Search & Discovery

- Location-based dentist search
- Geo queries
- Distance sorting
- Advanced specialty filters
- Availability-based search
- Full-text search

## Reviews & Reputation

- Verified-patient reviews
- Dentist ratings
- Review moderation
- Aggregate rating statistics

## Payments

- Payment gateway integration
- Appointment payment status
- Transaction history
- Refund workflow
- Idempotent payment operations

## Notifications

- SMS appointment reminders
- Email notifications
- Verification notifications
- Booking status notifications
- Background notification jobs

## Authentication Enhancements

- Explicit multi-device session management UI
- Session listing/revocation endpoints
- Suspicious-session detection
- Optional 2FA for administrators

## API Documentation

- OpenAPI 3 specification
- Swagger UI
- Request/response examples
- Reusable schemas
- Frontend-generated API types
- Contract validation in CI

## Testing

- Unit tests
- Integration tests
- Supertest API tests
- Authentication lifecycle tests
- Authorization matrix tests
- Database transaction tests
- Redis behavior tests

## DevOps

- API Dockerfile
- Production Docker Compose profile
- GitHub Actions CI
- Automated linting/type checks
- Migration checks
- Test gates
- Deployment pipeline
- Health/readiness endpoints
- Metrics and distributed tracing

## Product Layer

- React/Next.js frontend
- Patient dashboard
- Dentist dashboard
- Admin panel
- Responsive booking experience

---

# Suggested Production Checklist

Before deploying this project publicly:

- Use long randomly generated JWT secrets
- Use managed PostgreSQL and Redis where appropriate
- Enable TLS for external services
- Keep secrets outside source control
- Configure production CORS origins
- Configure a production SMS provider
- Apply Prisma migrations through deployment automation
- Add automated API tests
- Add health/readiness monitoring
- Add API documentation
- Review rate-limit thresholds for production traffic
- Centralize log collection
- Add backup and restore procedures
- Add a repository-level `LICENSE` file

---

# Project Philosophy

The goal of this project is to build the backend as a **maintainable product foundation**, not as a collection of unrelated CRUD endpoints.

Authentication, authorization, user lifecycle, dentist verification, auditing, validation, and infrastructure are established first so that higher-level healthcare workflows can be introduced without rebuilding the core architecture.

---

# Author

Developed by **@amir-web-codes**.

If you are reviewing this repository as part of a hiring process, the most relevant areas to inspect are:

```text
backend/src/modules/
backend/src/middlewares/
backend/src/configs/
backend/prisma/schema.prisma
```

They demonstrate the project's domain modeling, authentication strategy, authorization boundaries, service organization, and infrastructure decisions.

---

# License

The backend package metadata currently declares the **ISC License**.

For a public/open-source release, adding a repository-level `LICENSE` file is recommended.

---

**Dental Project** is actively designed to evolve from a secure account and professional-verification backend into a complete dental discovery and appointment platform.
