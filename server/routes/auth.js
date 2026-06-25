const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const { generateToken, authMiddleware } = require("../middleware/auth");

const router = express.Router();
const ADMIN_FILE = path.join(__dirname, "..", "data", "admin_user.json");
const SETTINGS_FILE = path.join(__dirname, "..", "data", "system_settings.json");

function readAdmin() {
  return JSON.parse(fs.readFileSync(ADMIN_FILE, "utf-8"));
}

function writeAdmin(data) {
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function readSettings() {
  return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
}

function writeSettings(data) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !username.trim()) {
    return res.status(400).json({ error: "အသုံးပြုသူအမည် ထည့်ပါ" });
  }
  if (!password) {
    return res.status(400).json({ error: "စကားဝှက် ထည့်ပါ" });
  }

  const admin = readAdmin();
  if (username !== admin.username) {
    return res.status(401).json({ error: "အသုံးပြုသူအမည် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်" });
  }

  const valid = bcrypt.compareSync(password, admin.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "အသုံးပြုသူအမည် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်" });
  }

  const token = generateToken(admin);
  res.json({
    token,
    user: {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      phone: admin.phone,
      business_name: admin.business_name,
    },
  });
});

// GET /api/auth/me — Check current session
router.get("/me", authMiddleware, (req, res) => {
  const admin = readAdmin();
  res.json({
    id: admin.id,
    username: admin.username,
    name: admin.name,
    phone: admin.phone,
    business_name: admin.business_name,
  });
});

// PUT /api/auth/profile — Update name, phone, business_name
router.put("/profile", authMiddleware, (req, res) => {
  const { name, phone, business_name } = req.body;
  const admin = readAdmin();

  if (name) admin.name = name;
  if (phone !== undefined) admin.phone = phone;
  if (business_name) admin.business_name = business_name;
  admin.updated_at = new Date().toISOString();

  writeAdmin(admin);

  res.json({
    id: admin.id,
    username: admin.username,
    name: admin.name,
    phone: admin.phone,
    business_name: admin.business_name,
  });
});

// PUT /api/auth/change-password
router.put("/change-password", authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword) {
    return res.status(400).json({ error: "လက်ရှိ စကားဝှက် ထည့်ပါ" });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "စကားဝှက်အသစ်သည် အနည်းဆုံး အက္ခရာ ၆ လုံး ရှိရပါမည်" });
  }

  const admin = readAdmin();
  const valid = bcrypt.compareSync(currentPassword, admin.password_hash);
  if (!valid) {
    return res.status(400).json({ error: "လက်ရှိ စကားဝှက် မှားယွင်းနေပါသည်" });
  }

  admin.password_hash = bcrypt.hashSync(newPassword, 10);
  admin.updated_at = new Date().toISOString();
  writeAdmin(admin);

  res.json({ message: "စကားဝှက် ပြောင်းလဲပြီးပါပြီ" });
});

// GET /api/auth/settings
router.get("/settings", authMiddleware, (req, res) => {
  const settings = readSettings();
  res.json(settings);
});

// PUT /api/auth/settings
router.put("/settings", authMiddleware, (req, res) => {
  const { company_name, business_name, owner_name, phone, address, invoice_prefix, currency } = req.body;
  const settings = readSettings();

  if (company_name) settings.company_name = company_name;
  if (business_name) settings.business_name = business_name;
  if (owner_name) settings.owner_name = owner_name;
  if (phone !== undefined) settings.phone = phone;
  if (address) settings.address = address;
  if (invoice_prefix) settings.invoice_prefix = invoice_prefix;
  if (currency) settings.currency = currency;
  settings.updated_at = new Date().toISOString();

  writeSettings(settings);
  res.json(settings);
});

module.exports = router;
