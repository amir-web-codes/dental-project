# Dental Project

> A modular backend for a dental services platform, focused on secure authentication, user management, dentist verification, and scalable healthcare workflows.

**TypeScript · Node.js · Express · PostgreSQL · Prisma · Redis · JWT · Zod · Docker**

## Overview

**Dental Project** is a backend-focused application designed as the foundation of a modern dental services platform.

The project goes beyond basic CRUD operations and focuses on real-world backend concerns such as passwordless authentication, refresh-token sessions, role-based access control, account moderation, dentist onboarding, and professional verification.

Its modular architecture is designed to support future features such as appointment scheduling, payments, reviews, and clinic management without requiring major structural changes.

## Key Features

- 🔐 **OTP Authentication** — Phone-based passwordless login with Redis-backed OTP storage and expiration
- 🔄 **Session Management** — Access/refresh tokens, token rotation, revocation, and device-aware sessions
- 👤 **User Management** — Profile management, dashboards, role changes, soft deletion, ban/unban workflows
- 🛡️ **Role-Based Access Control** — Separate permissions for `USER`, `DENTIST`, and `ADMIN`
- 🦷 **Dentist Profiles** — Professional profile data including specialty, license, experience, and clinic details
- ✅ **Dentist Verification** — `DRAFT → PENDING → VERIFIED / REJECTED` review workflow
- 🔎 **Dentist Discovery** — Public dentist listing with filtering and pagination
- 📝 **Role Requests** — User role-change requests with administrative review
- 🚦 **Rate Limiting** — Dedicated protection for authentication and sensitive actions
- 📋 **Structured Logging** — Winston-based logging with rotating log files
- 🐳 **Dockerized Infrastructure** — PostgreSQL and Redis for local development

## Tech Stack

| Category                | Technology                       |
| ----------------------- | -------------------------------- |
| Language                | TypeScript                       |
| Runtime                 | Node.js                          |
| Framework               | Express 5                        |
| Database                | PostgreSQL                       |
| ORM                     | Prisma                           |
| Cache / Temporary State | Redis                            |
| Authentication          | JWT + OTP                        |
| Validation              | Zod                              |
| Security                | Helmet, CORS, express-rate-limit |
| Logging                 | Winston, Morgan                  |
| File Handling           | Multer                           |
| Infrastructure          | Docker Compose                   |

## Architecture

The backend follows a **feature-based modular architecture**, keeping business logic close to the domain it belongs to.

```text
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── configs/
│   ├── errors/
│   ├── middlewares/
│   ├── modules/
│   │   ├── auth/
│   │   ├── dentist/
│   │   └── user/
│   ├── types/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── docker-compose.yml
└── package.json
```

Each feature can contain its own routing, controller, service, validation, types, and domain-specific logic. This keeps the codebase maintainable as new modules are introduced.

## Core Data Model

The current backend is centered around:

- **User** — identity, profile, role, account status, moderation metadata
- **Token** — persistent refresh sessions and device information
- **Dentist** — professional and verification information
- **Request** — role-change requests and admin review state

Moderation actions also retain information such as who performed an action and when it occurred.

## Getting Started

### Prerequisites

Make sure you have:

- Node.js
- npm
- Docker & Docker Compose
- Git

### 1. Clone the Repository

```bash
git clone git@github.com:amir-web-codes/dental-project.git
cd dental-project/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Example local configuration:

```env
PORT=3000
NODE_ENV=development

ACCESS_TOKEN_KEY=your_strong_access_token_secret
REFRESH_TOKEN_KEY=your_strong_refresh_token_secret

POSTGRES_USER=User
POSTGRES_PASSWORD=StrongPassword
POSTGRES_DB=Dental
DATABASE_URL=postgresql://User:StrongPassword@localhost:5432/Dental?schema=public

REDIS_PASSWORD=StrongRedisPassword
REDIS_URL=redis://:StrongRedisPassword@localhost:6379
```

> The application requires `REDIS_URL`, while the Docker Redis service uses `REDIS_PASSWORD`.

### 4. Start PostgreSQL & Redis

```bash
docker compose up -d
```

### 5. Generate Prisma Client & Apply Migrations

```bash
npx prisma generate
npx prisma migrate dev
```

### 6. Start the Development Server

```bash
npm run dev
```

The API runs on:

```text
localhost:3000
```

## Available Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Compile TypeScript           |
| `npm start`     | Run the compiled application |

## Security Highlights

The backend includes multiple security layers:

- OTP expiration and request limiting
- Hashed refresh-token storage
- Refresh-token revocation
- Authentication middleware
- Role-based authorization
- Ban checks
- Profile-completion checks
- Zod request validation
- Helmet security headers
- Configurable CORS
- Endpoint-specific rate limits
- Centralized error handling

## Current Status

The current implementation focuses on the **core identity and professional-management layer** of the platform:

```text
Authentication           ✅
User Management          ✅
Role Management          ✅
Dentist Profiles         ✅
Dentist Verification     ✅
Account Moderation       ✅
PostgreSQL / Prisma      ✅
Redis Integration        ✅
Appointment System       🚧 Planned
Frontend                 🚧 Planned
```

## Roadmap

Planned improvements include:

- 📅 Appointment scheduling and dentist availability
- 🏥 Multi-clinic and service management
- ⭐ Patient reviews and dentist ratings
- 💳 Payment and transaction workflows
- 🔔 SMS/email notifications and background jobs
- 📖 OpenAPI / Swagger documentation
- 🧪 Automated unit and integration testing
- ⚙️ CI/CD and production deployment
- 🎨 Patient, dentist, and admin frontend applications

## Engineering Focus

This project is primarily built to demonstrate backend engineering concepts such as:

**modular architecture, relational data modeling, secure authentication, persistent sessions, authorization boundaries, validation, moderation workflows, Redis integration, and maintainable domain design.**

## Author

Developed by **Amir — @amir-web-codes**

---

If you're reviewing this project from an engineering perspective, the most relevant areas are:

```text
backend/src/modules/
backend/src/middlewares/
backend/src/configs/
backend/prisma/schema.prisma
```

They provide the clearest view of the project's architecture, authentication strategy, business rules, and database design.
