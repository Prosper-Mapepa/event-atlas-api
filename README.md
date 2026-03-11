# EventAtlas Backend

API backend for EventAtlas, built with Express, TypeScript, and Prisma.

## Structure

```
backend/
├── prisma/
│   └── schema.prisma     # Database models
├── src/
│   ├── config/           # Environment & app config
│   ├── db/               # Prisma client
│   ├── middleware/       # Auth, validation
│   ├── routes/           # API route definitions
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── types/            # Shared types
│   └── index.ts          # Entry point
├── package.json
├── tsconfig.json
└── .env.example
```

## Setup

1. Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Create PostgreSQL database and set `DATABASE_URL` in `.env`.

4. Run migrations:

```bash
npm run db:push
```

5. Generate Prisma client:

```bash
npm run db:generate
```

6. Start the server:

```bash
npm run dev
```

The API runs at `http://localhost:4000` by default.

## API

### Health

- `GET /api/health` — Health check

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/signin` | Sign in |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password (with token) |
| GET | `/api/auth/me` | Current user (requires `Authorization: Bearer <token>`) |

### Sign up

```json
POST /api/auth/signup
{
  "email": "you@example.com",
  "password": "SecurePass1!",
  "name": "Alex Johnson",
  "role": "explorer"
}
```

Roles: `explorer` (default), `business`, `admin`. Business can create events (pending approval). Admin can approve events.

Response: `{ "user": { "id", "email", "name", "role" }, "token", "expiresIn" }`

### Sign in

```json
POST /api/auth/signin
{
  "email": "you@example.com",
  "password": "SecurePass1!"
}
```

Response: `{ "user": { "id", "email", "name" }, "token", "expiresIn" }`

### Forgot password

```json
POST /api/auth/forgot-password
{
  "email": "you@example.com"
}
```

### Reset password

```json
POST /api/auth/reset-password
{
  "token": "<reset-token-from-email>",
  "newPassword": "NewSecure1!"
}
```

## Frontend integration

Point the frontend to the backend base URL (e.g. `http://localhost:4000`). Auth responses include a JWT in `token`; send it as:

```
Authorization: Bearer <token>
```

Ensure `FRONTEND_URL` in `.env` matches the frontend origin for CORS.

## Users & Events

- `GET /api/users/me` — Current profile (auth)
- `PATCH /api/users/me` — Update profile (auth)
- `PATCH /api/events/:id` — Update event (host or admin). Admin can set `status` (approved, rejected).
- `GET /api/events/pending` — Pending events (admin only)

## File upload

- `POST /api/upload/events/image` — Upload event image (business/admin, `multipart/form-data`, field `file`)

Images are stored in `uploads/` and served at `/uploads/:filename`.
