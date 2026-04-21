# Family To-Do

A shared to-do list web app for small households. Danny and Allie can sign in, create chores, and close tasks while the app keeps track of who opened/closed them and when.

## Stack

- **Frontend**: React 19 (Vite), React Router, Tailwind CSS, Lucide icons
- **Backend**: Node.js + Express, better-sqlite3, JWT auth, bcrypt
- **Database**: SQLite (file stored in `server/data/family-todo.db`)

## Getting Started

```bash
# Install server deps
cd server
npm install

# Install client deps
cd ../client
npm install
```

### Seed users

Two accounts are preloaded: `danny` / `danny123` and `allie` / `allie123`.

```bash
cd server
npm run seed
```

### Run locally

Open two terminals.

**Server**
```bash
cd server
npm run dev
```

**Client**
```bash
cd client
npm run dev
```

Visit http://localhost:5173.

The Vite dev server proxies API calls to `http://localhost:3001/api`.

### Build for production

```bash
# Build the frontend
cd client
npm run build

# Start the backend in production mode
cd ../server
npm start
```

Express serves the static files from `client/dist` when running under `npm start`.

## Future integrations

- REST API returns `{ data, error, meta }` consistently for easier external integrations.
- JWT auth keeps the API stateless – perfect for mobile apps or scripts later.
- Database uses foreign keys + timestamps so migrations can extend it without rewrites.
