// Vercel serverless API with persistent storage (Upstash Redis or in-memory)
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { readJSON, writeJSON, getMemory } = require("./storage");

const JWT_SECRET = process.env.JWT_SECRET || "myanmar-bean-trade-demo-2026";

// ── Seed data (used on first run or when storage is empty) ──
const seedAdmin = {
  id: "admin-001", username: "admin",
  password_hash: bcrypt.hashSync("admin123", 10),
  name: "ဦးအောင်မင်း", phone: "09-123456789",
  business_name: "အောင်မင်း ပဲရောင်းဝယ်ရေး",
  created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
};

const seedSettings = {
  id: "settings-001", company_name: "အောင်မင်း ပဲရောင်းဝယ်ရေး",
  business_name: "မြန်မာပဲရောင်းဝယ် အလေးချိန်နှင့်ငွေတွက်စနစ်",
  owner_name: "ဦးအောင်မင်း", phone: "09-123456789",
  address: "မန္တလေးတိုင်း၊ ပြင်ဦးလွင်မြို့",
  invoice_prefix: "INV-", currency: "MMK", updated_at: new Date().toISOString(),
};

const seedBeans = [
  { id: "b1", name: "ဂျုံ", standardWeight: 60.0 }, { id: "b2", name: "ကုလားပဲအဝါ", standardWeight: 56.25 },
  { id: "b3", name: "နှမ်း", standardWeight: 45.0 }, { id: "b4", name: "ပြောင်းဖူးစေ့", standardWeight: 54.0 },
  { id: "b5", name: "စွန်ပြောင်းအနက်", standardWeight: 53.0 }, { id: "b6", name: "အထွက်တိုးပြောင်း", standardWeight: 53.0 },
  { id: "b7", name: "သီဟိုဠ်ပြောင်း", standardWeight: 53.0 }, { id: "b8", name: "ဆန်ပြောင်း", standardWeight: 59.25 },
  { id: "b9", name: "ကုလားပဲဖြူ ကြီး", standardWeight: 57.25 }, { id: "b10", name: "ကုလားပဲဖြူ သေး", standardWeight: 57.25 },
  { id: "b11", name: "ပဲတီစိမ်း", standardWeight: 56.25 }, { id: "b12", name: "စွန်တာပြာ", standardWeight: 58.25 },
  { id: "b13", name: "မတ်ပဲ", standardWeight: 60.0 }, { id: "b14", name: "ပဲစိမ်းငုံ", standardWeight: 60.0 },
  { id: "b15", name: "နံနံ", standardWeight: 24.0 }, { id: "b16", name: "ပဲလိပ်ပြာ/ပဲကြား", standardWeight: 56.25 },
  { id: "b17", name: "ပဲပုစွန်", standardWeight: 55.25 }, { id: "b18", name: "မြေထောက်ပဲ", standardWeight: 54.0 },
  { id: "b19", name: "တရုတ်ပဲကြီး", standardWeight: 50.0 }, { id: "b20", name: "နိုင်လွန်ပဲ", standardWeight: 59.25 },
  { id: "b21", name: "စားတော်ပဲ", standardWeight: 59.25 }, { id: "b22", name: "ပဲလွန်းဖြူ", standardWeight: 60.0 },
  { id: "b23", name: "ပဲလွန်းပြာ", standardWeight: 54.25 }, { id: "b24", name: "ပဲလွန်းဝါ", standardWeight: 54.25 },
  { id: "b25", name: "ထောပတ်ဖြူကြီး/သေး", standardWeight: 56.25 }, { id: "b26", name: "ပဲကြီးမျိုးစုံ/ရွှေယင်းမာ", standardWeight: 55.25 },
  { id: "b27", name: "ပဲပုတ်စေ့", standardWeight: 53.25 }, { id: "b28", name: "ပဲရာဇာ", standardWeight: 61.25 },
  { id: "b29", name: "ပဲယင်း", standardWeight: 60.0 }, { id: "b30", name: "ခေတ်သစ်(စ)ပဲဖြူလေး", standardWeight: 57.25 },
  { id: "b31", name: "ဆီနေကြာ", standardWeight: 27.0 }, { id: "b32", name: "ပန်းနှမ်း", standardWeight: 45.0 },
  { id: "b33", name: "မိုးလေးနှမ်း", standardWeight: 49.25 }, { id: "b34", name: "ကြက်ဆူအကြား (နီကြား/ဖြူကြား)", standardWeight: 36.0 },
  { id: "b35", name: "ကြက်ဆူအနက်", standardWeight: 30.0 }, { id: "b36", name: "ကလပဲသီး", standardWeight: 37.25 },
  { id: "b37", name: "ကြို့စေ့", standardWeight: 38.25 },
].map((b) => ({ ...b, createdAt: new Date().toISOString() }));

