const fmt = (n) => Number(n).toLocaleString("my-MM");

export default function InvoiceSummary({ result }) {
  if (!result || result.beanRows.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-600">အကျဉ်းချုပ်</h3>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        {/* Totals */}
        <div className="divide-y divide-gray-200">
          <div className="flex justify-between px-4 py-2.5 text-sm">
            <span className="text-gray-500">စုစုပေါင်း ပိဿာ</span>
            <span className="font-semibold">{fmt(result.totalViss)} ပိဿာ</span>
          </div>
          <div className="flex justify-between px-4 py-2.5 text-sm">
            <span className="text-gray-500">စုစုပေါင်းတန်ဖိုး</span>
            <span className="font-bold text-emerald-700">{fmt(result.totalValue)} ကျပ်</span>
          </div>
        </div>

        {/* Deductions */}
        {result.deductions.length > 0 && (
          <div className="bg-gray-50 px-4 py-2">
            <p className="text-xs font-semibold text-gray-500 mb-2">ဖြတ်တောက်ငွေများ</p>
            <div className="space-y-1.5">
              {result.deductions.map((d, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {d.label}
                    <span className="text-xs text-gray-400 ml-1">({d.formula})</span>
                  </span>
                  <span className="text-red-600">-{fmt(d.total)} ကျပ်</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total deductions */}
        {result.totalDeductions > 0 && (
          <div className="flex justify-between px-4 py-2.5 text-sm bg-red-50 border-t border-red-200">
            <span className="font-semibold text-red-700">စုစုပေါင်း ဖြတ်တောက်ငွေ</span>
            <span className="font-bold text-red-700">{fmt(result.totalDeductions)} ကျပ်</span>
          </div>
        )}

        {/* Final payout */}
        <div className="bg-emerald-50 border-t-2 border-emerald-300 px-4 py-4 text-center">
          <p className="text-xs text-emerald-600 mb-1">တောင်သူရရှိမည့်ငွေ</p>
          <p className="text-2xl font-bold text-emerald-700">
            {fmt(result.finalTotal)} <span className="text-sm">ကျပ်</span>
          </p>
        </div>
      </div>
    </div>
  );
}
