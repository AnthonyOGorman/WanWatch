# WanLogger

Self-hosted WAN IPv4 logger with a dashboard + graphs.

## Quick start (Docker)

1. Copy env:
   - `cp .env.example .env`
2. Edit `.env` and set:
   - `ADMIN_PASSWORD`
   - `COOKIE_SECRET` (long random string)
3. Run:
   - `docker compose up --build`
4. Open:
   - http://localhost:3000

Notes:
- On Windows + WSL2, enable Docker Desktop WSL integration for this distro so `docker` works inside WSL.
- The SQLite DB is persisted in `./data/wanlogger.db`.
- If Docker fails with a Docker Desktop engine `EOF` error, restart Docker Desktop (or run `wsl --shutdown`) and try again.
- If the UI shows no data, check `http://localhost:3000/api/logs?limit=5&debug=1` (while logged in) to confirm the web container sees the same DB file as the worker.

## Local dev

1. Install deps:
   - `corepack enable`
   - `pnpm install`
2. Create DB:
   - `pnpm prisma:deploy`
3. Run web + worker (two terminals):
   - `pnpm dev`
   - `pnpm worker:dev`