// ── Storage helpers ──
async function getAdmin() {
  let adm = await readJSON("admin");
  if (!adm) { await writeJSON("admin", seedAdmin); adm = seedAdmin; }
  return adm;
}
async function saveAdmin(data) { await writeJSON("admin", data); }
async function getSettings() {
  let s = await readJSON("settings");
  if (!s) { await writeJSON("settings", seedSettings); s = seedSettings; }
  return s;
}
async function saveSettings(data) { await writeJSON("settings", data); }
async function getBeans() {
  let b = await readJSON("beans");
  if (!b || b.length === 0) { await writeJSON("beans", seedBeans); b = seedBeans; }
  return b;
}
async function saveBeans(data) { await writeJSON("beans", data); }
async function getInvoices() {
  let inv = await readJSON("invoices");
  if (!inv) { await writeJSON("invoices", []); inv = []; }
  return inv;
}
async function saveInvoices(data) { await writeJSON("invoices", data); }

// ── Auth middleware ──
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "အကောင့်ဝင်ရန် လိုအပ်ပါသည်" });
  }
  try {
    req.user = jwt.verify(header.split(" ")[1], JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: "အကောင့်ဝင်ချိန် ကုန်ဆုံးသွားပါပြီ။ ပြန်ဝင်ပါ" });
  }
}

// ── Express app ──
const app = express();
app.use(cors());
app.use(express.json());

// ── Auth routes ──
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "အသုံးပြုသူအမည်နှင့် စကားဝှက် ထည့်ပါ" });
  const adm = await getAdmin();
  if (username !== adm.username || !bcrypt.compareSync(password, adm.password_hash)) {
    return res.status(401).json({ error: "အသုံးပြုသူအမည် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်" });
  }
  const token = jwt.sign({ id: adm.id, username: adm.username }, JWT_SECRET, { expiresIn: "7d" });
  const { password_hash, ...user } = adm;
  res.json({ token, user });
});

app.get("/api/auth/me", authMiddleware, async (_req, res) => {
  const adm = await getAdmin(); const { password_hash, ...user } = adm; res.json(user);
});

app.put("/api/auth/profile", authMiddleware, async (req, res) => {
  const adm = await getAdmin();
  const { name, phone, business_name } = req.body;
  if (name) adm.name = name;
  if (phone !== undefined) adm.phone = phone;
  if (business_name) adm.business_name = business_name;
  adm.updated_at = new Date().toISOString();
  await saveAdmin(adm);
  const { password_hash, ...user } = adm;
  res.json(user);
});

app.put("/api/auth/change-password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const adm = await getAdmin();
  if (!bcrypt.compareSync(currentPassword, adm.password_hash)) {
    return res.status(400).json({ error: "လက်ရှိ စကားဝှက် မှားယွင်းနေပါသည်" });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "စကားဝှက်အသစ်သည် အနည်းဆုံး အက္ခရာ ၆ လုံး ရှိရပါမည်" });
  }
  adm.password_hash = bcrypt.hashSync(newPassword, 10);
  await saveAdmin(adm);
  res.json({ message: "စကားဝှက် ပြောင်းလဲပြီးပါပြီ" });
});

app.get("/api/auth/settings", authMiddleware, async (_req, res) => res.json(await getSettings()));

