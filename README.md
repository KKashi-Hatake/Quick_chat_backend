# Quick Chat Backend

Express + Socket.IO backend for Quick Chat.

## Supported Features

- Auth and user APIs
- 1:1 real-time chat APIs + socket events
- 1:1 video call signaling via Socket.IO
- Call history API (`/api/v1/call/history`)

## Tech Stack

- Express
- Prisma + PostgreSQL
- Socket.IO
- AWS S3 (profile image keys + presigned URLs)

## Environment

Create `.env` using `.env.sample`:

```env
PORT=5000
DATABASE_URL=postgresql://...
CLIENT_URL=http://localhost:3000
JWT_SECRET_KEY=...

AWS_S3_REGION=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=...
```

Notes:
- `CLIENT_URL` must match the frontend origin exactly.
- This value is used by Socket.IO CORS config and should be updated when frontend origin changes.

## Run Locally

```bash
npm install
npm run dev
```

Server default: `http://localhost:5000`

## API Base

All routes are mounted under:

`/api/v1`

Examples:
- `GET /api/v1/conv/getAll`
- `GET /api/v1/call/history`

## Using ngrok

If frontend uses ngrok, backend should also be tunneled.

1. Start backend on `5000`.
2. Start ngrok tunnel for `5000`.
3. Set backend `.env`:
   - `CLIENT_URL=<frontend_ngrok_url>`
4. Restart backend server.

Then set frontend `NEXT_PUBLIC_BACKEND_URL=<backend_ngrok_url>`.

## CORS / Socket Notes

- Express CORS is configured with allowed origins including `CLIENT_URL`.
- Socket.IO CORS is configured in `src/index.ts`.
- Chat and video signaling depend on successful socket connection.

## Call History Avatar Behavior

- Call history includes caller and receiver user info.
- Avatar keys are converted to presigned URLs in call history controller before response.
