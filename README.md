# Shared EMI Manager

React dashboard for tracking shared EMI payments.

## Structure

- `src/App.jsx` - application composition entrypoint
- `src/pages/Dashboard.jsx` - dashboard page and UI state
- `src/data/group.js` - group members, categories, and copy
- `src/utils/formatters.js` - currency, date, and category display helpers
- `src/styles.css` - frontend styles
- `server/api.js` - Express HTTP API
- `server/database/db.js` - SQLite connection and queries
- `public/images/` - static image assets

## Local development

```bash
npm install
npm run dev
```

The React app runs on `http://localhost:5173` and the Express API runs on `http://localhost:3001`. EMI records are stored in `data/emi-group.db`.

## Deployment

The frontend builds with `npm run build` and is configured for Netlify in `netlify.toml`. SQLite is suitable for local development, but Netlify's serverless filesystem is not persistent. For production, move the API to Netlify Functions and use a hosted database such as Supabase, Neon, or PlanetScale, then configure the frontend API URL with an environment variable.

## CI/CD

GitHub Actions runs `npm ci` and `npm run build` for every push to `main` and every pull request targeting `main`. The workflow is defined in `.github/workflows/ci.yml`.

To enable continuous deployment, connect the GitHub repository to Netlify and set:

- Build command: `npm run build`
- Publish directory: `dist`
- Production branch: `main`

After that, a successful push to `main` runs the GitHub build check and Netlify publishes the new frontend automatically.
