---
marp: true
paginate: true
transition: fade
auto-advance: 20
---

# မြန်မာပဲတွက်စနစ်
## Myanmar Bean Calculator

Built with Claude Code + Magic MCP

---

# Who is this for?

Myanmar farmers and bean traders who need a simple tool to:
- Record bean sales
- Calculate weights in viss
- Generate settlement invoices

---

# The Problem

Manual calculation is slow and error-prone:
- Weight conversion (bags → viss)
- Multiple deduction types (labor, bags, service fees)
- Invoicing in Burmese for farmers

---

# How AI Helped

- **Claude Code** — built full-stack app (React + Express)
- **Magic MCP** — generated UI components
- **Skills & Agents** — reusable workflows for calculations

---

# Architecture

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Express REST API
- **Storage**: JSON files (simple, no database)
- **Language**: Burmese UI, English code

---

# What's Next

- Add database storage
- PDF invoice export
- Mobile-friendly design
- Multi-user support
