import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function LoginForm() {
  const { login, error, setError } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const errs = {};
    if (!username.trim()) errs.username = "အသုံးပြုသူအမည် ထည့်ပါ";
    if (!password) errs.password = "စကားဝှက် ထည့်ပါ";
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err.response?.data?.error || "အကောင့်ဝင်ရန် မအောင်မြင်ပါ");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field) =>
    `w-full border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none transition ${
      fieldErrors[field] ? "border-red-300 bg-red-50" : "border-gray-300"
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100 p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">🫘</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">မြန်မာပဲရောင်းဝယ်</h1>
          <p className="text-sm text-gray-500 mt-1">အလေးချိန်နှင့်ငွေတွက်စနစ်</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-lg font-bold text-gray-700 mb-6 text-center">အကောင့်ဝင်ရန်</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">အသုံးပြုသူအမည်</label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setFieldErrors({}); }}
                placeholder="အသုံးပြုသူအမည် ထည့်ပါ"
                autoComplete="username"
                className={inputCls("username")}
              />
              {fieldErrors.username && <p className="text-xs text-red-500 mt-1">{fieldErrors.username}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">စကားဝှက်</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors({}); }}
                  placeholder="စကားဝှက် ထည့်ပါ"
                  autoComplete="current-password"
                  className={inputCls("password") + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
              {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed transition font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  စစ်ဆေးနေသည်...
                </span>
              ) : (
                "အကောင့်ဝင်ရန်"
              )}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-6">
            တစ်ဦးတည်းသုံး စနစ် — Phase 1
          </p>
        </div>
      </div>
    </div>
  );
}
