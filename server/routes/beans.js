const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const DATA_FILE = path.join(__dirname, "..", "data", "beans.json");

function readBeans() {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeBeans(beans) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(beans, null, 2), "utf-8");
}

// GET /api/beans
router.get("/", (req, res) => {
  const beans = readBeans();
  res.json(beans);
});

// POST /api/beans
router.post("/", (req, res) => {
  const { name, standardWeight } = req.body;
  if (!name || standardWeight == null) {
    return res.status(400).json({ error: "အမည်နှင့် စံချိန်တန်း အလေးချိန် ဖြည့်ပါ" });
  }
  const beans = readBeans();
  const newBean = {
    id: uuidv4(),
    name,
    standardWeight: Number(standardWeight),
    createdAt: new Date().toISOString(),
  };
  beans.push(newBean);
  writeBeans(beans);
  res.status(201).json(newBean);
});

// PUT /api/beans/:id
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, standardWeight } = req.body;
  const beans = readBeans();
  const index = beans.findIndex((b) => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "ပဲအမျိုးအစား ရှာမတွေ့ပါ" });
  }
  if (name) beans[index].name = name;
  if (standardWeight != null) beans[index].standardWeight = Number(standardWeight);
  writeBeans(beans);
  res.json(beans[index]);
});

// DELETE /api/beans/:id
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const beans = readBeans();
  const filtered = beans.filter((b) => b.id !== id);
  if (filtered.length === beans.length) {
    return res.status(404).json({ error: "ပဲအမျိုးအစား ရှာမတွေ့ပါ" });
  }
  writeBeans(filtered);
  res.json({ message: "ဖျက်ပြီးပါပြီ" });
});

module.exports = router;