app.put("/api/auth/settings", authMiddleware, async (req, res) => {
  const s = await getSettings();
  const { company_name, business_name, owner_name, phone, address, invoice_prefix, currency } = req.body;
  if (company_name) s.company_name = company_name;
  if (business_name) s.business_name = business_name;
  if (owner_name) s.owner_name = owner_name;
  if (phone !== undefined) s.phone = phone;
  if (address) s.address = address;
  if (invoice_prefix) s.invoice_prefix = invoice_prefix;
  if (currency) s.currency = currency;
  s.updated_at = new Date().toISOString();
  await saveSettings(s);
  res.json(s);
});

// ── Beans routes ──
app.get("/api/beans", authMiddleware, async (_req, res) => res.json(await getBeans()));
app.post("/api/beans", authMiddleware, async (req, res) => {
  const { name, standardWeight } = req.body;
  if (!name || standardWeight == null) return res.status(400).json({ error: "အမည်နှင့် စံချိန်တန်း ဖြည့်ပါ" });
  const beans = await getBeans();
  const b = { id: uuidv4(), name, standardWeight: Number(standardWeight), createdAt: new Date().toISOString() };
  beans.push(b);
  await saveBeans(beans);
  res.status(201).json(b);
});
app.put("/api/beans/:id", authMiddleware, async (req, res) => {
  const beans = await getBeans();
  const i = beans.findIndex((b) => b.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "မတွေ့ပါ" });
  const { name, standardWeight } = req.body;
  if (name) beans[i].name = name;
  if (standardWeight != null) beans[i].standardWeight = Number(standardWeight);
  await saveBeans(beans);
  res.json(beans[i]);
});
app.delete("/api/beans/:id", authMiddleware, async (req, res) => {
  let beans = await getBeans();
  const before = beans.length;
  beans = beans.filter((b) => b.id !== req.params.id);
  if (beans.length === before) return res.status(404).json({ error: "မတွေ့ပါ" });
  await saveBeans(beans);
  res.json({ message: "ဖျက်ပြီးပါပြီ" });
});

// ── Invoice routes ──
app.post("/api/invoice", authMiddleware, async (req, res) => {
  const { farmerName, date, beanRows, deductions, totalBags, totalViss, totalValue, totalDeductions, finalTotal } = req.body;
  if (!farmerName || !beanRows || beanRows.length === 0) return res.status(400).json({ error: "တောင်သူအမည်နှင့် ပဲစာရင်း ဖြည့်ပါ" });
  const inv = {
    invoice_id: `INV-${Date.now()}-${uuidv4().slice(0, 4).toUpperCase()}`,
    date: date ? new Date(date).toISOString() : new Date().toISOString(),
    date_formatted: date ? new Date(date).toLocaleDateString("my-MM") : new Date().toLocaleDateString("my-MM"),
    farmer: { name: farmerName },
    bean_rows: (beanRows || []).map((r) => ({
      beanTypeId: r.beanTypeId, beanName: r.beanName, standardWeight: r.standardWeight,
      vissPerBag: r.vissPerBag, numberOfBags: r.numberOfBags, extraViss: r.extraViss, price: r.price, totalViss: r.totalViss, value: r.value,
    })),
    bean: { name: beanRows.length === 1 ? beanRows[0].beanName : beanRows.map((r) => r.beanName).join(", ") },
    weight: { total_bags: totalBags, total_viss: totalViss },
    pricing: { base_amount: totalValue },
    deductions: {
      items: (deductions || []).map((d) => ({
        key: d.key, label: d.label, type: d.type, amount: d.amount,
        total: d.type === "percent" ? Math.round((totalValue * d.amount) / 100) : d.amount * totalBags,
      })),
      total: totalDeductions,
    },
    summary: { base_amount: totalValue, total_deductions: totalDeductions, final_amount: finalTotal },
    paid_amount: 0,
  };
  const invoices = await getInvoices();
  invoices.push(inv);
  await saveInvoices(invoices);
  res.status(201).json(inv);
});

app.get("/api/invoice", authMiddleware, async (_req, res) => {
  const invs = await getInvoices();
  res.json(invs.sort((a, b) => new Date(b.date) - new Date(a.date)));
});

