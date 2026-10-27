# Marlow Admin (`food-delivery-admin`)

Admin portal for the Food Delivery Platform. Theme matches the Marlow customer app (Syne + Manrope, cream/copper palette).

All modules read from **`src/data/platformData.js`** — extend that file as you build orders, restaurants, finance, etc.

## Run locally

```bash
npm install
npm run dev
```

## Demo sign-in

| | |
|---|---|
| Email | `pavan@marlow.app` |
| Password | `Marlow@2026` |
| Password reset code | `246810` |

Auth and module data live in the browser (`localStorage` / `sessionStorage`). Reload keeps you signed in for that tab; opening the app in a new tab shows sign-in again. This is a front-end demo, not production auth.

## Deploy

**GitHub Pages** (on push to `main`): In the repo on GitHub → **Settings → Pages → Build and deployment → Source: GitHub Actions**. After the workflow succeeds, the site is at:

`https://pavan210799.github.io/food-delivery-admin/`

**Vercel / Netlify:** Import the repo; build command `npm run build`, output directory `dist`. SPA fallback is included (`vercel.json`).
# food-delivery-admin
