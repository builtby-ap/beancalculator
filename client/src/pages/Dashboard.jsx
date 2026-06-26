import { useState, useEffect, useMemo } from "react";
import {
  getInvoiceSummary,
  getInvoices,
  updateInvoicePaid,
  getInvoice,
} from "../api/client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import InvoiceSlip from "../components/InvoiceSlip";

const COLORS = ["#059669", "#0891b2", "#7c3aed", "#db2777", "#ea580c", "#ca8a04", "#4f46e5", "#0d9488", "#be123c", "#1d4ed8"];
const RADIAN = Math.PI / 180;

function renderDonutLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Date filter
  const [datePreset, setDatePreset] = useState("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Bean price line chart filters
  const [selectedBeanLines, setSelectedBeanLines] = useState([]);
  const [chartDateStart, setChartDateStart] = useState("");
  const [chartDateEnd, setChartDateEnd] = useState("");

  // Farmer filter
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [farmerSearchInput, setFarmerSearchInput] = useState("");
  const [farmerDropdownOpen, setFarmerDropdownOpen] = useState(false);

  const fmt = (n) => Number(n).toLocaleString("my-MM");

  const loadData = () => {
    const params = {};
    if (datePreset === "custom") {
      if (customStart) params.start = customStart;
      if (customEnd) params.end = customEnd;
    } else if (datePreset !== "all") {
      const now = new Date();
      if (datePreset === "today") {
        params.start = now.toISOString().split("T")[0];
        params.end = now.toISOString().split("T")[0];
      } else if (datePreset === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        params.start = weekAgo.toISOString().split("T")[0];
      } else if (datePreset === "month") {
        params.start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      } else if (datePreset === "year") {
        params.start = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
      }
    }
    const qs = Object.entries(params).map(([k, v]) => `${k}=${v}`).join("&");
    getInvoiceSummary(qs ? `?${qs}` : "").then(setSummary);
    getInvoices().then(setInvoices);
  };

  useEffect(loadData, [datePreset, customStart, customEnd]);

  const handleUpdatePaid = async (invoiceId, paid) => {
    if (isNaN(paid) || paid < 0) return;
    await updateInvoicePaid(invoiceId, paid);
    loadData();
  };

  // ── Farmer-filtered invoices (for recent invoices section only) ──
  const farmerInvoices = useMemo(() => {
    if (!selectedFarmer) return invoices;
    return invoices.filter((inv) => inv.farmer?.name === selectedFarmer);
  }, [invoices, selectedFarmer]);

  // Farmer-visible rows for balance table — filtered by selected farmer
  const farmerRows = useMemo(() => {
    if (!summary?.farmers) return [];
    if (selectedFarmer) {
      return summary.farmers.filter((f) => f.name === selectedFarmer);
    }
    return summary.farmers;
  }, [summary?.farmers, selectedFarmer]);

  // Close dropdown on outside click
  const closeFarmerDropdown = () => {
    setFarmerSearchInput(selectedFarmer || "");
    setFarmerDropdownOpen(false);
  };

  // Bean price timeline — GLOBAL (unfiltered)
  const chartData = useMemo(() => {
    if (!summary?.beanPriceTimeline) return [];
    let data = summary.beanPriceTimeline;
    if (selectedBeanLines.length > 0) {
      data = data.filter((p) => selectedBeanLines.includes(p.beanName));
    }
    if (chartDateStart) {
      const s = new Date(chartDateStart);
      data = data.filter((p) => new Date(p.dateRaw) >= s);
    }
    if (chartDateEnd) {
      const e = new Date(chartDateEnd);
      e.setHours(23, 59, 59, 999);
      data = data.filter((p) => new Date(p.dateRaw) <= e);
    }
    const groups = {};
    data.forEach((p) => {
      const key = `${p.date}|${p.beanName}`;
      if (!groups[key]) groups[key] = { date: p.date, beanName: p.beanName, prices: [] };
      groups[key].prices.push(p.price);
    });
    return Object.values(groups).map((g) => ({
      date: g.date, beanName: g.beanName,
      price: Math.round(g.prices.reduce((s, v) => s + v, 0) / g.prices.length),
    }));
  }, [summary?.beanPriceTimeline, selectedBeanLines, chartDateStart, chartDateEnd]);

  const pivotedChartData = useMemo(() => {
    const dm = {};
    chartData.forEach((d) => {
      if (!dm[d.date]) dm[d.date] = { date: d.date };
      dm[d.date][d.beanName] = d.price;
    });
    return Object.values(dm).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [chartData]);

  const chartBeanLines = selectedBeanLines.length > 0 ? selectedBeanLines : (summary?.beanNames || []);

  if (!summary) {
    return <div className="text-center py-16 text-gray-400">ခေတ္တ စောင့်ပါ...</div>;
  }

  return (
    <div className="space-y-6">
      {/* ── Header + Date Filters ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">ပင်မစာမျက်နှာ</h2>
        <div className="flex gap-2 flex-wrap">
          {[
            ["today", "ယနေ့"], ["week", "ယခုအပတ်"], ["month", "ယခုလ"], ["year", "ယခုနှစ်"],
            ["custom", "စိတ်ကြိုက်"], ["all", "အားလုံး"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setDatePreset(key)}
              className={`text-xs px-3 py-1.5 rounded-lg transition ${
                datePreset === key ? "bg-emerald-600 text-white font-medium" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {datePreset === "custom" && (
        <div className="flex gap-3 bg-white rounded-xl shadow-sm p-4 items-center">
          <span className="text-sm text-gray-500">မှ</span>
          <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
          <span className="text-sm text-gray-500">ထိ</span>
          <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
          <button onClick={() => setDatePreset("month")} className="text-xs text-gray-400 hover:text-gray-600">ပြန်ထား</button>
        </div>
      )}

      {/* ── Summary Cards — ALL GLOBAL ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card title="📄 စုစုပေါင်း Invoice များ" value={summary.totalInvoices} sub={`ယခုလ: ${summary.monthInvoicesCount}`} />
        <Card title="💰 Invoice တန်ဖိုး" value={`${fmt(summary.totalValue)}`} unit="ကျပ်" sub={datePreset === "month" ? `ယခုလ: ${fmt(summary.monthValue)}` : null} />
        <Card title="📉 ဖြတ်တောက်ငွေ" value={`${fmt(summary.totalDeductions)}`} unit="ကျပ်" color="red" />
        <Card title="💵 ပေးရန်ကျန်ငွေ" value={`${fmt(summary.balance)}`} unit="ကျပ်" color={summary.balance > 0 ? "amber" : "green"} />
        <Card title="✅ ပေးချေပြီးငွေ" value={`${fmt(summary.totalPaid)}`} unit="ကျပ်" color="blue" />
        <Card title="🧾 ရရှိရမည့်ငွေ" value={`${fmt(summary.totalFinal)}`} unit="ကျပ်" color="emerald" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ── Deductions Donut — GLOBAL ── */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">ဖြတ်တောက်ငွေ ဖြန့်ခွဲမှု</h3>
          {summary.deductionsArray.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">ဒေတာ မရှိသေးပါ</div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={summary.deductionsArray} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label={renderDonutLabel} labelLine={false}>
                    {summary.deductionsArray.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${fmt(v)} ကျပ်`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 text-xs min-w-[160px]">
                {summary.deductionsArray.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-600 truncate">{d.name}</span>
                    <span className="font-semibold ml-auto">{fmt(d.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Bean Price Line Chart — GLOBAL ── */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-sm font-semibold text-gray-600">ပဲစျေးနှုန်း လမ်းကြောင်း</h3>
            <div className="flex gap-2 flex-wrap">
              <input type="date" value={chartDateStart} onChange={(e) => setChartDateStart(e.target.value)} className="border rounded px-2 py-1 text-xs" />
              <span className="text-xs text-gray-400 self-center">မှ</span>
              <input type="date" value={chartDateEnd} onChange={(e) => setChartDateEnd(e.target.value)} className="border rounded px-2 py-1 text-xs" />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {(summary.beanNames || []).slice(0, 12).map((name) => (
              <button key={name} onClick={() => setSelectedBeanLines((prev) => prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name])}
                className={`text-[11px] px-2 py-0.5 rounded-full transition ${selectedBeanLines.length === 0 || selectedBeanLines.includes(name) ? "bg-emerald-100 text-emerald-700 font-medium" : "bg-gray-100 text-gray-400"}`}
              >{name}</button>
            ))}
            {selectedBeanLines.length > 0 && (<button onClick={() => setSelectedBeanLines([])} className="text-[11px] px-2 py-0.5 text-red-500">ရှင်း</button>)}
          </div>
          {pivotedChartData.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">ဒေတာ မရှိသေးပါ</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={pivotedChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#888" }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: "#888" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v, n) => [`${fmt(v)} ကျပ်`, n]} labelFormatter={(l) => `ရက်စွဲ: ${l}`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {chartBeanLines.map((name, i) => (
                  <Line key={name} type="monotone" dataKey={name} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} connectNulls name={name} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Bean Statistics Cards — GLOBAL ── */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-600 mb-4">ပဲအမျိုးအစားအလိုက် စာရင်း</h3>
        {summary.beanStats.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">ဒေတာ မရှိသေးပါ</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {summary.beanStats.map((bean) => (
              <div key={bean.name} className="border rounded-lg p-3 hover:border-emerald-300 transition">
                <p className="text-sm font-semibold text-gray-700 mb-2">{bean.name}</p>
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex justify-between"><span>ပိဿာ:</span><span className="font-medium">{fmt(bean.totalViss)}</span></div>
                  <div className="flex justify-between"><span>ပျမ်းမျှစျေး:</span><span className="font-medium">{fmt(bean.avgPrice)}</span></div>
                  <div className="flex justify-between"><span>တန်ဖိုး:</span><span className="font-medium">{fmt(bean.totalValue)}</span></div>
                  <div className="flex justify-between"><span>Invoice:</span><span className="font-medium">{bean.invoiceCount}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Farmer Balance Table — FARMER-FILTERED ── */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-sm font-semibold text-gray-600">တောင်သူ ငွေရှင်းစာရင်း</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">တောင်သူ ရွေးရန်:</span>
            <div className="relative">
              <input
                type="text"
                value={farmerSearchInput}
                onChange={(e) => { setFarmerSearchInput(e.target.value); setFarmerDropdownOpen(true); }}
                onFocus={() => setFarmerDropdownOpen(true)}
                placeholder="အမည် ရိုက်ရှာပါ..."
                className="border rounded-lg px-3 py-2 text-sm w-52 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
              />
              {farmerDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => closeFarmerDropdown()} />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => { setSelectedFarmer(null); setFarmerSearchInput(""); setFarmerDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${!selectedFarmer ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-600"}`}
                    >
                      — တောင်သူအားလုံး —
                    </button>
                    {summary.farmers
                      .filter((f) => f.name.toLowerCase().includes(farmerSearchInput.toLowerCase()))
                      .map((f) => (
                        <button
                          key={f.name}
                          type="button"
                          onClick={() => { setSelectedFarmer(f.name); setFarmerSearchInput(f.name); setFarmerDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${selectedFarmer === f.name ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-600"}`}
                        >
                          {f.name}
                        </button>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        {farmerRows.length === 0 ? (
          <div className="text-center py-12 text-gray-400">တောင်သူ မရှိသေးပါ</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 text-left font-semibold">တောင်သူအမည်</th>
                  <th className="py-3 px-4 text-right font-semibold">စုစုပေါင်း ရရှိရမည့်ငွေ</th>
                  <th className="py-3 px-4 text-right font-semibold">ပေးချေပြီးငွေ</th>
                  <th className="py-3 px-4 text-right font-semibold">ပေးရန်ကျန်ငွေ</th>
                </tr>
              </thead>
              <tbody>
                {farmerRows.map((farmer) => (
                  <tr key={farmer.name} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{farmer.name}</td>
                    <td className="py-3 px-4 text-right font-semibold">{fmt(farmer.totalPayable)} ကျပ်</td>
                    <td className="py-3 px-4 text-right text-blue-600">{fmt(farmer.totalPaid)} ကျပ်</td>
                    <td className="py-3 px-4 text-right">
                      {farmer.balance > 0 ? <span className="font-bold text-red-600">{fmt(farmer.balance)} ကျပ်</span> : <span className="text-green-600 font-medium">0 ကျပ်</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Recent Invoices — FARMER-FILTERED ── */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600">
            နောက်ဆုံး ဘောင်ချာများ
            {selectedFarmer && <span className="text-xs text-emerald-600 font-normal ml-2">— {selectedFarmer}</span>}
          </h3>
        </div>
        {farmerInvoices.length === 0 ? (
          <div className="text-center py-12 text-gray-400">ဘောင်ချာ မရှိသေးပါ</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 text-left font-semibold">Invoice No</th>
                  <th className="py-3 px-4 text-left font-semibold">ရက်စွဲ</th>
                  <th className="py-3 px-4 text-left font-semibold">တောင်သူ</th>
                  <th className="py-3 px-4 text-right font-semibold">စုစုပေါင်း</th>
                  <th className="py-3 px-4 text-right font-semibold">ပေးပြီး</th>
                  <th className="py-3 px-4 text-right font-semibold">ကျန်</th>
                  <th className="py-3 px-4 text-center font-semibold">အခြေအနေ</th>
                  <th className="py-3 px-4 text-center font-semibold">လုပ်ဆောင်</th>
                </tr>
              </thead>
              <tbody>
                {farmerInvoices.slice(0, 15).map((inv) => {
                  const bal = (inv.summary?.final_amount || 0) - (inv.paid_amount || 0);
                  const isPaid = bal <= 0;
                  return (
                    <tr key={inv.invoice_id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-mono text-xs cursor-pointer" onClick={() => getInvoice(inv.invoice_id).then(setSelectedInvoice)}>{inv.invoice_id.slice(0, 20)}...</td>
                      <td className="py-3 px-4 text-gray-600">{inv.date_formatted}</td>
                      <td className="py-3 px-4 font-medium">{inv.farmer?.name || "-"}</td>
                      <td className="py-3 px-4 text-right font-semibold">{fmt(inv.summary?.final_amount || 0)} ကျပ်</td>
                      <td className="py-3 px-4 text-right text-blue-600">{fmt(inv.paid_amount || 0)} ကျပ်</td>
                      <td className="py-3 px-4 text-right"><span className={bal > 0 ? "text-red-600 font-bold" : "text-green-600"}>{fmt(bal)} ကျပ်</span></td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${isPaid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {isPaid ? "ပေးချေပြီး" : "ပေးရန်ကျန်"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        {bal > 0 ? (
                          <button
                            onClick={() => handleUpdatePaid(inv.invoice_id, inv.summary?.final_amount || 0)}
                            className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-200 transition"
                          >
                            ✅ ပေးပြီး
                          </button>
                        ) : (
                          <span className="text-xs text-green-600 font-medium">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice detail modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8">
          <div className="bg-white rounded-xl shadow-2xl max-w-[850px] w-full mx-4 p-6">
            <InvoiceSlip invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, value, icon, unit, color = "gray", sub }) {
  const cm = { gray: "border-gray-200", red: "border-red-200 bg-red-50", amber: "border-amber-200 bg-amber-50", green: "border-green-200 bg-green-50", blue: "border-blue-200 bg-blue-50", emerald: "border-emerald-200 bg-emerald-50" };
  return (
    <div className={`rounded-xl border ${cm[color]} p-4`}>
      <p className="text-xs text-gray-500 mb-1.5">{title}</p>
      <p className="text-xl font-bold ml-0.5">{value} {unit && <span className="text-xs font-normal text-gray-400">{unit}</span>}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