app.get("/api/invoice/summary", authMiddleware, async (_req, res) => {
  const invoices = await getInvoices();
  const now = new Date(); const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthInvoices = invoices.filter((i) => new Date(i.date) >= monthStart);
  const sum = (arr, fn) => arr.reduce((s, i) => s + fn(i), 0);

  const dbt = {};
  invoices.forEach((i) => { (i.deductions?.items || []).forEach((d) => { dbt[d.label] = (dbt[d.label] || 0) + d.total; }); });

  const fm = {};
  invoices.forEach((i) => {
    const n = i.farmer?.name || "မသိ";
    if (!fm[n]) fm[n] = { name: n, totalPayable: 0, totalPaid: 0, invoiceCount: 0 };
    fm[n].totalPayable += i.summary?.final_amount || 0; fm[n].totalPaid += i.paid_amount || 0; fm[n].invoiceCount += 1;
  });

  const timeline = [];
  invoices.forEach((i) => { (i.bean_rows || []).forEach((r) => timeline.push({ date: i.date_formatted, dateRaw: i.date, beanName: r.beanName, price: r.price })); });
  timeline.sort((a, b) => new Date(a.dateRaw) - new Date(b.dateRaw));

  const bs = {};
  invoices.forEach((i) => { (i.bean_rows || []).forEach((r) => {
    if (!bs[r.beanName]) bs[r.beanName] = { name: r.beanName, totalViss: 0, totalPrice: 0, priceCount: 0, totalValue: 0, invoiceCount: 0 };
    bs[r.beanName].totalViss += r.totalViss || 0; bs[r.beanName].totalPrice += r.price || 0;
    bs[r.beanName].priceCount += 1; bs[r.beanName].totalValue += r.value || 0; bs[r.beanName].invoiceCount += 1;
  });});

  res.json({
    totalInvoices: invoices.length, totalViss: sum(invoices, (i) => i.weight?.total_viss || 0),
    totalValue: sum(invoices, (i) => i.summary?.base_amount || 0), totalDeductions: sum(invoices, (i) => i.deductions?.total || 0),
    totalFinal: sum(invoices, (i) => i.summary?.final_amount || 0), totalPaid: sum(invoices, (i) => i.paid_amount || 0),
    balance: sum(invoices, (i) => (i.summary?.final_amount || 0) - (i.paid_amount || 0)),
    monthInvoicesCount: monthInvoices.length, monthValue: sum(monthInvoices, (i) => i.summary?.base_amount || 0),
    deductionsArray: Object.entries(dbt).map(([n, t]) => ({ name: n, total: t })).sort((a, b) => b.total - a.total),
    farmers: Object.values(fm).map((f) => ({ ...f, balance: f.totalPayable - f.totalPaid })),
    beanPriceTimeline: timeline, beanNames: [...new Set(timeline.map((p) => p.beanName))],
    beanStats: Object.values(bs).map((b) => ({ ...b, avgPrice: Math.round(b.totalPrice / b.priceCount) })).sort((a, b) => b.totalValue - a.totalValue),
  });
});

app.get("/api/invoice/:id", authMiddleware, async (req, res) => {
  const invs = await getInvoices();
  const inv = invs.find((i) => i.invoice_id === req.params.id);
  if (!inv) return res.status(404).json({ error: "မတွေ့ပါ" });
  res.json(inv);
});

app.put("/api/invoice/:id", authMiddleware, async (req, res) => {
  let invs = await getInvoices();
  const idx = invs.findIndex((i) => i.invoice_id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "မတွေ့ပါ" });
  if (req.body.paid_amount != null) invs[idx].paid_amount = Number(req.body.paid_amount);
  await saveInvoices(invs);
  res.json(invs[idx]);
});

app.delete("/api/invoice/:id", authMiddleware, async (req, res) => {
  let invs = await getInvoices();
  const before = invs.length;
  invs = invs.filter((i) => i.invoice_id !== req.params.id);
  if (invs.length === before) return res.status(404).json({ error: "မတွေ့ပါ" });
  await saveInvoices(invs);
  res.json({ message: "ဖျက်ပြီးပါပြီ" });
});

module.exports = app;
