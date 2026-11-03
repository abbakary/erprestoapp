# Safari Grill & Lounge: RestoERP front end (React + Vite PWA)

Customer, waiter, cashier and manager apps on one shared order store. Demo data only (saved in the browser).

## Run
    npm install
    npm run dev          # http://localhost:5173 (also on your phone via the Network URL)
    npm run build        # production build in dist/
    npm run preview

## Demo logins (password: demo)
Customer 0712000111 · Waiter 0713000222 · Cashier 0714000333 · Manager 0715000444

## Structure
    src/data.js              menu, tables, seed demo data
    src/store.jsx            shared state + actions (orders, ledger, policy)
    src/components/ui.jsx    Sheet, Tabs, Install, TableMap, Receipt, ...
    src/components/Ordering.jsx   Menu, CartBar, Checkout
    src/screens/             Landing, Auth, Customer, Waiter, Cashier (+ manager Commission)
    public/                  manifest, service worker, icons

## Install as an app
Deploy `dist/` to any HTTPS static host (Netlify, Vercel, Cloudflare Pages).
Android/Chrome: Install app button. iPhone: Share, then Add to Home Screen.

## Next
Replace the actions in `src/store.jsx` with calls to the FastAPI endpoints in SRS Appendix C.
