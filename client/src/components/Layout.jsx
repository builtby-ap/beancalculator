import { Link, useLocation } from "react-router-dom";

const navItems = [
  { path: "/", label: "ပင်မစာမျက်နှာ", icon: "🏠" },
  { path: "/calculator", label: "တွက်ချက်စနစ်", icon: "🧮" },
  { path: "/invoices", label: "မှတ်တမ်းများ", icon: "📑" },
  { path: "/transactions", label: "အရောင်းအဝယ် မှတ်တမ်း", icon: "📋" },
  { path: "/beans", label: "ပဲအမျိုးအစားများ", icon: "🫘" },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-emerald-800 text-white flex flex-col">
        <div className="p-5 border-b border-emerald-700">
          <h1 className="text-lg font-bold leading-tight">
            မြန်မာပဲရောင်းဝယ်
          </h1>
          <p className="text-xs text-emerald-300 mt-1">
            အလေးချိန်နှင့်ငွေတွက်စနစ်
          </p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                location.pathname === item.path
                  ? "bg-emerald-600 font-semibold"
                  : "hover:bg-emerald-700"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 text-xs text-emerald-400 border-t border-emerald-700">
          v1.0.0
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
