<!--
  Product-intro slide deck for Myanmar Bean Calculator
  Render:  marp slides/pitch.md -o slides/pitch.pdf
-->
---
marp: true
paginate: true
size: 16:9
---

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@500&display=swap');
:root { --bg:#f8fafc; --ink:#0f172a; --muted:#64748b; --accent:#0d9488; --line:#e2e8f0; --code:#0f172a; }
section {
  background:var(--bg); color:var(--ink);
  font-family:'Inter','Noto Sans','Pyidaungsu',sans-serif;
  font-size:26px; line-height:1.5; padding:48px 64px;
}
h1 { color:var(--ink); font-weight:800; font-size:1.6em; }
h2 { color:var(--accent); font-weight:600; }
h3 { color:var(--muted); font-weight:600; }
strong { color:var(--accent); }
a { color:var(--accent); text-decoration:none; }
img { border-radius:12px; box-shadow:0 12px 30px rgba(15,23,42,.18); }
code { background:#e6fffb; color:#0f766e; padding:.06em .35em; border-radius:5px; font-family:'JetBrains Mono',monospace; }
pre  { background:var(--code); border-radius:10px; }
pre code { background:none; color:#e2e8f0; }
blockquote { border-left:4px solid var(--accent); background:#ecfeff; color:#155e75; padding:.5em 1em; }
header,footer,section::after { color:var(--muted); font-size:.5em; }
section.cover {
  background:radial-gradient(800px 360px at 82% 14%, rgba(13,148,136,.18), transparent 60%), var(--bg);
}
section.cover h1 { font-size:2.3em; }
section.cover h2 { color:var(--muted); font-weight:400; }
section.shot { background:#0f172a; color:#e2e8f0; padding:0; display:flex; align-items:center; justify-content:center; }
section.shot img { box-shadow:0 20px 50px rgba(0,0,0,.5); border-radius:8px; max-width:88%; max-height:82%; }
</style>

<!-- _class: cover -->

# မြန်မာပဲတွက်စနစ်

## Myanmar Bean Calculator — simple settlement for farmers & traders

Aye Pyae Wai Khin Soe · @builtby-ap · vibecode.tours

---

# What you get

- **Record bean sales** — enter farmer name, bean type, bags, weight, and price
- **Auto-calculate settlement** — viss conversion, deductions (labor, bags, service fees)
- **Generate invoices** — printable bilingual invoices with full breakdown
- **Track everything** — dashboard with charts, price trends, and farmer ledgers

---

<!-- _class: shot -->

![](screenshots/dashboard.png)

---

# All the screens

<!-- _class: shot -->

![](screenshots/invoice.png)

---

# Invoice history + bean types

<!-- _class: shot -->

![](screenshots/history.png)

---

# How it's built

```bash
# Server — Express REST API on port 3001
cd server && npm install && npm run dev

# Client — React 18 + Vite + TailwindCSS on port 5173
cd client && npm install && npm run dev
```

Stack: **React 18 + Express + TailwindCSS + Recharts** · built with Claude Code

---

# Domain: Myanmar bean trading

- **Viss** (ပိဿာ) — Myanmar weight unit
- **37 bean types** — each with standard weight for pricing
- **Deductions** — labor, bag cost, transport, service fee (%)
- **Burmese UI** — labels and messages in မြန်မာ for farmers

```bash
totalViss    = (bags × vissPerBag) + extraViss
baseAmount   = totalViss × price ÷ standardWeight
settlement   = baseAmount - deductions
```

---

# Try it

- **Live:** https://beancalculator.vercel.app
- **Repo:** github.com/builtby-ap/beancalculator · **License:** MIT
- **Login:** `admin` / `admin123`
