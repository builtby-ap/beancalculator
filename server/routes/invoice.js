const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const INVOICES_FILE = path.join(__dirname, "..", "data", "invoices.json");

if (!fs.existsSync(INVOICES_FILE)) {
  fs.writeFileSync(INVOICES_FILE, "[]", "utf-8");
}

function readInvoices() {
  const raw = fs.readFileSync(INVOICES_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeInvoices(invoices) {
  fs.writeFileSync(INVOICES_FILE, JSON.stringify(invoices, null, 2), "utf-8");
}

// POST /api/invoice — Save multi-bean invoice
router.post("/", (req, res) => {
  const {
    farmerName,
    date,
    beanRows,
    deductions,
    totalBags,
    totalViss,
    totalValue,
    totalDeductions,
    finalTotal,
  } = req.body;

  if (!farmerName || !beanRows || beanRows.length === 0) {
    return res.status(400).json({ error: "တောင်သူအမည်နှင့် ပဲစာရင်း ဖြည့်ပါ" });
  }

  const invoiceId = `INV-${Date.now()}-${uuidv4().slice(0, 4).toUpperCase()}`;
  const now = date ? new Date(date) : new Date();

  const invoice = {
    invoice_id: invoiceId,
    date: now.toISOString(),
    date_formatted: now.toLocaleDateString("my-MM"),

    farmer: { name: farmerName },

    bean_rows: (beanRows || []).map((r) => ({
      beanTypeId: r.beanTypeId,
      beanName: r.beanName,
      standardWeight: r.standardWeight,
      vissPerBag: r.vissPerBag,
      numberOfBags: r.numberOfBags,
      extraViss: r.extraViss,
      price: r.price,
      totalViss: r.totalViss,
      value: r.value,
    })),

    bean: {
      name: beanRows.length === 1 ? beanRows[0].beanName : beanRows.map((r) => r.beanName).join(", "),
    },

    weight: {
      total_bags: totalBags,
      total_viss: totalViss,
    },

    pricing: {
      base_amount: totalValue,
    },

    deductions: {
      items: (deductions || []).map((d) => ({
        key: d.key,
        label: d.label,
        type: d.type,
        amount: d.amount,
        total: d.type === "percent"
          ? Math.round((totalValue * d.amount) / 100)
          : d.amount * totalBags,
      })),
      total: totalDeductions,
    },

    summary: {
      base_amount: totalValue,
      total_deductions: totalDeductions,
      final_amount: finalTotal,
    },

    paid_amount: 0,
  };

  const invoices = readInvoices();
  invoices.push(invoice);
  writeInvoices(invoices);

  res.status(201).json(invoice);
});

// GET /api/invoice - return all invoices or filtered by date
router.get("/", (req, res) => {
  let invoices = readInvoices();
  const { start, end } = req.query;
  if (start) invoices = filterByDate(invoices, parseQueryDate(start), end ? parseQueryDate(end) : null);
  res.json(invoices.sort((a, b) => new Date(b.date) - new Date(a.date)));
});

function parseQueryDate(query) {
  if (!query) return null;
  const d = new Date(query);
  if (isNaN(d.getTime())) return null;
  return d;
}

function filterByDate(invoices, start, end) {
  if (!start && !end) return invoices;
  return invoices.filter((inv) => {
    const d = new Date(inv.date);
    if (start && d < start) return false;
    if (end) {
      const endOfDay = new Date(end);
      endOfDay.setHours(23, 59, 59, 999);
      if (d > endOfDay) return false;
    }
    return true;
  });
}

// GET /api/invoice/summary — Dashboard stats with date filters
router.get("/summary", (req, res) => {
  const allInvoices = readInvoices();
  const { start, end } = req.query;
  const startDate = parseQueryDate(start);
  const endDate = parseQueryDate(end);
  const invoices = filterByDate(allInvoices, startDate, endDate);

  // All invoices for current month comparison
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthInvoices = filterByDate(allInvoices, monthStart, null);

  const totalInvoices = invoices.length;
  const totalViss = invoices.reduce((s, inv) => s + (inv.weight?.total_viss || 0), 0);
  const totalValue = invoices.reduce((s, inv) => s + (inv.summary?.base_amount || 0), 0);
  const totalDeductions = invoices.reduce((s, inv) => s + (inv.deductions?.total || 0), 0);
  const totalFinal = invoices.reduce((s, inv) => s + (inv.summary?.final_amount || 0), 0);
  const totalPaid = invoices.reduce((s, inv) => s + (inv.paid_amount || 0), 0);

  const monthInvoicesCount = monthInvoices.length;
  const monthValue = monthInvoices.reduce((s, inv) => s + (inv.summary?.base_amount || 0), 0);

  // Deductions by type
  const deductionsByType = {};
  invoices.forEach((inv) => {
    (inv.deductions?.items || []).forEach((d) => {
      if (!deductionsByType[d.label]) deductionsByType[d.label] = 0;
      deductionsByType[d.label] += d.total;
    });
  });
  const deductionsArray = Object.entries(deductionsByType)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);

  // Farmer summary
  const farmerMap = {};
  allInvoices.forEach((inv) => {
    const name = inv.farmer?.name || "မသိ";
    if (!farmerMap[name]) {
      farmerMap[name] = { name, totalPayable: 0, totalPaid: 0, invoiceCount: 0 };
    }
    farmerMap[name].totalPayable += inv.summary?.final_amount || 0;
    farmerMap[name].totalPaid += inv.paid_amount || 0;
    farmerMap[name].invoiceCount += 1;
  });
  const farmers = Object.values(farmerMap).map((f) => ({
    ...f,
    balance: f.totalPayable - f.totalPaid,
  }));

  // Bean price timeline: for each bean, list { date, beanName, price }
  const beanPriceTimeline = [];
  allInvoices.forEach((inv) => {
    (inv.bean_rows || []).forEach((r) => {
      beanPriceTimeline.push({
        date: inv.date_formatted,
        dateRaw: inv.date,
        beanName: r.beanName,
        price: r.price,
      });
    });
  });
  beanPriceTimeline.sort((a, b) => new Date(a.dateRaw) - new Date(b.dateRaw));

  // Unique bean names from the timeline
  const beanNames = [...new Set(beanPriceTimeline.map((p) => p.beanName))];

  // Bean statistics cards
  const beanStats = {};
  allInvoices.forEach((inv) => {
    (inv.bean_rows || []).forEach((r) => {
      if (!beanStats[r.beanName]) {
        beanStats[r.beanName] = { name: r.beanName, totalViss: 0, totalPrice: 0, priceCount: 0, totalValue: 0, invoiceCount: 0 };
      }
      beanStats[r.beanName].totalViss += r.totalViss || 0;
      beanStats[r.beanName].totalPrice += r.price || 0;
      beanStats[r.beanName].priceCount += 1;
      beanStats[r.beanName].totalValue += r.value || 0;
      beanStats[r.beanName].invoiceCount += 1;
    });
  });
  const beanStatsArray = Object.values(beanStats)
    .map((b) => ({
      ...b,
      avgPrice: Math.round(b.totalPrice / b.priceCount),
    }))
    .sort((a, b) => b.totalValue - a.totalValue);

  res.json({
    totalInvoices,
    totalViss,
    totalValue,
    totalDeductions,
    totalFinal,
    totalPaid,
    balance: totalFinal - totalPaid,
    monthInvoicesCount,
    monthValue,
    deductionsArray,
    farmers,
    beanPriceTimeline,
    beanNames,
    beanStats: beanStatsArray,
  });
});

// GET /api/invoice/:id
router.get("/:id", (req, res) => {
  const invoices = readInvoices();
  const invoice = invoices.find((inv) => inv.invoice_id === req.params.id);
  if (!invoice) {
    return res.status(404).json({ error: "ဘောင်ချာ ရှာမတွေ့ပါ" });
  }
  res.json(invoice);
});

// DELETE /api/invoice/:id
router.delete("/:id", (req, res) => {
  const invoices = readInvoices();
  const index = invoices.findIndex((inv) => inv.invoice_id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "ဘောင်ချာ ရှာမတွေ့ပါ" });
  }
  invoices.splice(index, 1);
  writeInvoices(invoices);
  res.json({ message: "ဖျက်ပြီးပါပြီ" });
});

// PUT /api/invoice/:id — Update paid amount
router.put("/:id", (req, res) => {
  const { paid_amount } = req.body;
  const invoices = readInvoices();
  const index = invoices.findIndex((inv) => inv.invoice_id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "ဘောင်ချာ ရှာမတွေ့ပါ" });
  }
  if (paid_amount != null) {
    invoices[index].paid_amount = Number(paid_amount);
  }
  writeInvoices(invoices);
  res.json(invoices[index]);
});

module.exports = router;
