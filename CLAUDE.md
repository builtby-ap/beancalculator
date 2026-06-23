# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Myanmar bean trading calculator — a bilingual (Burmese UI, English code) web app for farmers and traders to record bean sales, calculate weights in viss, compute settlements with deductions (labor, bags, service fees), and generate invoices.

## Commands

### Server (Express backend)
```bash
cd server
npm install
npm run dev        # node --watch on port 3001
```

### Client (React + Vite frontend)
```bash
cd client
npm install
npm run dev        # Vite dev server on port 5173, proxies /api → localhost:3001
npm run build      # Production build → client/dist/
```

## Architecture

**Monorepo with two independent Node.js projects** — `client/` and `server/`, each with their own `package.json`. No shared dependencies or workspace tooling.

### Server (`server/`)
- **Express** REST API on port 3001 with three route groups:
  - `routes/beans.js` — CRUD for bean types (name + standardWeight)
  - `routes/transactions.js` — CRUD for farmer transactions + `/summary` aggregate endpoint
  - `routes/invoice.js` — Invoice calculation (`POST /calculate`) and retrieval
- **Data storage**: Plain JSON files in `server/data/` (beans.json, transactions.json, invoices.json) — read/write with `fs.readFileSync`/`writeFileSync`
- **Business logic** in `server/utils/`:
  - `calculateTotalViss.js` — weight: `(bags × vissPerBag) + extraViss`
  - `calculateSettlement.js` — settlement: `baseAmount = totalViss × price ÷ standardWeight`, then subtract deductions (labor, bag cost, service %, other per-bag fees)

### Client (`client/`)
- **React 18 + React Router 6** with Vite, styled with TailwindCSS
- **Routes**: `/` (Dashboard), `/calculator` (Calculator), `/invoices` (InvoiceHistory), `/transactions` (Transactions), `/beans` (BeanTypes)
- **API layer**: `src/api/client.js` — axios instance with `baseURL: "/api"`, Vite proxies to backend
- **Duplicate utils**: `src/utils/calculateSettlement.js` and `src/utils/calculateTotalViss.js` mirror the server utils (client-side preview calculations)
- **PDF/Export**: Uses `jspdf` + `html2canvas` for invoice export

### Key Domain Concepts
- **Viss** (ပိဿာ): Myanmar weight unit. No tical system — viss only.
- **Standard weight**: Per-bean-type reference weight used to normalize pricing. Formula: `baseAmount = totalViss × price ÷ standardWeight`
- **Deductions**: Labor fee, bag cost, service fee (% of base), and arbitrary named per-bag fees

## Language

UI labels and error messages are in **Burmese (Myanmar)**. Code identifiers, comments, and API contracts are in English. When modifying error messages or UI labels, preserve the Burmese language.
