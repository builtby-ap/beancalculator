import { useState } from "react";
import { addBean, updateBean } from "../api/client";

export default function BeanTypeForm({ editingBean, onSuccess, onCancel }) {
  const [name, setName] = useState(editingBean?.name || "");
  const [standardWeight, setStandardWeight] = useState(editingBean?.standardWeight || "1");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingBean) {
      await updateBean(editingBean.id, { name, standardWeight: Number(standardWeight) });
    } else {
      await addBean({ name, standardWeight: Number(standardWeight) });
    }
    setName("");
    setStandardWeight("1");
    if (onSuccess) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end flex-wrap">
      <div>
        <label className="block text-sm font-medium mb-1">ပဲအမည်</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="ဥပမာ - ပဲတီစိမ်း"
          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          စံချိန်တန်း အလေးချိန် (ပိဿာ)
        </label>
        <input
          type="number"
          value={standardWeight}
          onChange={(e) => setStandardWeight(e.target.value)}
          required
          min="0.1"
          step="0.01"
          placeholder="1"
          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
        />
        <p className="text-xs text-gray-400 mt-1">
          ဈေးနှုန်း တွက်ရာတွင် အသုံးပြုသော စံအလေးချိန်
        </p>
      </div>
      <button
        type="submit"
        className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 transition font-medium"
      >
        {editingBean ? "ပြင်ဆင်ရန်" : "ထည့်ရန်"}
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          ပယ်ဖျက်
        </button>
      )}
    </form>
  );
}
