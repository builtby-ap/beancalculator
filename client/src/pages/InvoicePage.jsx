import { useState, useEffect, useMemo } from "react";
import { getBeans, saveInvoice } from "../api/client";
import { calculateInvoice } from "../utils/calculateInvoice";
import BeanTable from "../components/invoice/BeanTable";
import DeductionSection from "../components/invoice/DeductionSection";
import InvoiceSummary from "../components/invoice/InvoiceSummary";
import InvoicePrintView from "../components/invoice/InvoicePrintView";

const emptyBeanRows = [
  { beanTypeId: "", vissPerBag: "25", numberOfBags: "", extraViss: "", price: "" },
];

const emptyDeductions = { labor: "", service: "", transport: "" };

export default function InvoicePage() {
  const [farmerName, setFarmerName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [beanRows, setBeanRows] = useState(emptyBeanRows);
  const [deductions, setDeductions] = useState(emptyDeductions);
  const [customDeductions, setCustomDeductions] = useState([]);
  const [beans, setBeans] = useState([]);
  const [saving, setSaving] = useState(false);

  // Saved invoice data for print view (separate from form state)
  const [savedPrint, setSavedPrint] = useState(null);

  useEffect(() => {
    getBeans().then(setBeans);
  }, []);

  // Build deduction array for calculation
  const deductionArray = useMemo(() => {
    const items = [];
    if (deductions.labor && Number(deductions.labor) > 0) {
      items.push({ key: "labor", label: "လုပ်သားခ", type: "per_bag", amount: Number(deductions.labor) });
    }
    if (deductions.service && Number(deductions.service) > 0) {
      items.push({ key: "service", label: "ပွဲခ", type: "percent", amount: Number(deductions.service) });
    }
    if (deductions.transport && Number(deductions.transport) > 0) {
      items.push({ key: "transport", label: "ကားခ", type: "per_bag", amount: Number(deductions.transport) });
    }
    customDeductions.forEach((cd, i) => {
      if (cd.label && cd.amount && Number(cd.amount) > 0) {
        items.push({ key: `custom_${i}`, label: cd.label, type: "per_bag", amount: Number(cd.amount) });
      }
    });
    return items;
  }, [deductions, customDeductions]);

  // Enrich bean rows with bean names and standardWeight
  const enrichedRows = useMemo(() => {
    return beanRows.map((row) => {
      const bean = beans.find((b) => b.id === row.beanTypeId);
      return {
        ...row,
        beanName: bean?.name || "",
        standardWeight: bean?.standardWeight || row.standardWeight || 1,
      };
    });
  }, [beanRows, beans]);

  // Real-time calculation
  const result = useMemo(() => {
    return calculateInvoice({ beanRows: enrichedRows, deductions: deductionArray });
  }, [enrichedRows, deductionArray]);

  const invoiceNo = `INV-${Date.now()}`;

  // Clear all form fields
  const clearForm = () => {
    setFarmerName("");
    setDate(new Date().toISOString().split("T")[0]);
    setBeanRows(emptyBeanRows);
    setDeductions(emptyDeductions);
    setCustomDeductions([]);
  };

  // Save invoice to server
  const handleSaveAndPrint = async () => {
    if (!farmerName || result.beanRows.length === 0) {
      alert("တောင်သူအမည်နှင့် ပဲစာရင်း ဖြည့်ပါ");
      return;
    }
    setSaving(true);
    try {
      const inv = await saveInvoice({
        farmerName,
        date,
        beanRows: result.beanRows.map((r) => ({
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
        deductions: deductionArray,
        totalBags: result.totalBags,
        totalViss: result.totalViss,
        totalValue: result.totalValue,
        totalDeductions: result.totalDeductions,
        finalTotal: result.finalTotal,
      });

      // Save print data before clearing form
      setSavedPrint({
        invoiceNo: inv.invoice_id,
        date,
        farmerName,
        result: JSON.parse(JSON.stringify(result)),
      });

      // Clear all form fields
      clearForm();
    } catch (err) {
      alert("သိမ်းဆည်း၍ မရပါ: " + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    clearForm();
    setSavedPrint(null);
  };

  // If we have saved print data, show print view
  if (savedPrint) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">ငွေရှင်းစာရင်း</h2>
          <button
            onClick={() => setSavedPrint(null)}
            className="text-sm bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-lg transition"
          >
            + ဘောင်ချာအသစ် ထုတ်ရန်
          </button>
        </div>
        <InvoicePrintView
          invoiceNo={savedPrint.invoiceNo}
          date={savedPrint.date}
          farmerName={savedPrint.farmerName}
          result={savedPrint.result}
          onClose={() => setSavedPrint(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">ငွေရှင်းစာရင်း</h2>
        <button
          onClick={handleReset}
          className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
        >
          ပြန်စရန်
        </button>
      </div>

      <div className="space-y-6">
        {/* Invoice info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">ဘောင်ချာ အချက်အလက်</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">တောင်သူအမည်</label>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                placeholder="ဥပမာ — ဦးမောင်"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">ရက်စွဲ</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Invoice No</label>
              <input
                type="text"
                value={invoiceNo}
                readOnly
                className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Bean table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <BeanTable rows={beanRows} onChange={setBeanRows} />
        </div>

        {/* Deductions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <DeductionSection
            deductions={deductions}
            customDeductions={customDeductions}
            onDeductionChange={setDeductions}
            onCustomChange={setCustomDeductions}
          />
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <InvoiceSummary result={result} />
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveAndPrint}
            disabled={result.beanRows.length === 0 || saving}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
          >
            {saving ? "သိမ်းနေသည်..." : "🖨️ သိမ်းဆည်းပြီး ဘောင်ချာ ထုတ်ရန်"}
          </button>
        </div>
      </div>
    </div>
  );
}
