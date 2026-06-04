# Garment POS

A frontend-only Point-of-Sale & operations console for a garment manufacturing /
wholesale business. All data is mock/static (in-memory) — no backend required.

**Aesthetic:** a "textile workshop" — warm paper canvas, denim-indigo ink, an ochre
"thread" accent. Bricolage Grotesque display type, Inter Tight body, IBM Plex Mono
for all figures.

## Business flow

```
Raw materials purchased ─▶ Main Stock
                               │  released via Work Orders
                               ▼
                       Production Released
                               │  finished goods re-enter
                               ▼
                          Main Stock ──▶ Sales & Wholesale ──▶ Stores
Expenses tracks all operational costs across the chain.
```

## Stack

- **React 19 + TypeScript + Vite**
- **Tailwind CSS v4** (via `@tailwindcss/postcss`) + custom shadcn/ui-style primitives
- **React Router** — sidebar navigation across 11 modules
- **Zustand** — in-memory state (stock, production, sales, expenses, directory, UI)
- **TanStack Table** — all sortable/searchable/paginated data grids
- **Recharts** — sales-trend area chart & category-mix bars
- **lucide-react** — iconography

## Modules

| Route | Module | Highlights |
|-------|--------|------------|
| `/` | Dashboard | KPI cards, sales trend, low-stock alerts, floor & invoice feeds |
| `/stock` | Main Stock | Full CRUD, raw/finished tabs, stock-status engine |
| `/production` | Production Released | Work-order CRUD with progress tracking |
| `/sales` | Sales & Wholesale | Invoice CRUD with dynamic line-items & auto totals |
| `/expenses` | Expenses | Cost CRUD, category filter & breakdown |
| `/suppliers` | Suppliers | Vendor directory, lead time, ratings, payables |
| `/customers` | Customers / Stores | Accounts, credit usage, YTD sales |
| `/products` | Products / Catalog | Visual line-sheet card grid, active toggle |
| `/reports` | Reports | Date-range filters + printable P&L / sales / expense / production sheets |
| `/users` | User Management | Team roles & access CRUD |
| `/settings` | Settings | Business profile, theme (light/dark), notifications |

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production bundle
```

> Note: Tailwind v4 is wired through PostCSS (`postcss.config.mjs`) rather than the
> Vite plugin for compatibility with this Vite version.

Data lives in `src/data/*` and resets on reload. State is managed in `src/store/*`.
