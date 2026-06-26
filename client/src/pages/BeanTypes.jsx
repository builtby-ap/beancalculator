import { useState, useEffect } from "react";
import { getBeans, deleteBean } from "../api/client";
import BeanTypeForm from "../components/BeanTypeForm";

export default function BeanTypes() {
  const [beans, setBeans] = useState([]);
  const [editingBean, setEditingBean] = useState(null);

  const loadBeans = () => {
    getBeans().then(setBeans);
    setEditingBean(null);
  };

  useEffect(loadBeans, []);

  const handleDelete = async (id) => {
    if (!window.confirm("ဤပဲအမျိုးအစားကို ဖျက်မှာ သေချာပါသလား?")) return;
    await deleteBean(id);
    loadBeans();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">ပဲအမျိုးအစားများ</h2>

      {/* Add / Edit form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">
          {editingBean ? "ပဲအမျိုးအစား ပြင်ဆင်ရန်" : "ပဲအမျိုးအစား အသစ်ထည့်ရန်"}
        </h3>
        <BeanTypeForm
          key={editingBean?.id || "new"}
          editingBean={editingBean}
          onSuccess={loadBeans}
          onCancel={editingBean ? () => setEditingBean(null) : null}
        />
      </div>

      {/* Bean list */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        {beans.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            ပဲအမျိုးအစား မရှိသေးပါ
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b-2 border-gray-200 text-left">
                  <th className="py-2 px-3">ပဲအမည်</th>
                  <th className="py-2 px-3 text-right">စံချိန်တန်း အလေးချိန် (ပိဿာ)</th>
                  <th className="py-2 px-3">ဖန်တီးသည့်ရက်</th>
                  <th className="py-2 px-3">လုပ်ဆောင်</th>
                </tr>
              </thead>
              <tbody>
                {beans.map((bean) => (
                  <tr key={bean.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium">{bean.name}</td>
                    <td className="py-2 px-3 text-right">{bean.standardWeight}</td>
                    <td className="py-2 px-3 text-xs text-gray-500">
                      {new Date(bean.createdAt).toLocaleDateString("my-MM")}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingBean(bean)}
                          className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                        >
                          ပြင်
                        </button>
                        <button
                          onClick={() => handleDelete(bean.id)}
                          className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                        >
                          ဖျက်
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
