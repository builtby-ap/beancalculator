import { useState, useEffect } from "react";
import api from "../../api/client";

export default function SettingsForm() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get("/auth/settings").then((res) => {
      setSettings(res.data);
      setForm(res.data);
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.put("/auth/settings", form);
      setSettings(res.data);
      setForm(res.data);
      setMsg("ဆက်တင်များ သိမ်းဆည်းပြီးပါပြီ");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg("⚠️ " + (err.response?.data?.error || "မအောင်မြင်ပါ"));
    } finally {
      setLoading(false);
    }
  };

  if (!settings) {
    return <div className="text-center py-12 text-gray-400">ခေတ္တ စောင့်ပါ...</div>;
  }

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">ဆက်တင်များ</h2>

      {/* Business Info */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-600 pb-2 border-b">လုပ်ငန်း အချက်အလက်</h3>

        {msg && (
          <div className={`text-sm rounded-lg px-4 py-2 ${msg.startsWith("⚠") ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
            {msg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500">ကုမ္ပဏီအမည်</label>
            <input type="text" name="company_name" value={form.company_name || ""} onChange={handleChange} className={inputCls + " mt-1"} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">လုပ်ငန်းအမည်</label>
            <input type="text" name="business_name" value={form.business_name || ""} onChange={handleChange} className={inputCls + " mt-1"} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">ပိုင်ရှင်အမည်</label>
            <input type="text" name="owner_name" value={form.owner_name || ""} onChange={handleChange} className={inputCls + " mt-1"} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">ဖုန်းနံပါတ်</label>
            <input type="text" name="phone" value={form.phone || ""} onChange={handleChange} className={inputCls + " mt-1"} />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">လိပ်စာ</label>
          <input type="text" name="address" value={form.address || ""} onChange={handleChange} className={inputCls + " mt-1"} />
        </div>
      </div>

      {/* Invoice Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-600 pb-2 border-b">ဘောင်ချာ ဆက်တင်</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500">ဘောင်ချာ Prefix</label>
            <input type="text" name="invoice_prefix" value={form.invoice_prefix || ""} onChange={handleChange} className={inputCls + " mt-1"} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">ငွေကြေး</label>
            <select name="currency" value={form.currency || "MMK"} onChange={handleChange} className={inputCls + " mt-1"}>
              <option value="MMK">MMK (ကျပ်)</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={loading} className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition font-medium">
        {loading ? "သိမ်းနေသည်..." : "ဆက်တင်များ သိမ်းဆည်းရန်"}
      </button>
    </div>
  );
}
