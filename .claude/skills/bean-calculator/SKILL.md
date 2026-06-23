---
name: bean-calculator
description: Guide for working with the Myanmar bean trading calculator project
---

# Bean Calculator Skill

## Project Context
This is a bilingual (Burmese UI, English code) web app for Myanmar farmers and traders to record bean sales, calculate weights in viss, and generate invoices.

## Key Rules
- UI labels and error messages must be in **Burmese (Myanmar)**
- Code identifiers, comments, and API contracts must be in **English**
- Weight unit is **viss** (ပိဿာ) only — no tical system
- Data is stored as plain JSON files in `server/data/`

## Calculation Formula
```
totalViss = (bags × vissPerBag) + extraViss
baseAmount = totalViss × price ÷ standardWeight
settlement = baseAmount - deductions (labor, bags, service %, other fees)
```

## Architecture
- `server/` — Express REST API on port 3001
- `client/` — React + Vite on port 5173, proxies /api to backend
- Duplicate utils exist in both client and server for preview calculations

## When Modifying
- Preserve Burmese language in UI strings
- Keep client and server calculation utils in sync
- Use TailwindCSS for styling
