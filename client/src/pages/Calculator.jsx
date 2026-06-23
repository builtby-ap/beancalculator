import { useState, useEffect } from "react";
import { getBeans, calculateInvoice } from "../api/client";
import { calculateTotalViss } from "../utils/calculateTotalViss";
import { calculateSettlement } from "../utils/calculateSettlement";
import InvoiceSlip from "../components/InvoiceSlip";

const emptyForm = {
  farmerName: "",
  beanTypeId: "",
  numberOfBags: "",
  vissPerBag: "25",
  extraViss: "",
  price: "",
  laborFeePerBag: "",
  bagCostPerBag: "",
  serviceFeePercent: "",
};

export default function Calculator() {
  const [beans, setBeans] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [otherFees, setOtherFees] = useState([]);
  const [result, setResult] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getBeans().then(setBeans);
  }, []);

  const selectedBean = beans.find((b) => b.id === form.beanTypeId);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Live preview
  useEffect(() => {
    if (!form.numberOfBags || !form.vissPerBag || !form.price || !selectedBean) {
      setResult(null);
      return;
    }

    const weight = calculateTotalViss({
      numberOfBags: form.numberOfBags,
      vissPerBag: form.vissPerBag,
      extraViss: form.extraViss || 0,
    });

    const settlement = calculateSettlement({
      totalViss: weight.totalViss,
      price: form.price,
      standardWeight: selectedBean.standardWeight,
      numberOfBags: form.numberOfBags,
      laborFeePerBag: form.laborFeePerBag || 0,
      bagCostPerBag: form.bagCostPerBag || 0,
      serviceFeePercent: form.serviceFeePercent || 0,
      otherFees,
    });

    setResult({ weight, settlement });
  }, [
    form.numberOfBags, form.vissPerBag, form.extraViss,
    form.price, form.laborFeePerBag, form.bagCostPerBag, form.serviceFeePercent,
    form.beanTypeId, selectedBean, otherFees,
  ]);

  const addOtherFee = () => setOtherFees([...otherFees, { name: "", amountPerBag: "" }]);
  const updateOtherFee = (i, field, value) => {
    const copy = [...otherFees];
    copy[i] = { ...copy[i], [field]: value };
    setOtherFees(copy);
  };
  const removeOtherFee = (i) => setOtherFees(otherFees.filter((_, idx) => idx !== i));

  const handleCalculate = () => {
    if (!result) return;
    document.getElementById("result-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleGenerateInvoice = async () => {
    if (!form.farmerName || !form.beanTypeId || !form.numberOfBags || !form.vissPerBag || !form.price) {
      alert("လိုအပ်သော အချက်အလက်များ ဖြည့်ပါ");
      return;
    }
    setLoading(true);
    try {
      const inv = await calculateInvoice({
        farmerName: form.farmerName,
        beanTypeId: form.beanTypeId,
        numberOfBags: Number(form.numberOfBags),
        vissPerBag: Number(form.vissPerBag),
        extraViss: Number(form.extraViss) || 0,
        price: Number(form.price),
        laborFeePerBag: Number(form.laborFeePerBag) || 0,
        bagCostPerBag: Number(form.bagCostPerBag) || 0,
        serviceFeePercent: Number(form.serviceFeePercent) || 0,
        otherFees: otherFees
          .filter((f) => f.name && Number(f.amountPerBag) > 0)
          .map((f) => ({ name: f.name, amountPerBag: Number(f.amountPerBag) })),
      });
      setInvoice(inv);
    } catch (err) {
      alert("စာရင်းထုတ်၍ မရပါ: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => Number(n).toLocaleString("my-MM");
  const inputCls =
    "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:outline-none transition";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">တွက်ချက်စနစ်</h2>

      {/* ── Input Card ── */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">

        {/* Farmer + Bean */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">တောင်သူအမည်</label>
            <input type="text" name="farmerName" value={form.farmerName} onChange={handleChange} placeholder="ဥပမာ — ဦးမောင်" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">ပဲအမျိုးအစား</label>
            <select name="beanTypeId" value={form.beanTypeId} onChange={handleChange} className={inputCls}>
              <option value="">-- ရွေးပါ --</option>
              {beans.map((b) => (
                <option key={b.id} value={b.id}>{b.name} (စံ: {b.standardWeight} ပိဿာ)</option>
              ))}
            </select>
            {selectedBean && <p className="text-xs text-gray-400 mt-1">စံချိန်တန်း အလေးချိန်: {selectedBean.standardWeight} ပိဿာ</p>}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Weight */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">အလေးချိန်</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">အိတ်အရေအတွက်</label>
              <input type="number" name="numberOfBags" value={form.numberOfBags} onChange={handleChange} min="0" placeholder="0" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">တစ်အိတ်အလေးချိန် (ပိဿာ)</label>
              <input type="number" name="vissPerBag" value={form.vissPerBag} onChange={handleChange} min="0" step="0.1" placeholder="25" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">အပိုအလေးချိန် (ပိဿာ)</label>
              <input type="number" name="extraViss" value={form.extraViss} onChange={handleChange} min="0" step="0.1" placeholder="0" className={inputCls} />
              <p className="text-xs text-gray-400 mt-1">အိတ်မပြည့်သော ကျန်အလေးချိန်</p>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Pricing */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">ဈေးနှုန်း</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">ဈေးနှုန်း (ကျပ်)</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} min="0" placeholder="ဈေးနှုန်း ထည့်ပါ" className={inputCls} />
              <p className="text-xs text-gray-400 mt-1">နေ့စဉ် ပြောင်းလဲနိုင်သောကြောင့် လက်ဖြင့် ထည့်ပါ</p>
            </div>
            {selectedBean && form.price && (
              <div className="flex items-end">
                <div className="bg-gray-50 rounded-lg px-4 py-2.5 text-sm">
                  <span className="text-gray-400">တွက်ချက်ပုံ: </span>
                  <span className="font-medium">စုစုပေါင်းပိဿာ × {fmt(form.price)} ÷ {selectedBean.standardWeight}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Deductions */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">နုတ်ယူငွေများ</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">အလုပ်ခ (တစ်အိတ်လျှင် ကျပ်)</label>
              <input type="number" name="laborFeePerBag" value={form.laborFeePerBag} onChange={handleChange} min="0" placeholder="0" className={inputCls} />
              <p className="text-xs text-gray-400 mt-1">အိတ်အရေအတွက် × ထည့်သောငွေ</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">အိတ်ခ (တစ်အိတ်လျှင် ကျပ်)</label>
              <input type="number" name="bagCostPerBag" value={form.bagCostPerBag} onChange={handleChange} min="0" placeholder="0" className={inputCls} />
              <p className="text-xs text-gray-400 mt-1">အိတ်အရေအတွက် × ထည့်သောငွေ</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">ပွဲခ (%)</label>
              <input type="number" name="serviceFeePercent" value={form.serviceFeePercent} onChange={handleChange} min="0" step="0.1" placeholder="0" className={inputCls} />
              <p className="text-xs text-gray-400 mt-1">အခြေခံငွေ × ရာခိုင်နှုန်း ÷ ၁၀၀</p>
            </div>
          </div>

          {/* Other fees */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">အခြားကုန်ကျစရိတ် (တစ်အိတ်လျှင်)</label>
              <button type="button" onClick={addOtherFee} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition">+ ထည့်ရန်</button>
            </div>
            {otherFees.length === 0 && <p className="text-xs text-gray-400">အခြားကုန်ကျစရိတ် မရှိပါ</p>}
            {otherFees.map((fee, i) => (
              <div key={i} className="flex gap-2 mb-2 items-center">
                <input type="text" value={fee.name} onChange={(e) => updateOtherFee(i, "name", e.target.value)} placeholder="အမည် (ဥပမာ — သယ်ယူစရိတ်)" className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none" />
                <input type="number" value={fee.amountPerBag} onChange={(e) => updateOtherFee(i, "amountPerBag", e.target.value)} min="0" placeholder="တစ်အိတ်လျှင်" className="w-36 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none" />
                <button type="button" onClick={() => removeOtherFee(i)} className="text-red-400 hover:text-red-600 px-2 py-2 transition">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={handleCalculate} disabled={!result} className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium">
            တွက်ချက်ရန်
          </button>
          <button type="button" onClick={handleGenerateInvoice} disabled={!result || loading} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium">
            {loading ? "ထုတ်နေသည်..." : "ငွေပေးချေစာရင်းထုတ်ရန်"}
          </button>
        </div>
      </div>

      {/* ── Live Result ── */}
      {result && (
        <div id="result-section" className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-emerald-600 text-white px-6 py-4">
            <h3 className="text-lg font-bold">တွက်ချက်မှု ရလဒ်</h3>
          </div>

          <div className="p-6 space-y-5">
            {/* Weight */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-500 mb-3">အလေးချိန်</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">အိတ်မှ ပိဿာ</p>
                  <p className="font-medium">{result.weight.breakdown.numberOfBags} အိတ် × {result.weight.breakdown.vissPerBag}</p>
                  <p className="text-emerald-700 font-bold">{fmt(result.weight.breakdown.bagsViss)} ပိဿာ</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">အပို ပိဿာ</p>
                  <p className="text-emerald-700 font-bold">{fmt(result.weight.breakdown.extraViss)} ပိဿာ</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400 text-xs">စုစုပေါင်း</p>
                  <p className="text-emerald-700 text-xl font-bold">{fmt(result.weight.totalViss)} ပိဿာ</p>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-500 mb-3">ငွေတွက်</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">ဈေးနှုန်း</p>
                  <p className="font-medium">{fmt(result.settlement.pricing.price)} ကျပ်</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">စံချိန်တန်း</p>
                  <p className="font-medium">{result.settlement.pricing.standardWeight} ပိဿာ</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">အခြေခံငွေ</p>
                  <p className="font-bold">{fmt(result.settlement.baseAmount)} ကျပ်</p>
                  <p className="text-xs text-gray-400">({fmt(result.weight.totalViss)} × {fmt(result.settlement.pricing.price)} ÷ {result.settlement.pricing.standardWeight})</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">နုတ်ယူငွေ</p>
                  <p className="text-red-600 font-bold">
                    {result.settlement.deductions.totalDeductions > 0 ? `-${fmt(result.settlement.deductions.totalDeductions)} ကျပ်` : "0 ကျပ်"}
                  </p>
                </div>
              </div>

              {result.settlement.deductions.totalDeductions > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-400 mb-2">နုတ်ယူငွေ အသေးစိတ်</p>
                  <div className="flex flex-wrap gap-2">
                    {result.settlement.deductions.laborFee.total > 0 && (
                      <span className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full">
                        အလုပ်ခ — {fmt(result.settlement.deductions.laborFee.perBag)} × {result.weight.breakdown.numberOfBags} = {fmt(result.settlement.deductions.laborFee.total)} ကျပ်
                      </span>
                    )}
                    {result.settlement.deductions.bagCost.total > 0 && (
                      <span className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full">
                        အိတ်ခ — {fmt(result.settlement.deductions.bagCost.perBag)} × {result.weight.breakdown.numberOfBags} = {fmt(result.settlement.deductions.bagCost.total)} ကျပ်
                      </span>
                    )}
                    {result.settlement.deductions.serviceFee.total > 0 && (
                      <span className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full">
                        ပွဲခ — {fmt(result.settlement.baseAmount)} × {result.settlement.deductions.serviceFee.percent}% = {fmt(result.settlement.deductions.serviceFee.total)} ကျပ်
                      </span>
                    )}
                    {result.settlement.deductions.otherFees.map((f, i) => (
                      <span key={i} className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full">
                        {f.name} — {fmt(f.amountPerBag)} × {result.weight.breakdown.numberOfBags} = {fmt(f.total)} ကျပ်
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Final Amount */}
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-6 text-center">
              <p className="text-sm text-emerald-600 mb-1">👉 တောင်သူအားပေးချေမည့်ငွေ</p>
              <p className="text-4xl font-bold text-emerald-700">
                {fmt(result.settlement.finalTotal)} <span className="text-lg">ကျပ်</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Invoice Slip ── */}
      {invoice && (
        <InvoiceSlip invoice={invoice} onClose={() => setInvoice(null)} />
      )}
    </div>
  );
}
