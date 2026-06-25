import { useEffect, useState } from "react";
import { getBeans } from "../../api/client";

const emptyRow = {
  beanTypeId: "",
  standardWeight: 1,
  vissPerBag: "25",
  numberOfBags: "",
  extraViss: "",
  price: "",
};

export default function BeanTable({ rows, onChange }) {
  const [beans, setBeans] = useState([]);

  useEffect(() => {
    getBeans().then(setBeans);
  }, []);

  const addRow = () => {
    onChange([...rows, { ...emptyRow }]);
  };

  const removeRow = (index) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const updateRow = (index, field, value) => {
    const updated = rows.map((row, i) => {
      if (i !== index) return row;
      const newRow = { ...row, [field]: value };
      // When bean type changes, update standardWeight
      if (field === "beanTypeId") {
        const bean = beans.find((b) => b.id === value);
        newRow.standardWeight = bean?.standardWeight || 1;
      }
      return newRow;
    });
    onChange(updated);
  };

  const fmt = (n) => Number(n).toLocaleString("my-MM");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-600">ပဲစာရင်း</h3>
        <button
          type="button"
          onClick={addRow}
          className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition"
        >
          + ပဲအသစ်ထည့်ရန်
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold w-8">#</th>
              <th className="border border-gray-300 px-2 py-2 text-left text-xs font-semibold">ပဲအမျိုးအစား</th>
              <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold w-24">တစ်အိတ်<br/>ပိဿာ</th>
              <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold w-20">အိတ်</th>
              <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold w-24">အပို<br/>ပိဿာ</th>
              <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold w-28">စုစုပေါင်း<br/>ပိဿာ</th>
              <th className="border border-gray-300 px-2 py-2 text-center text-xs font-semibold w-28">စျေးနှုန်း<br/>(ကျပ်)</th>
              <th className="border border-gray-300 px-2 py-2 text-right text-xs font-semibold w-32">တန်ဖိုး<br/>(ကျပ်)</th>
              <th className="border border-gray-300 px-2 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="border border-gray-300 px-4 py-6 text-center text-gray-400 text-xs">
                  ပဲအသစ်ထည့်ရန် အထက်ပါ ခလုတ်ကို နှိပ်ပါ
                </td>
              </tr>
            ) : (
              rows.map((row, i) => {
                const totalViss =
                  (Number(row.vissPerBag) || 0) * (Number(row.numberOfBags) || 0) +
                  (Number(row.extraViss) || 0);
                const sw = Number(row.standardWeight) || 1;
                // value = total_viss × price ÷ standard_weight
                const value = Math.round((totalViss * (Number(row.price) || 0)) / sw);
                const selectedBean = beans.find((b) => b.id === row.beanTypeId);

                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 py-1.5 text-center text-xs text-gray-400">
                      {i + 1}
                    </td>
                    <td className="border border-gray-300 px-1 py-1.5">
                      <select
                        value={row.beanTypeId}
                        onChange={(e) => updateRow(i, "beanTypeId", e.target.value)}
                        className="w-full border-0 text-sm focus:ring-0 focus:outline-none bg-transparent"
                      >
                        <option value="">-- ရွေးပါ --</option>
                        {beans.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} (စံ: {b.standardWeight})
                          </option>
                        ))}
                      </select>
                      {selectedBean && (
                        <p className="text-[10px] text-gray-400 px-1">
                          စံ: {selectedBean.standardWeight} ပိဿာ
                        </p>
                      )}
                    </td>
                    <td className="border border-gray-300 px-1 py-1.5">
                      <input
                        type="number"
                        value={row.vissPerBag}
                        onChange={(e) => updateRow(i, "vissPerBag", e.target.value)}
                        min="0"
                        step="0.1"
                        className="w-full text-center border-0 text-sm focus:ring-0 focus:outline-none bg-transparent"
                      />
                    </td>
                    <td className="border border-gray-300 px-1 py-1.5">
                      <input
                        type="number"
                        value={row.numberOfBags}
                        onChange={(e) => updateRow(i, "numberOfBags", e.target.value)}
                        min="0"
                        placeholder="0"
                        className="w-full text-center border-0 text-sm focus:ring-0 focus:outline-none bg-transparent"
                      />
                    </td>
                    <td className="border border-gray-300 px-1 py-1.5">
                      <input
                        type="number"
                        value={row.extraViss}
                        onChange={(e) => updateRow(i, "extraViss", e.target.value)}
                        min="0"
                        step="0.1"
                        placeholder="0"
                        className="w-full text-center border-0 text-sm focus:ring-0 focus:outline-none bg-transparent"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 text-center font-medium text-emerald-700">
                      {row.numberOfBags ? fmt(totalViss) : "-"}
                    </td>
                    <td className="border border-gray-300 px-1 py-1.5">
                      <input
                        type="number"
                        value={row.price}
                        onChange={(e) => updateRow(i, "price", e.target.value)}
                        min="0"
                        placeholder="0"
                        className="w-full text-center border-0 text-sm focus:ring-0 focus:outline-none bg-transparent"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 text-right font-bold text-gray-800">
                      {row.numberOfBags && row.price ? (
                        <div>
                          <div>{fmt(value)} ကျပ်</div>
                          <div className="text-[10px] text-gray-400 font-normal">
                            ({fmt(totalViss)} × {fmt(row.price)} ÷ {sw})
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="border border-gray-300 px-1 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(i)}
                        className="text-red-400 hover:text-red-600 text-xs"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
