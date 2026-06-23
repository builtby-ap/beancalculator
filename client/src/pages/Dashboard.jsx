import { useState, useEffect } from "react";
import { getSummary, getTransactions } from "../api/client";
import SummaryCard from "../components/SummaryCard";
import TransactionList from "../components/TransactionList";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recentTxns, setRecentTxns] = useState([]);

  const loadData = () => {
    getSummary().then(setSummary);
    getTransactions().then((txns) => setRecentTxns(txns.slice(0, 5)));
  };

  useEffect(loadData, []);

  const formatNumber = (n) => n.toLocaleString("my-MM");

  if (!summary) {
    return <div className="text-center py-12">ခေတ္တ စောင့်ပါ...</div>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">ပင်မစာမျက်နှာ</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="စုစုပေါင်း မှတ်တမ်း"
          value={summary.totalTransactions}
          color="blue"
          icon="📊"
        />
        <SummaryCard
          title="အခြေခံငွေ စုစုပေါင်း"
          value={`${formatNumber(summary.totalBaseAmount)} ကျပ်`}
          color="emerald"
          icon="💰"
        />
        <SummaryCard
          title="နုတ်ယူငွေ စုစုပေါင်း"
          value={`${formatNumber(summary.totalDeductions)} ကျပ်`}
          color="amber"
          icon="📉"
        />
        <SummaryCard
          title="ပေးရမည့်ငွေ စုစုပေါင်း"
          value={`${formatNumber(summary.totalFinalAmount)} ကျပ်`}
          color="blue"
          icon="📋"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryCard
          title="ပေးပြီးငွေ"
          value={`${formatNumber(summary.totalPaid)} ကျပ်`}
          color="emerald"
          icon="✅"
        />
        <SummaryCard
          title="ကျန်ငွေ"
          value={`${formatNumber(summary.totalUnpaid)} ကျပ်`}
          color={summary.totalUnpaid > 0 ? "red" : "emerald"}
          icon="⏳"
        />
      </div>

      {/* Recent transactions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">နောက်ဆုံး မှတ်တမ်းများ</h3>
        <TransactionList transactions={recentTxns} onRefresh={loadData} />
      </div>
    </div>
  );
}
