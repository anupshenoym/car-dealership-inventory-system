# AutoVault — Frontend

React 19 + TypeScript + Vite + Tailwind CSS SPA for the AutoVault Car Dealership
Inventory System.

## Development

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` and proxies `/api` requests to the backend
at `http://localhost:3001` (see `vite.config.ts`).

## Build

```bash
npm run build
npm run preview
```

Set `VITE_API_URL` to the deployed backend URL (including `/api`) when building
for production. See `.env.example`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run Oxlint |

See the root [`README.md`](../README.md) for full setup, API documentation,
screenshots, and the AI usage statement.
