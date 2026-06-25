import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";

export default function ProfileCard() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [businessName, setBusinessName] = useState(user?.business_name || "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put("/auth/profile", { name, phone, business_name: businessName });
      await refreshUser();
      setEditing(false);
      setMsg("ပြင်ဆင်ပြီးပါပြီ");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg("⚠️ " + (err.response?.data?.error || "မအောင်မြင်ပါ"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">ကိုယ်ရေး အချက်အလက်</h2>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4 pb-4 border-b">
          <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow">
            {(user?.name || "A")[0]}
          </div>
          <div>
            <p className="text-lg font-bold">{user?.name}</p>
            <p className="text-sm text-gray-500">@{user?.username}</p>
          </div>
        </div>

        {msg && (
          <div className={`text-sm rounded-lg px-4 py-2 ${msg.startsWith("⚠") ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
            {msg}
          </div>
        )}

        {/* Fields */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500">အသုံးပြုသူအမည်</label>
            <p className="text-sm font-medium py-1.5">{user?.username}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">ဖုန်းနံပါတ်</label>
            {editing ? (
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-emerald-400 focus:outline-none" />
            ) : (
              <p className="text-sm py-1.5">{user?.phone || "—"}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">လုပ်ငန်းအမည်</label>
            {editing ? (
              <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-emerald-400 focus:outline-none" />
            ) : (
              <p className="text-sm py-1.5">{user?.business_name || "—"}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-2">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={loading} className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 transition text-sm font-medium">
                {loading ? "သိမ်းနေသည်..." : "သိမ်းဆည်းရန်"}
              </button>
              <button onClick={() => setEditing(false)} className="bg-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300 transition text-sm">
                ပယ်ဖျက်
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="bg-blue-100 text-blue-700 px-5 py-2 rounded-lg hover:bg-blue-200 transition text-sm font-medium">
              ပြင်ဆင်ရန်
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
