import { useState, useEffect } from "react";
import { getInvoices } from "../api/client";
import InvoiceSlip from "../components/InvoiceSlip";

export default function InvoiceHistory() {
  const [invoices, setInvoices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchDate, setSearchDate] = useState("");
  const [filterBean, setFilterBean] = useState("");
  const [searchFarmer, setSearchFarmer] = useState("");

  useEffect(() => {
    getInvoices().then((data) => {
      setInvoices(data);
      setFiltered(data);
    });
  }, []);

  // Get unique bean names for filter dropdown
  const beanTypes = [...new Set(invoices.flatMap((inv) => {
    if (inv.bean_rows) return inv.bean_rows.map((r) => r.beanName);
    return inv.bean?.name ? [inv.bean.name] : [];
  }))];

  // Apply filters
  useEffect(() => {
    let result = invoices;

    if (searchDate) {
      result = result.filter((inv) => {
        const invDate = new Date(inv.date).toISOString().split("T")[0];
        return invDate === searchDate;
      });
    }

    if (filterBean) {
      result = result.filter((inv) => {
        if (inv.bean_rows) return inv.bean_rows.some((r) => r.beanName === filterBean);
        return inv.bean?.name === filterBean;
      });
    }

    if (searchFarmer) {
      const term = searchFarmer.toLowerCase();
      result = result.filter((inv) =>
        inv.farmer?.name?.toLowerCase().includes(term)
      );
    }

    setFiltered(result);
  }, [searchDate, filterBean, searchFarmer, invoices]);

  const fmt = (n) => Number(n).toLocaleString("my-MM");

  // Summary stats
  const totalInvoices = filtered.length;
  const totalViss = filtered.reduce((s, inv) => s + (inv.weight?.total_viss || 0), 0);
  const totalBase = filtered.reduce((s, inv) => s + (inv.pricing?.base_amount || inv.summary?.base_amount || 0), 0);
  const totalDeductions = filtered.reduce((s, inv) => s + (inv.deductions?.total || 0), 0);
  const totalPayout = filtered.reduce((s, inv) => s + (inv.summary?.final_amount || 0), 0);

  // Get bean names display for an invoice
  const getBeanNames = (inv) => {
    if (inv.bean_rows && inv.bean_rows.length > 0) {
      return inv.bean_rows.map((r) => r.beanName).join(", ");
    }
    return inv.bean?.name || "-";
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">မှတ်တမ်းများ</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-lg border p-3 text-center">
          <p className="text-xs text-gray-400">ဘောင်ချာ</p>
          <p className="text-lg font-bold text-gray-700">{totalInvoices}</p>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center">
          <p className="text-xs text-gray-400">စုစုပေါင်း ပိဿာ</p>
          <p className="text-lg font-bold text-emerald-700">{fmt(totalViss)}</p>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center">
          <p className="text-xs text-gray-400">အခြေခံငွေ</p>
          <p className="text-lg font-bold text-gray-700">{fmt(totalBase)}</p>
        </div>
        <div className="bg-white rounded-lg border p-3 text-center">
          <p className="text-xs text-gray-400">ဖြတ်တောက်ငွေ</p>
          <p className="text-lg font-bold text-red-600">{fmt(totalDeductions)}</p>
        </div>
        <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-3 text-center">
          <p className="text-xs text-emerald-600">ပေးချေငွေ စုစုပေါင်း</p>
          <p className="text-lg font-bold text-emerald-700">{fmt(totalPayout)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">ရက်စွဲ ရှာရန်</label>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">ပဲအမျိုးအစား</label>
            <select
              value={filterBean}
              onChange={(e) => setFilterBean(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none"
            >
              <option value="">အားလုံး</option>
              {beanTypes.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">တောင်သူအမည်</label>
            <input
              type="text"
              value={searchFarmer}
              onChange={(e) => setSearchFarmer(e.target.value)}
              placeholder="အမည် ရိုက်ထည့်ပါ"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchDate("");
                setFilterBean("");
                setSearchFarmer("");
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm transition"
            >
              စစ်ထုတ်မှု ရှင်းရန်
            </button>
          </div>
        </div>
      </div>

      {/* Invoice list */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">📭</p>
            <p>ဘောင်ချာ မရှိသေးပါ</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">ဘောင်ချာ</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">ရက်စွဲ</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">တောင်သူ</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">ပဲအမျိုးအစား</th>
                  <th className="py-3 px-4 text-right text-gray-600 font-semibold">စုစုပေါင်း ပိဿာ</th>
                  <th className="py-3 px-4 text-right text-gray-600 font-semibold">အခြေခံငွေ</th>
                  <th className="py-3 px-4 text-right text-gray-600 font-semibold">ဖြတ်တောက်ငွေ</th>
                  <th className="py-3 px-4 text-right text-gray-600 font-semibold">ပေးချေငွေ</th>
                  <th className="py-3 px-4 text-center text-gray-600 font-semibold">လုပ်ဆောင်</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.invoice_id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {inv.invoice_id.slice(0, 20)}...
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{inv.date_formatted}</td>
                    <td className="py-3 px-4 font-medium">{inv.farmer?.name || "-"}</td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-xs">
                        {getBeanNames(inv)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {fmt(inv.weight?.total_viss || 0)} ပိဿာ
                    </td>
                    <td className="py-3 px-4 text-right">
                      {fmt(inv.pricing?.base_amount || inv.summary?.base_amount || 0)} ကျပ်
                    </td>
                    <td className="py-3 px-4 text-right text-red-600">
                      {inv.deductions?.total > 0 ? `-${fmt(inv.deductions.total)}` : "-"} ကျပ်
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      {fmt(inv.summary?.final_amount || 0)} ကျပ်
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition"
                      >
                        ကြည့်ရန်
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail view modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8">
          <div className="bg-white rounded-xl shadow-2xl max-w-[850px] w-full mx-4 p-6">
            <InvoiceSlip
              invoice={selectedInvoice}
              onClose={() => setSelectedInvoice(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
