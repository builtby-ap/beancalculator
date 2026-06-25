import { useState } from "react";
import api from "../../api/client";

export default function ChangePasswordForm() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMsg("");

    const errs = {};
    if (!currentPw) errs.currentPw = "လက်ရှိ စကားဝှက် ထည့်ပါ";
    if (!newPw || newPw.length < 6) errs.newPw = "စကားဝှက်အသစ်သည် အနည်းဆုံး အက္ခရာ ၆ လုံး ရှိရပါမည်";
    if (newPw !== confirmPw) errs.confirmPw = "စကားဝှက် နှစ်ခု မတူညီပါ";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await api.put("/auth/change-password", { currentPassword: currentPw, newPassword: newPw });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setMsg("စကားဝှက် ပြောင်းလဲပြီးပါပြီ");
    } catch (err) {
      setMsg("⚠️ " + (err.response?.data?.error || "မအောင်မြင်ပါ"));
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none ${
      errors[field] ? "border-red-300" : "border-gray-300"
    }`;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">စကားဝှက် ပြောင်းလဲရန်</h2>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {msg && (
          <div className={`text-sm rounded-lg px-4 py-2.5 mb-4 ${msg.startsWith("⚠") ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">လက်ရှိ စကားဝှက်</label>
            <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className={inputCls("currentPw")} placeholder="လက်ရှိ စကားဝှက် ထည့်ပါ" />
            {errors.currentPw && <p className="text-xs text-red-500 mt-1">{errors.currentPw}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">စကားဝှက်အသစ်</label>
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className={inputCls("newPw")} placeholder="အနည်းဆုံး ၆ လုံး" />
            {errors.newPw && <p className="text-xs text-red-500 mt-1">{errors.newPw}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">စကားဝှက် အတည်ပြုရန်</label>
            <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className={inputCls("confirmPw")} placeholder="စကားဝှက် ပြန်ရိုက်ပါ" />
            {errors.confirmPw && <p className="text-xs text-red-500 mt-1">{errors.confirmPw}</p>}
          </div>

          <button type="submit" disabled={loading} className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition text-sm font-medium">
            {loading ? "သိမ်းနေသည်..." : "စကားဝှက် ပြောင်းလဲရန်"}
          </button>
        </form>
      </div>
    </div>
  );
}
