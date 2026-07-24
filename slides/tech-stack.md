<!--
  Tech-stack slide deck for Myanmar Bean Calculator
  Render:  marp slides/tech-stack.md -o slides/tech-stack.pdf
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
section.two-col { display:flex; gap:40px; }
section.two-col > div { flex:1; }
</style>

<!-- _class: cover -->

# Tech Stack & AI Workflow

## Myanmar Bean Calculator — how it's built & the AI tools behind it

Aye Pyae Wai Khin Soe · @builtby-ap · vibecode.tours

---

# Tech Stack

**Frontend** · React 18 + Vite + TailwindCSS + Recharts + jspdf

**Backend** · Express REST API (port 3001), plain JSON file storage

**Deployment** · Vercel (frontend) + Render (backend)

```
client/  →  React 18 · Vite · TailwindCSS · Recharts · jspdf
server/  →  Express · JSON file store · REST API
```

No database needed — simple JSON files for bean types, transactions, invoices.

---

# Architecture

```
┌─────────────┐        ┌──────────────┐
│   Browser   │  /api  │   Express    │
│  React 18   │ ────── │   Server     │
│  Vite proxy │        │   port 3001  │
└─────────────┘        └──────┬───────┘
                              │
                     ┌────────┴────────┐
                     │   JSON files    │
                     │  (data store)   │
                     └─────────────────┘
```

**Monorepo** — two independent Node projects, no shared workspace tooling.

---

# Agents (Subagents)

Two agents defined in `.claude/agents/`:

| Agent | Purpose |
|-------|---------|
| **settlement-helper** | Validates bean settlement calculations. Checks weight math, base amount, deductions, and catches division-by-zero / NaN errors. |
| **frontend-developer** | Senior frontend specialist for building React UIs, components, and responsive layouts with TailwindCSS. |

---

# Skills

Two skills installed in `.claude/skills/`:

| Skill | Purpose |
|-------|---------|
| **bean-calculator** | Custom skill — project context, calculation formulas (viss, settlement), architecture rules, Burmese UI guidelines |
| **metric-calculator** | Installed skill — data analytics patterns and metric calculation best practices |

---

# AI Methodology

**Claude Code** as the primary AI coding assistant with:

- **Superpowers** — structured workflows (brainstorming, TDD, systematic-debugging, verification)
- **Subagent-driven development** — dispatch specialized agents for focused tasks
- **Context7 MCP** — on-demand library documentation (React, Express, Tailwind)
- **21st-dev/magic MCP** — UI component inspiration and refinement
- **chrome-devtools MCP** — in-browser testing, screenshots, performance audits
- **Pencil MCP** — visual design editing for .pen files

---

# Triggers & Commands

How custom skill/agent is fired:

```
Skill: bean-calculator
  Trigger  — when working on bean calculator project files
  Command  — Skill tool → name: "bean-calculator"

Agent: settlement-helper
  Trigger  — when validating settlement calculations
  Command  — Agent tool → subagent_type: "settlement-helper"
```

---

# Development Workflow

```
1. Brainstorm     → Superpowers: brainstorming skill
2. Plan           → Superpowers: writing-plans skill
3. Implement      → Claude Code + frontend-developer agent
4. Validate       → settlement-helper agent
5. Verify         → chrome-devtools MCP (browser testing)
6. Review         → Superpowers: requesting-code-review
```

Iterative loop — each feature goes through plan → code → verify.

---

# Learn more

- **Repo:** [github.com/builtby-ap/beancalculator](https://github.com/builtby-ap/beancalculator)
- **Live:** [beancalculator.vercel.app](https://beancalculator.vercel.app)
- **Stack:** React 18 · Express · TailwindCSS · Recharts
- **Built with:** Claude Code · Superpowers · MCP tools
