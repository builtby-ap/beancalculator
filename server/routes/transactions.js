const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { calculateTotalViss } = require("../utils/calculateTotalViss");
const { calculateSettlement } = require("../utils/calculateSettlement");

const router = express.Router();
const DATA_FILE = path.join(__dirname, "..", "data", "transactions.json");
const BEANS_FILE = path.join(__dirname, "..", "data", "beans.json");

function readTransactions() {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeTransactions(txns) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(txns, null, 2), "utf-8");
}

function readBeans() {
  const raw = fs.readFileSync(BEANS_FILE, "utf-8");
  return JSON.parse(raw);
}

// GET /api/transactions
router.get("/", (req, res) => {
  const txns = readTransactions();
  res.json(txns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// POST /api/transactions
router.post("/", (req, res) => {
  const {
    farmerName,
    beanTypeId,
    numberOfBags,
    vissPerBag,
    extraViss,
    price,
    laborFeePerBag,
    bagCostPerBag,
    serviceFeePercent,
    otherFees,
    paidAmount,
  } = req.body;

  if (!farmerName || !beanTypeId || numberOfBags == null || vissPerBag == null || price == null) {
    return res.status(400).json({ error: "လိုအပ်သော အချက်အလက်များ ဖြည့်ပါ" });
  }

  const beans = readBeans();
  const bean = beans.find((b) => b.id === beanTypeId);
  if (!bean) {
    return res.status(400).json({ error: "ပဲအမျိုးအစား ရှာမတွေ့ပါ" });
  }

  const numBags = Number(numberOfBags);

  const { totalViss, breakdown: weightBreakdown } = calculateTotalViss({
    numberOfBags: numBags,
    vissPerBag,
    extraViss: extraViss || 0,
  });

  const settlement = calculateSettlement({
    totalViss,
    price: Number(price),
    standardWeight: bean.standardWeight,
    numberOfBags: numBags,
    laborFeePerBag: laborFeePerBag || 0,
    bagCostPerBag: bagCostPerBag || 0,
    serviceFeePercent: serviceFeePercent || 0,
    otherFees: otherFees || [],
  });

  const paid = Number(paidAmount) || 0;

  const txn = {
    id: uuidv4(),
    farmerName,
    beanTypeId,
    beanName: bean.name,
    numberOfBags: weightBreakdown.numberOfBags,
    vissPerBag: weightBreakdown.vissPerBag,
    bagsViss: weightBreakdown.bagsViss,
    extraViss: weightBreakdown.extraViss,
    totalViss,
    price: Number(price),
    standardWeight: bean.standardWeight,
    baseAmount: settlement.baseAmount,
    deductions: settlement.deductions,
    finalTotal: settlement.finalTotal,
    paidAmount: paid,
    status: paid >= settlement.finalTotal ? "paid" : paid > 0 ? "partial" : "unpaid",
    createdAt: new Date().toISOString(),
  };

  const txns = readTransactions();
  txns.push(txn);
  writeTransactions(txns);
  res.status(201).json(txn);
});

// PUT /api/transactions/:id
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { paidAmount } = req.body;

  const txns = readTransactions();
  const index = txns.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "မှတ်တမ်း ရှာမတွေ့ပါ" });
  }

  if (paidAmount != null) {
    txns[index].paidAmount = Number(paidAmount);
    const total = txns[index].finalTotal;
    const paid = txns[index].paidAmount;
    txns[index].status = paid >= total ? "paid" : paid > 0 ? "partial" : "unpaid";
  }

  writeTransactions(txns);
  res.json(txns[index]);
});

// DELETE /api/transactions/:id
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const txns = readTransactions();
  const filtered = txns.filter((t) => t.id !== id);
  if (filtered.length === txns.length) {
    return res.status(404).json({ error: "မှတ်တမ်း ရှာမတွေ့ပါ" });
  }
  writeTransactions(filtered);
  res.json({ message: "ဖျက်ပြီးပါပြီ" });
});

// GET /api/summary
router.get("/summary", (req, res) => {
  const txns = readTransactions();
  const totalTransactions = txns.length;
  const totalBaseAmount = txns.reduce((s, t) => s + t.baseAmount, 0);
  const totalDeductions = txns.reduce((s, t) => s + t.deductions.totalDeductions, 0);
  const totalFinalAmount = txns.reduce((s, t) => s + t.finalTotal, 0);
  const totalPaid = txns.reduce((s, t) => s + t.paidAmount, 0);
  const totalUnpaid = totalFinalAmount - totalPaid;

  res.json({
    totalTransactions,
    totalBaseAmount,
    totalDeductions,
    totalFinalAmount,
    totalPaid,
    totalUnpaid,
  });
});

module.exports = router;
