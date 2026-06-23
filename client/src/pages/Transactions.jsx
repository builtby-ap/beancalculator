import { useState, useEffect } from "react";
import { getTransactions, getBeans } from "../api/client";
import TransactionList from "../components/TransactionList";
import TransactionForm from "../components/TransactionForm";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [beans, setBeans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filterBean, setFilterBean] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const loadData = () => {
    getTransactions().then(setTransactions);
    getBeans().then(setBeans);
  };

  useEffect(loadData, []);

  const filtered = transactions.filter((t) => {
    if (filterBean && t.beanTypeId !== filterBean) return false;
    if (filterStatus && t.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">အရောင်းအဝယ် မှတ်တမ်း</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition font-medium"
        >
          {showForm ? "ပိတ်ရန်" : "+ အသစ်ထည့်ရန်"}
        </button>
      </div>

      {/* New transaction form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">မှတ်တမ်းသစ်</h3>
          <TransactionForm
            onSuccess={() => {
              loadData();
              setShowForm(false);
            }}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterBean}
          onChange={(e) => setFilterBean(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">ပဲအားလုံး</option>
          {beans.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">အခြေအနေ အားလုံး</option>
          <option value="paid">ပေးပြီး</option>
          <option value="partial">တစ်ပိုင်းတစ်စ</option>
          <option value="unpaid">မပေးရသေး</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <TransactionList transactions={filtered} onRefresh={loadData} />
      </div>
    </div>
  );
}
