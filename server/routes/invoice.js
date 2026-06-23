const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { calculateTotalViss } = require("../utils/calculateTotalViss");
const { calculateSettlement } = require("../utils/calculateSettlement");

const router = express.Router();
const INVOICES_FILE = path.join(__dirname, "..", "data", "invoices.json");
const BEANS_FILE = path.join(__dirname, "..", "data", "beans.json");

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

function readBeans() {
  const raw = fs.readFileSync(BEANS_FILE, "utf-8");
  return JSON.parse(raw);
}

const LABELS = {
  invoice_id: "ဘောင်ချာနံပါတ်",
  date: "ရက်စွဲ",
  farmer_name: "တောင်သူအမည်",
  bean_type: "ပဲအမျိုးအစား",
  weight_summary: "အလေးချိန် အကျဉ်းချုပ်",
  total_bags: "အိတ်စုစုပေါင်း",
  viss_per_bag: "တစ်အိတ်လျှင် ပိဿာ",
  bags_viss: "အိတ်မှ ပိဿာ",
  extra_viss: "အပို ပိဿာ",
  total_viss: "စုစုပေါင်း ပိဿာ",
  standard_weight: "စံချိန်တန်း အလေးချိန်",
  price: "ဈေးနှုန်း",
  base_amount: "အခြေခံ ငွေပမာဏ",
  deductions: "နုတ်ယူငွေများ",
  labor_fee: "အလုပ်ခ (တစ်အိတ်လျှင်)",
  bag_cost: "အိတ်ခ (တစ်အိတ်လျှင်)",
  service_fee: "ပွဲခ (ရာခိုင်နှုန်း)",
  other_fees: "အခြားကုန်ကျစရိတ်",
  total_deductions: "နုတ်ယူငွေ စုစုပေါင်း",
  final_amount: "တောင်သူအားပေးချေမည့်ငွေ",
};

// POST /api/invoice/calculate
router.post("/calculate", (req, res) => {
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
  } = req.body;

  if (!farmerName || !beanTypeId || numberOfBags == null || vissPerBag == null || price == null) {
    return res.status(400).json({
      error: "လိုအပ်သော အချက်အလက်များ ဖြည့်ပါ",
      required: ["farmerName", "beanTypeId", "numberOfBags", "vissPerBag", "price"],
    });
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

  // Build deductions list with labels
  const deductionsList = [];
  if (settlement.deductions.laborFee.total > 0) {
    deductionsList.push({
      key: "labor_fee",
      label: `${LABELS.labor_fee} (${settlement.deductions.laborFee.perBag} × ${numBags})`,
      amount: settlement.deductions.laborFee.total,
    });
  }
  if (settlement.deductions.bagCost.total > 0) {
    deductionsList.push({
      key: "bag_cost",
      label: `${LABELS.bag_cost} (${settlement.deductions.bagCost.perBag} × ${numBags})`,
      amount: settlement.deductions.bagCost.total,
    });
  }
  if (settlement.deductions.serviceFee.total > 0) {
    deductionsList.push({
      key: "service_fee",
      label: `${LABELS.service_fee} (${settlement.deductions.serviceFee.percent}% × ${settlement.baseAmount})`,
      amount: settlement.deductions.serviceFee.total,
    });
  }
  settlement.deductions.otherFees.forEach((f) => {
    deductionsList.push({
      key: "other_fee",
      label: `${f.name} (${f.amountPerBag} × ${numBags})`,
      amount: f.total,
    });
  });

  const invoiceId = `INV-${Date.now()}-${uuidv4().slice(0, 4).toUpperCase()}`;
  const now = new Date();

  const invoice = {
    invoice_id: invoiceId,
    date: now.toISOString(),
    date_formatted: now.toLocaleDateString("my-MM"),

    farmer: { name: farmerName, label: LABELS.farmer_name },

    bean: {
      id: bean.id,
      name: bean.name,
      label: LABELS.bean_type,
      standard_weight: bean.standardWeight,
      standard_weight_label: LABELS.standard_weight,
    },

    weight: {
      label: LABELS.weight_summary,
      total_bags: weightBreakdown.numberOfBags,
      total_bags_label: LABELS.total_bags,
      viss_per_bag: weightBreakdown.vissPerBag,
      viss_per_bag_label: LABELS.viss_per_bag,
      bags_viss: weightBreakdown.bagsViss,
      bags_viss_label: LABELS.bags_viss,
      extra_viss: weightBreakdown.extraViss,
      extra_viss_label: LABELS.extra_viss,
      total_viss: totalViss,
      total_viss_label: LABELS.total_viss,
    },

    pricing: {
      price: Number(price),
      price_label: LABELS.price,
      standard_weight: bean.standardWeight,
      standard_weight_label: LABELS.standard_weight,
      formula: `${totalViss} × ${price} ÷ ${bean.standardWeight}`,
      base_amount: settlement.baseAmount,
      base_amount_label: LABELS.base_amount,
    },

    deductions: {
      label: LABELS.deductions,
      items: deductionsList,
      total: settlement.deductions.totalDeductions,
      total_label: LABELS.total_deductions,
    },

    summary: {
      base_amount: settlement.baseAmount,
      base_amount_label: LABELS.base_amount,
      total_deductions: settlement.deductions.totalDeductions,
      total_deductions_label: LABELS.total_deductions,
      final_amount: settlement.finalTotal,
      final_amount_label: LABELS.final_amount,
    },
  };

  const invoices = readInvoices();
  invoices.push(invoice);
  writeInvoices(invoices);

  res.status(201).json(invoice);
});

// GET /api/invoice
router.get("/", (req, res) => {
  const invoices = readInvoices();
  res.json(invoices.sort((a, b) => new Date(b.date) - new Date(a.date)));
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

module.exports = router;
