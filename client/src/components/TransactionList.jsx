import { useState } from "react";
import { updateTransaction, deleteTransaction } from "../api/client";

const statusLabel = {
  paid: { text: "ပေးပြီး", bg: "bg-green-100 text-green-700" },
  partial: { text: "တစ်ပိုင်းတစ်စ", bg: "bg-amber-100 text-amber-700" },
  unpaid: { text: "မပေးရသေး", bg: "bg-red-100 text-red-700" },
};

export default function TransactionList({ transactions, onRefresh }) {
  const [editingId, setEditingId] = useState(null);
  const [paidInput, setPaidInput] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const formatNumber = (n) => n.toLocaleString("my-MM");

  const startEdit = (txn) => {
    setEditingId(txn.id);
    setPaidInput(String(txn.paidAmount));
  };

  const savePaid = async (id) => {
    await updateTransaction(id, { paidAmount: Number(paidInput) });
    setEditingId(null);
    if (onRefresh) onRefresh();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ဤမှတ်တမ်းကို ဖျက်မှာ သေချာပါသလား?")) return;
    await deleteTransaction(id);
    if (onRefresh) onRefresh();
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        မှတ်တမ်း မရှိသေးပါ
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((txn) => (
        <div key={txn.id} className="bg-white border rounded-lg overflow-hidden">
          {/* Main row */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 items-center text-sm">
            {/* Date + Farmer */}
            <div className="col-span-2">
              <p className="text-xs text-gray-400">
                {new Date(txn.createdAt).toLocaleDateString("my-MM")}
              </p>
              <p className="font-medium">{txn.farmerName}</p>
            </div>

            {/* Bean + Weight */}
            <div className="col-span-3">
              <p className="text-gray-600">{txn.beanName}</p>
              <p className="text-xs text-gray-400">
                {txn.numberOfBags} အိတ် × {txn.vissPerBag} ပိဿာ
                {txn.extraViss > 0 && ` + ${formatNumber(txn.extraViss)} အပို`}
                {" = "}
                <strong>{formatNumber(txn.totalViss)} ပိဿာ</strong>
              </p>
            </div>

            {/* Amount breakdown */}
            <div className="col-span-3 text-right">
              <p className="text-xs text-gray-400">
                အခြေခံ: {formatNumber(txn.baseAmount)} ကျပ်
              </p>
              {txn.deductions.totalDeductions > 0 && (
                <p className="text-xs text-red-500">
                  နုတ်: -{formatNumber(txn.deductions.totalDeductions)} ကျပ်
                </p>
              )}
              <p className="font-bold text-emerald-700">
                {formatNumber(txn.finalTotal)} ကျပ်
              </p>
            </div>

            {/* Paid + Status */}
            <div className="col-span-2 text-right">
              {editingId === txn.id ? (
                <input
                  type="number"
                  value={paidInput}
                  onChange={(e) => setPaidInput(e.target.value)}
                  className="w-full border rounded px-2 py-1 text-right text-xs"
                  autoFocus
                />
              ) : (
                <>
                  <p className="text-xs text-gray-400">
                    ပေးပြီး: {formatNumber(txn.paidAmount)} ကျပ်
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      statusLabel[txn.status].bg
                    }`}
                  >
                    {statusLabel[txn.status].text}
                  </span>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="col-span-2 flex gap-1 justify-end">
              <button
                onClick={() =>
                  setExpandedId(expandedId === txn.id ? null : txn.id)
                }
                className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
              >
                {expandedId === txn.id ? "ပိတ်" : "အသေးစိတ်"}
              </button>
              {editingId === txn.id ? (
                <>
                  <button
                    onClick={() => savePaid(txn.id)}
                    className="text-xs bg-emerald-500 text-white px-2 py-1 rounded hover:bg-emerald-600"
                  >
                    သိမ်း
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs bg-gray-300 px-2 py-1 rounded hover:bg-gray-400"
                  >
                    ပယ်
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => startEdit(txn)}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                  >
                    ပြင်
                  </button>
                  <button
                    onClick={() => handleDelete(txn.id)}
                    className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                  >
                    ဖျက်
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Expanded breakdown */}
          {expandedId === txn.id && (
            <div className="bg-gray-50 px-4 py-3 border-t text-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Weight breakdown */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">အလေးချိန်</p>
                  <p>အိတ်: {txn.numberOfBags} × {txn.vissPerBag} = {formatNumber(txn.bagsViss)} ပိဿာ</p>
                  <p>အပို: {formatNumber(txn.extraViss)} ပိဿာ</p>
                  <p className="font-medium">စုစုပေါင်း: {formatNumber(txn.totalViss)} ပိဿာ</p>
                </div>

                {/* Pricing */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">ဈေးနှုန်း</p>
                  <p>တစ်ပိဿာ: {formatNumber(txn.pricePerViss)} ကျပ်</p>
                  <p className="font-medium">အခြေခံငွေ: {formatNumber(txn.baseAmount)} ကျပ်</p>
                </div>

                {/* Deductions */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">နုတ်ယူငွေ</p>
                  {txn.deductions.laborFee > 0 && (
                    <p>လုပ်သားခ: {formatNumber(txn.deductions.laborFee)} ကျပ်</p>
                  )}
                  {txn.deductions.bagCost > 0 && (
                    <p>အိတ်ခ: {formatNumber(txn.deductions.bagCost)} ကျပ်</p>
                  )}
                  {txn.deductions.serviceFee > 0 && (
                    <p>ဝန်ဆောင်ခ: {formatNumber(txn.deductions.serviceFee)} ကျပ်</p>
                  )}
                  {txn.deductions.otherFees.map((f, i) => (
                    <p key={i}>{f.name}: {formatNumber(f.amount)} ကျပ်</p>
                  ))}
                  <p className="font-medium text-red-600">
                    စုစုပေါင်းနုတ်: {formatNumber(txn.deductions.totalDeductions)} ကျပ်
                  </p>
                </div>

                {/* Final */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">ငွေစာရင်း</p>
                  <p>ပေးရမည့်ငွေ: <strong>{formatNumber(txn.finalTotal)} ကျပ်</strong></p>
                  <p>ပေးပြီးငွေ: {formatNumber(txn.paidAmount)} ကျပ်</p>
                  <p className={`font-medium ${txn.finalTotal - txn.paidAmount > 0 ? "text-red-600" : "text-green-600"}`}>
                    ကျန်ငွေ: {formatNumber(txn.finalTotal - txn.paidAmount)} ကျပ်
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
