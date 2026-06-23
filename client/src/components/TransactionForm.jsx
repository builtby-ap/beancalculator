import { useState, useEffect } from "react";
import { getBeans, addTransaction } from "../api/client";
import { calculateTotalViss } from "../utils/calculateTotalViss";
import { calculateSettlement } from "../utils/calculateSettlement";

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
  paidAmount: "",
};

export default function TransactionForm({ onSuccess }) {
  const [beans, setBeans] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [otherFees, setOtherFees] = useState([]);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    getBeans().then(setBeans);
  }, []);

  const selectedBean = beans.find((b) => b.id === form.beanTypeId);

  useEffect(() => {
    if (!selectedBean || !form.numberOfBags || !form.vissPerBag || !form.price) {
      setPreview(null);
      return;
    }

    const weightResult = calculateTotalViss({
      numberOfBags: form.numberOfBags,
      vissPerBag: form.vissPerBag,
      extraViss: form.extraViss || 0,
    });

    const settlement = calculateSettlement({
      totalViss: weightResult.totalViss,
      price: form.price,
      standardWeight: selectedBean.standardWeight,
      numberOfBags: form.numberOfBags,
      laborFeePerBag: form.laborFeePerBag || 0,
      bagCostPerBag: form.bagCostPerBag || 0,
      serviceFeePercent: form.serviceFeePercent || 0,
      otherFees,
    });

    setPreview({ weight: weightResult, settlement });
  }, [
    form.numberOfBags, form.vissPerBag, form.extraViss,
    form.price, form.laborFeePerBag, form.bagCostPerBag, form.serviceFeePercent,
    form.beanTypeId, selectedBean, otherFees,
  ]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addOtherFee = () => setOtherFees([...otherFees, { name: "", amountPerBag: "" }]);
  const updateOtherFee = (i, field, value) => {
    const copy = [...otherFees];
    copy[i] = { ...copy[i], [field]: value };
    setOtherFees(copy);
  };
  const removeOtherFee = (i) => setOtherFees(otherFees.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addTransaction({
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
      paidAmount: Number(form.paidAmount) || 0,
    });
    setForm(emptyForm);
    setOtherFees([]);
    setPreview(null);
    if (onSuccess) onSuccess();
  };

  const fmt = (n) => Number(n).toLocaleString("my-MM");
  const inputCls = "w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div>
        <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">အခြေခံ အချက်အလက်</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">တောင်သူအမည်</label>
            <input type="text" name="farmerName" value={form.farmerName} onChange={handleChange} required placeholder="ဥပမာ - ဦးမောင်" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ပဲအမျိုးအစား</label>
            <select name="beanTypeId" value={form.beanTypeId} onChange={handleChange} required className={inputCls}>
              <option value="">-- ရွေးပါ --</option>
              {beans.map((b) => <option key={b.id} value={b.id}>{b.name} (စံ: {b.standardWeight} ပိဿာ)</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Weight */}
      <div>
        <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">အလေးချိန်</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium mb-1">အိတ်အရေအတွက်</label><input type="number" name="numberOfBags" value={form.numberOfBags} onChange={handleChange} required min="0" placeholder="0" className={inputCls} /></div>
          <div><label className="block text-sm font-medium mb-1">တစ်အိတ်လျှင် ပိဿာ</label><input type="number" name="vissPerBag" value={form.vissPerBag} onChange={handleChange} required min="0" step="0.1" placeholder="25" className={inputCls} /></div>
          <div><label className="block text-sm font-medium mb-1">အပို ပိဿာ</label><input type="number" name="extraViss" value={form.extraViss} onChange={handleChange} min="0" step="0.1" placeholder="0" className={inputCls} /><p className="text-xs text-gray-500 mt-1">အိတ်မပြည့်သော ကျန်အလေးချိန်</p></div>
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">ဈေးနှုန်း</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">ဈေးနှုန်း (ကျပ်)</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" placeholder="ဈေးနှုန်း ထည့်ပါ" className={inputCls} />
            <p className="text-xs text-gray-500 mt-1">နေ့စဉ် ပြောင်းလဲနိုင်သောကြောင့် လက်ဖြင့် ထည့်ပါ</p>
          </div>
          {selectedBean && form.price && (
            <div className="flex items-end">
              <div className="bg-gray-50 rounded-lg px-4 py-2 text-sm text-gray-500">
                တွက်ချက်ပုံ: စုစုပေါင်းပိဿာ × {fmt(form.price)} ÷ {selectedBean.standardWeight}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deductions */}
      <div>
        <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">နုတ်ယူငွေ</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium mb-1">အလုပ်ခ (တစ်အိတ်လျှင် ကျပ်)</label><input type="number" name="laborFeePerBag" value={form.laborFeePerBag} onChange={handleChange} min="0" placeholder="0" className={inputCls} /></div>
          <div><label className="block text-sm font-medium mb-1">အိတ်ခ (တစ်အိတ်လျှင် ကျပ်)</label><input type="number" name="bagCostPerBag" value={form.bagCostPerBag} onChange={handleChange} min="0" placeholder="0" className={inputCls} /></div>
          <div><label className="block text-sm font-medium mb-1">ပွဲခ (%)</label><input type="number" name="serviceFeePercent" value={form.serviceFeePercent} onChange={handleChange} min="0" step="0.1" placeholder="0" className={inputCls} /><p className="text-xs text-gray-500 mt-1">အခြေခံငွေ × ရာခိုင်နှုန်း ÷ ၁၀၀</p></div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">အခြားကုန်ကျစရိတ် (တစ်အိတ်လျှင်)</label>
            <button type="button" onClick={addOtherFee} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition">+ ထည့်ရန်</button>
          </div>
          {otherFees.length === 0 && <p className="text-xs text-gray-400">အခြားကုန်ကျစရိတ် မရှိပါ</p>}
          {otherFees.map((fee, i) => (
            <div key={i} className="flex gap-2 mb-2 items-center">
              <input type="text" value={fee.name} onChange={(e) => updateOtherFee(i, "name", e.target.value)} placeholder="အမည် (ဥပမာ - သယ်ယူစရိတ်)" className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none" />
              <input type="number" value={fee.amountPerBag} onChange={(e) => updateOtherFee(i, "amountPerBag", e.target.value)} min="0" placeholder="တစ်အိတ်လျှင်" className="w-32 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none" />
              <button type="button" onClick={() => removeOtherFee(i)} className="text-red-500 hover:text-red-700 px-2 py-2">✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment */}
      <div>
        <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">ငွေပေးချေမှု</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">ပေးချေငွေ (ကျပ်)</label><input type="number" name="paidAmount" value={form.paidAmount} onChange={handleChange} min="0" placeholder="0" className={inputCls} /></div>
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5">
          <p className="text-sm font-semibold text-emerald-700 mb-3">တွက်ချက်မှု ကြိုတင်ကြည့်ရှု</p>

          <div className="mb-3 pb-3 border-b border-emerald-200">
            <p className="text-xs text-emerald-600 font-medium mb-1">အလေးချိန်</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div><span className="text-gray-500">အိတ်မှ:</span> <strong>{fmt(preview.weight.breakdown.bagsViss)} ပိဿာ</strong><span className="text-xs text-gray-400 block">({preview.weight.breakdown.numberOfBags} အိတ် × {preview.weight.breakdown.vissPerBag})</span></div>
              <div><span className="text-gray-500">အပို:</span> <strong>{fmt(preview.weight.breakdown.extraViss)} ပိဿာ</strong></div>
              <div className="col-span-2"><span className="text-gray-500">စုစုပေါင်း:</span> <strong className="text-emerald-700">{fmt(preview.weight.totalViss)} ပိဿာ</strong></div>
            </div>
          </div>

          <div className="mb-3 pb-3 border-b border-emerald-200">
            <p className="text-xs text-emerald-600 font-medium mb-1">ငွေကြေး</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div><span className="text-gray-500">အခြေခံငွေ:</span> <strong>{fmt(preview.settlement.baseAmount)} ကျပ်</strong><span className="text-xs text-gray-400 block">({fmt(preview.weight.totalViss)} × {fmt(preview.settlement.pricing.price)} ÷ {preview.settlement.pricing.standardWeight})</span></div>
              <div><span className="text-gray-500">နုတ်ယူငွေ:</span> <strong className="text-red-600">-{fmt(preview.settlement.deductions.totalDeductions)} ကျပ်</strong></div>
              <div><span className="text-gray-500">ပေးရမည့်ငွေ:</span> <strong className="text-emerald-700 text-base">{fmt(preview.settlement.finalTotal)} ကျပ်</strong></div>
            </div>
          </div>

          {preview.settlement.deductions.totalDeductions > 0 && (
            <div>
              <p className="text-xs text-emerald-600 font-medium mb-1">နုတ်ယူငွေ အသေးစိတ်</p>
              <div className="flex flex-wrap gap-2 text-xs">
                {preview.settlement.deductions.laborFee.total > 0 && <span className="bg-white px-2 py-1 rounded border">အလုပ်ခ: {fmt(preview.settlement.deductions.laborFee.perBag)} × {preview.weight.breakdown.numberOfBags} = {fmt(preview.settlement.deductions.laborFee.total)}</span>}
                {preview.settlement.deductions.bagCost.total > 0 && <span className="bg-white px-2 py-1 rounded border">အိတ်ခ: {fmt(preview.settlement.deductions.bagCost.perBag)} × {preview.weight.breakdown.numberOfBags} = {fmt(preview.settlement.deductions.bagCost.total)}</span>}
                {preview.settlement.deductions.serviceFee.total > 0 && <span className="bg-white px-2 py-1 rounded border">ပွဲခ: {fmt(preview.settlement.baseAmount)} × {preview.settlement.deductions.serviceFee.percent}% = {fmt(preview.settlement.deductions.serviceFee.total)}</span>}
                {preview.settlement.deductions.otherFees.map((f, i) => <span key={i} className="bg-white px-2 py-1 rounded border">{f.name}: {fmt(f.amountPerBag)} × {preview.weight.breakdown.numberOfBags} = {fmt(f.total)}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      <button type="submit" className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition font-medium">
        မှတ်တမ်း သိမ်းဆည်းရန်
      </button>
    </form>
  );
}
