## Railway deployment notes for EventAtlas backend

- **Service type**: Node.js
- **Build command**: `npm run build`
- **Start command**: `npm run start`

### Required environment variables

Set these in Railway for the backend service:

- `DATABASE_URL` – Postgres connection string (Railway will provide one if you add a PostgreSQL plugin).
- `JWT_SECRET` – long random string.
- `JWT_EXPIRES_IN` – e.g. `7d`.
- `JWT_REFRESH_EXPIRES_IN` – e.g. `30d`.
- `PORT` – leave **unset** so Railway can inject its own `PORT` (the app already respects `process.env.PORT`).
- `FRONTEND_URL` – your deployed Netlify URL, e.g. `https://your-eventatlas-web.netlify.app`.
- `API_BASE_URL` – the public Railway backend URL, e.g. `https://your-backend.up.railway.app`.
- `UPLOAD_DIR` – e.g. `uploads` (default).

