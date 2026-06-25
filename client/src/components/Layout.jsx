import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { path: "/", label: "ပင်မစာမျက်နှာ", icon: "🏠" },
  { path: "/new-invoice", label: "ငွေရှင်းစာရင်း", icon: "🧾" },
  { path: "/calculator", label: "တွက်ချက်စနစ်", icon: "🧮" },
  { path: "/invoices", label: "မှတ်တမ်းများ", icon: "📑" },
  { path: "/beans", label: "ပဲအမျိုးအစားများ", icon: "🫘" },
];

export default function Layout({ children }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 bg-emerald-800 text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-emerald-700">
          <h1 className="text-base font-bold leading-tight">မြန်မာပဲရောင်းဝယ်</h1>
          <p className="text-[11px] text-emerald-300 mt-1">အလေးချိန်နှင့်ငွေတွက်စနစ်</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                isActive(item.path)
                  ? "bg-emerald-600 font-semibold"
                  : "hover:bg-emerald-700"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 text-[11px] text-emerald-400 border-t border-emerald-700">
          v1.0.0 — Phase 1
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-end shrink-0">
          {user && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 hover:bg-gray-50 rounded-lg px-3 py-1.5 transition"
              >
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {(user.name || "A")[0]}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700 leading-tight">{user.name}</p>
                  <p className="text-[11px] text-gray-400">{user.business_name}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-20 py-1">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-gray-400">@{user.username}</p>
                    </div>
                    <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      👤 ကိုယ်ရေး အချက်အလက်
                    </Link>
                    <Link to="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      ⚙️ ဆက်တင်များ
                    </Link>
                    <Link to="/change-password" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      🔒 စကားဝှက် ပြောင်းရန်
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                        🚪 ထွက်ရန်
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto bg-gray-100/50">
          {children}
        </main>
      </div>
    </div>
  );
}
