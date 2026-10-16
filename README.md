<h1 align="center">Codebase NestJS</h1>

Backend skeleton built with NestJS. It applies event-listener driven development, queue processing, realtime WebSocket, scheduled tasks, and caching, with RESTful design, SOLID, dependency injection, the repository pattern, and DTOs.

It shares one REST contract and the same realtime events with Codebase FastAPI and Codebase Laravel, so Codebase Nuxt and Codebase Next work with any of them.

## Conventions

| Topic | Rule |
|-------|------|
| Brand | Codebase. Primary `#2563eb`, secondary `#84cc16`, tertiary `#1e3a8a` |
| Roles | `superadmin`, `admin`, `user` |
| Format | Indent 4, double quotes, trailing commas, space before `(`. Keep JSDoc |
| Layers | Controller, service, repository. Validator DTO in, transformer DTO out. Events and listeners for side effects |
| Validation | HTTP 422 `{ "detail": [{ "type", "loc", "msg", "input", "ctx" }] }` |
| Errors | `{ "detail": "..." }` |
| Locales | `en`, `id`, `ms` |
| GraphQL | Not mounted |
| Mongo | Off when `DATABASE_MONGO_URI` is empty |
| Rate limits | Production only |

Cursor rules live in `.cursor/rules/`. Scripts run with Bun.

## Features

| Feature | Technology |
|---------|------------|
| REST API with Swagger | NestJS |
| JWT access and refresh tokens | @nestjs/jwt |
| Realtime | Socket.IO |
| Queue | Bull + Redis |
| Scheduled tasks | @nestjs/schedule |
| Database | Prisma + PostgreSQL |
| Import and export (CSV, XLS, XLSX) | xlsx |
| Notifications and Web Push | web-push |
| Email | Nodemailer + Handlebars |
| Internationalization | nestjs-i18n (`en`, `id`, `ms`) |
| Tests | Jest + Supertest |

## Getting Started

### Requirements

- Node.js 20+
- Bun 1.1+
- PostgreSQL 14+
- Redis 7+

### Setup

```bash
bun install
cp .env.example .env
bun run cli secret
bun run postgre:migrate
bun run cli v1:user:seed
```

Put the generated secret in `APP_SECRET`. The seeder creates `superuser@{APP_EMAIL_SERVER}` with password `12345678`.

### Configuration

| Variable | Description |
|----------|-------------|
| `APP_SECRET` | Encryption and JWT signing key |
| `APP_ENV` | `production` turns on rate limits |
| `FRONTEND_URL` | Base URL for signed links in emails |
| `CORS_ORIGIN` | Allowed origins as a JSON array or comma list |
| `DATABASE_POSTGRE_URI` | PostgreSQL connection |
| `DATABASE_MONGO_URI` | Optional MongoDB connection |
| `MEMORY_REDIS_*` | Redis for cache and queues |
| `MAIL_URI` | SMTP connection |
| `VAPID_*` | Optional Web Push keys (`npx web-push generate-vapid-keys`) |

### Run

| Command | Description |
|---------|-------------|
| `bun run dev` | Development server on `http://localhost:8000` |
| `bun run prod` | Build and start the production server |

Queues for import, export, and Web Push run inside the application. Swagger UI: `http://localhost:8000/api/docs`

## API

All routes live under `/api/v1`.

| Area | Routes |
|------|--------|
| Auth | `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password/{email}`, `/auth/verify-email/{email}` |
| Profile | `/users/me`, `/users/me/accesses`, `/users/me/interests` |
| Notifications | `/notifications/*` |
| Web Push | `/webpush/subscribe`, `/webpush/unsubscribe` |
| Admin | `/admin/users`, `/admin/roles`, `/admin/permissions`, `/admin/activities`, `/admin/notifications`, `/admin/settings`, `/admin/dashboard`, `/admin/search` |

Login body is `{ "identifierKey": "email" | "name", "identifierValue": "...", "password": "..." }` and returns `{ accessToken, refreshToken, accessTokenTtl, refreshTokenTtl }`. `identifierKey` is optional; without it, a value containing `@` is treated as an email, otherwise as a name.

Lists accept `limitPage`, `currentPage`, `orders=field:asc`, and `filters=key:value` and return `{ total, totalPage, perPage, currentPage, nextPage, previousPage, firstPage, lastPage, data }`.

## Realtime

Socket.IO is served at `/socket.io`. Connect with `auth: { token: accessToken }`. Each user joins room `user:{id}`.

| Event | Payload |
|-------|---------|
| `v1.notification.created` | `id`, `unread` |
| `v1.admin.refresh` | `userId`, `scopes` |
| `v1.user.admin.imported` | `userId`, `filename`, `totalImported`, `totalSkipped` |
| `v1.user.admin.imported-failed` | `userId`, `filename`, `error` |
| `v1.user.admin.exported` | `userId`, `filename`, `fileUrl` |
| `v1.user.admin.exported-failed` | `userId`, `error` |
| `v1.acl.role.admin.*`, `v1.acl.permission.admin.*` | Same as the user import and export events |
| `v1.user.admin.activated`, `v1.user.admin.deactivated` | `id`, `name`, `email`, `email_verified_at`, `created_at`, `updated_at`, `deleted_at` |

Import and export events go to the admin who started the job. Activate and deactivate events go to the affected user.

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:8000", {
    path: "/socket.io",
    transports: ["websocket"],
    auth: { token: accessToken },
});

socket.on("v1.notification.created", (data) => console.log(data.id, data.unread));
socket.on("v1.user.admin.exported", (data) => console.log(data.fileUrl));
```

## Testing

```bash
bun run test
```

## Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start with file watching |
| `bun run prod` | Build and start for production |
| `bun run build` | Build the application |
| `bun run test` | Run the end-to-end tests |
| `bun run lint` | Format and lint |
| `bun run prisma` | Generate the Prisma clients |
| `bun run postgre:migrate` | Run PostgreSQL migrations |
| `bun run mongo:migrate` | Push the MongoDB schema when `DATABASE_MONGO_URI` is set |
| `bun run cli secret` | Generate `APP_SECRET` |
| `bun run cli v1:user:seed` | Seed default users |
| `bun run doc` | Generate code documentation |

## Author

- Trip Teknologi ([@tripteki](https://linkedin.com/company/tripteki))
- Hasby Maulana ([@hsbmaulana](https://linkedin.com/in/hsbmaulana))
