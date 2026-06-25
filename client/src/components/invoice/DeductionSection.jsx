/**
 * ဖြတ်တောက်ငွေ ကဏ္ဍ
 *
 * Fixed deductions:
 * - လုပ်သားခ (per bag)
 * - ပွဲခ (percent of total value)
 * - ကားခ (per bag)
 *
 * Custom deductions: dynamic add/remove, per bag
 */

const FIXED_DEDUCTIONS = [
  { key: "labor", label: "လုပ်သားခ", type: "per_bag", placeholder: "တစ်အိတ်လျှင် ကျပ်" },
  { key: "service", label: "ပွဲခ", type: "percent", placeholder: "ရာခိုင်နှုန်း" },
  { key: "transport", label: "ကားခ", type: "per_bag", placeholder: "တစ်အိတ်လျှင် ကျပ်" },
];

export default function DeductionSection({ deductions, customDeductions, onDeductionChange, onCustomChange }) {
  const handleFixedChange = (key, value) => {
    onDeductionChange({ ...deductions, [key]: value });
  };

  const addCustom = () => {
    onCustomChange([...customDeductions, { label: "", amount: "" }]);
  };

  const removeCustom = (index) => {
    onCustomChange(customDeductions.filter((_, i) => i !== index));
  };

  const updateCustom = (index, field, value) => {
    const updated = customDeductions.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    onCustomChange(updated);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-600">ဖြတ်တောက်ငွေများ</h3>

      {/* Fixed deductions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {FIXED_DEDUCTIONS.map((d) => (
          <div key={d.key}>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {d.label}
              <span className="text-gray-400 ml-1">
                ({d.type === "percent" ? "% ဖြင့် ထည့်ပါ" : "တစ်အိတ်လျှင် ထည့်ပါ"})
              </span>
            </label>
            <input
              type="number"
              value={deductions[d.key] || ""}
              onChange={(e) => handleFixedChange(d.key, e.target.value)}
              min="0"
              step={d.type === "percent" ? "0.1" : "1"}
              placeholder={d.placeholder}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none"
            />
          </div>
        ))}
      </div>

      {/* Custom deductions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-500">အခြားဖြတ်တောက်ငွေများ (တစ်အိတ်လျှင်)</label>
          <button
            type="button"
            onClick={addCustom}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition"
          >
            + ထည့်ရန်
          </button>
        </div>

        {customDeductions.length === 0 ? (
          <p className="text-xs text-gray-400">အခြားဖြတ်တောက်ငွေ မရှိပါ</p>
        ) : (
          <div className="space-y-2">
            {customDeductions.map((row, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={row.label}
                  onChange={(e) => updateCustom(i, "label", e.target.value)}
                  placeholder="အမည် (ဥပမာ — သယ်ယူစရိတ်)"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                />
                <input
                  type="number"
                  value={row.amount}
                  onChange={(e) => updateCustom(i, "amount", e.target.value)}
                  min="0"
                  placeholder="တစ်အိတ်လျှင် ကျပ်"
                  className="w-40 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeCustom(i)}
                  className="text-red-400 hover:text-red-600 px-2 py-2 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
