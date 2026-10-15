# Ratewise

Ratewise is a React application for discovering stores and sharing ratings. It provides a distinct workspace for normal users, store owners, and system administrators.

## Run locally

1. Configure the PostgreSQL database to match the `users`, `stores`, and `reviews` tables in `../../db.sql`.
2. In `backend/`, create a `.env` file with:

   ```dotenv
   PORT=3000
   DB_STRING=postgresql://<user>:<password>@<host>:5432/<database>
   JWT_SECRET=<long-random-secret>
   ```

3. Start the API:

   ```sh
   cd backend
   npm install
   node server.js
   ```

4. In another terminal, start the frontend:

   ```sh
   cd frontend
   npm install
   npm run dev
   ```

Vite proxies `/api` requests to `http://localhost:3000`. For a separately hosted API, set `VITE_API_BASE_URL` in the frontend environment to the API base URL (including `/api`).

An administrator account must already exist in the database to access the system-administrator workspace and create other accounts. Public account registration creates a normal-user account.

## Workspaces

- **Normal User:** Search stores by name or address, see overall and personal ratings, and submit or update a 1–5 rating with an optional note.
- **Store Owner:** View average ratings and feedback from customers who reviewed their store or stores.
- **System Administrator:** Review platform totals and searchable, sortable store, user, and rating tables; create users and register stores.

All roles can update their password after signing in. Passwords must be 8–16 characters and include an uppercase letter and a special character.

## Checks

```sh
npm run lint
npm run build
```
