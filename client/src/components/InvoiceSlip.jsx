import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const fmt = (n) => Number(n).toLocaleString("my-MM");

export default function InvoiceSlip({ invoice, onClose }) {
  const slipRef = useRef(null);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ဘောင်ချာ - ${invoice.invoice_id}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Myanmar:wght@400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Noto Sans Myanmar', sans-serif; padding: 20px; color: #1a1a1a; }
          .slip { max-width: 800px; margin: 0 auto; border: 2px solid #333; padding: 24px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 16px; margin-bottom: 16px; }
          .header h1 { font-size: 20px; font-weight: 700; }
          .header p { font-size: 12px; color: #666; margin-top: 4px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; font-size: 13px; }
          .info-grid .label { color: #666; }
          .section-title { font-size: 14px; font-weight: 600; background: #f3f4f6; padding: 6px 12px; margin: 16px 0 8px; border-left: 3px solid #333; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          table th { background: #f9fafb; text-align: left; padding: 8px; border: 1px solid #e5e7eb; font-weight: 600; }
          table td { padding: 8px; border: 1px solid #e5e7eb; }
          table td.right { text-align: right; }
          .total-row td { font-weight: 700; background: #f9fafb; }
          .final-box { margin-top: 20px; border: 3px double #333; padding: 16px; text-align: center; }
          .final-box .label { font-size: 14px; color: #666; }
          .final-box .amount { font-size: 28px; font-weight: 700; margin-top: 4px; }
          .final-box .unit { font-size: 16px; }
          .footer { margin-top: 20px; display: flex; justify-content: space-between; font-size: 12px; color: #999; }
          .formula { font-size: 11px; color: #999; margin-top: 4px; }
          @media print { body { padding: 0; } .slip { border: none; } }
        </style>
      </head>
      <body>
        <div class="slip">
          <div class="header">
            <h1>ပဲရောင်းဝယ် ငွေရှင်းစာရင်း</h1>
            <p>ဘောင်ချာ: ${invoice.invoice_id}</p>
          </div>

          <div class="info-grid">
            <div><span class="label">${invoice.farmer.label}:</span> ${invoice.farmer.name}</div>
            <div><span class="label">${invoice.bean.label}:</span> ${invoice.bean.name}</div>
            <div><span class="label">ရက်စွဲ:</span> ${invoice.date_formatted}</div>
            <div><span class="label">${invoice.bean.standard_weight_label}:</span> ${invoice.bean.standard_weight} ပိဿာ</div>
          </div>

          <div class="section-title">${invoice.weight.label}</div>
          <table>
            <tr><th>အမျိုးအစား</th><th style="text-align:right">ပမာဏ</th></tr>
            <tr><td>${invoice.weight.total_bags_label}</td><td class="right">${invoice.weight.total_bags} အိတ်</td></tr>
            <tr><td>${invoice.weight.viss_per_bag_label}</td><td class="right">${invoice.weight.viss_per_bag} ပိဿာ</td></tr>
            <tr><td>${invoice.weight.bags_viss_label}</td><td class="right">${fmt(invoice.weight.bags_viss)} ပိဿာ</td></tr>
            <tr><td>${invoice.weight.extra_viss_label}</td><td class="right">${fmt(invoice.weight.extra_viss)} ပိဿာ</td></tr>
            <tr class="total-row"><td>${invoice.weight.total_viss_label}</td><td class="right">${fmt(invoice.weight.total_viss)} ပိဿာ</td></tr>
          </table>

          <div class="section-title">ငွေတွက်</div>
          <table>
            <tr><td>${invoice.pricing.price_label}</td><td class="right">${fmt(invoice.pricing.price)} ကျပ်</td></tr>
            <tr><td>${invoice.pricing.standard_weight_label}</td><td class="right">${invoice.pricing.standard_weight} ပိဿာ</td></tr>
            <tr class="total-row"><td>${invoice.pricing.base_amount_label}</td><td class="right">${fmt(invoice.pricing.base_amount)} ကျပ်</td></tr>
          </table>
          <p class="formula">တွက်ချက်ပုံ: ${invoice.pricing.formula} = ${fmt(invoice.pricing.base_amount)} ကျပ်</p>

          ${invoice.deductions.items.length > 0 ? `
          <div class="section-title">${invoice.deductions.label}</div>
          <table>
            <tr><th>အမျိုးအစား</th><th style="text-align:right">ကျပ်</th></tr>
            ${invoice.deductions.items.map(item => `<tr><td>${item.label}</td><td class="right">${fmt(item.amount)}</td></tr>`).join("")}
            <tr class="total-row"><td>${invoice.deductions.total_label}</td><td class="right">${fmt(invoice.deductions.total)} ကျပ်</td></tr>
          </table>` : ""}

          <div class="final-box">
            <div class="label">${invoice.summary.final_amount_label}</div>
            <div class="amount">${fmt(invoice.summary.final_amount)} <span class="unit">ကျပ်</span></div>
          </div>

          <div class="footer">
            <span>ဘောင်ချာ: ${invoice.invoice_id}</span>
            <span>ထုတ်ယူသည့်ရက်: ${new Date().toLocaleDateString("my-MM")}</span>
          </div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadPDF = async () => {
    if (!slipRef.current) return;

    const canvas = await html2canvas(slipRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`invoice-${invoice.invoice_id}.pdf`);
  };

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex gap-3 justify-between items-center no-print">
        <h3 className="text-lg font-bold">ဘောင်ချာ</h3>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm font-medium"
          >
            🖨️ Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium"
          >
            📄 Download PDF
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm"
            >
              ပိတ်
            </button>
          )}
        </div>
      </div>

      {/* ── Invoice Slip ── */}
      <div ref={slipRef} className="bg-white border-2 border-gray-800 p-6 max-w-[800px] mx-auto">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
          <h1 className="text-xl font-bold tracking-wide">ပဲရောင်းဝယ် ငွေရှင်းစာရင်း</h1>
          <p className="text-xs text-gray-500 mt-1">ဘောင်ချာ: {invoice.invoice_id}</p>
        </div>

        {/* Info row */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm mb-4">
          <div><span className="text-gray-500">{invoice.farmer.label}:</span> <span className="font-semibold">{invoice.farmer.name}</span></div>
          <div><span className="text-gray-500">{invoice.bean.label}:</span> <span className="font-semibold">{invoice.bean.name}</span></div>
          <div><span className="text-gray-500">ရက်စွဲ:</span> <span className="font-semibold">{invoice.date_formatted}</span></div>
          <div><span className="text-gray-500">{invoice.bean.standard_weight_label}:</span> <span className="font-semibold">{invoice.bean.standard_weight} ပိဿာ</span></div>
        </div>

        {/* Section: Weight */}
        <div className="bg-gray-100 px-3 py-1.5 text-sm font-semibold border-l-4 border-gray-800 mb-2">
          {invoice.weight.label}
        </div>
        <table className="w-full text-sm mb-1">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 text-gray-600">{invoice.weight.total_bags_label}</td>
              <td className="py-1.5 text-right font-medium">{invoice.weight.total_bags} အိတ်</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 text-gray-600">{invoice.weight.viss_per_bag_label}</td>
              <td className="py-1.5 text-right font-medium">{invoice.weight.viss_per_bag} ပိဿာ</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 text-gray-600">{invoice.weight.bags_viss_label}</td>
              <td className="py-1.5 text-right font-medium">{fmt(invoice.weight.bags_viss)} ပိဿာ</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 text-gray-600">{invoice.weight.extra_viss_label}</td>
              <td className="py-1.5 text-right font-medium">{fmt(invoice.weight.extra_viss)} ပိဿာ</td>
            </tr>
            <tr className="bg-emerald-50">
              <td className="py-2 font-bold">{invoice.weight.total_viss_label}</td>
              <td className="py-2 text-right font-bold text-emerald-700 text-base">{fmt(invoice.weight.total_viss)} ပိဿာ</td>
            </tr>
          </tbody>
        </table>

        {/* Section: Pricing */}
        <div className="bg-gray-100 px-3 py-1.5 text-sm font-semibold border-l-4 border-gray-800 mb-2 mt-4">
          ငွေတွက်
        </div>
        <table className="w-full text-sm mb-1">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 text-gray-600">{invoice.pricing.price_label}</td>
              <td className="py-1.5 text-right font-medium">{fmt(invoice.pricing.price)} ကျပ်</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 text-gray-600">{invoice.pricing.standard_weight_label}</td>
              <td className="py-1.5 text-right font-medium">{invoice.pricing.standard_weight} ပိဿာ</td>
            </tr>
            <tr className="bg-blue-50">
              <td className="py-2 font-bold">{invoice.pricing.base_amount_label}</td>
              <td className="py-2 text-right font-bold text-blue-700 text-base">{fmt(invoice.pricing.base_amount)} ကျပ်</td>
            </tr>
          </tbody>
        </table>
        <p className="text-xs text-gray-400 mb-4">တွက်ချက်ပုံ: {invoice.pricing.formula} = {fmt(invoice.pricing.base_amount)} ကျပ်</p>

        {/* Section: Deductions */}
        {invoice.deductions.items.length > 0 && (
          <>
            <div className="bg-gray-100 px-3 py-1.5 text-sm font-semibold border-l-4 border-gray-800 mb-2">
              {invoice.deductions.label}
            </div>
            <table className="w-full text-sm mb-1">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="py-1.5 text-left text-gray-600 font-semibold">အမျိုးအစား</th>
                  <th className="py-1.5 text-right text-gray-600 font-semibold">ကျပ်</th>
                </tr>
              </thead>
              <tbody>
                {invoice.deductions.items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="py-1.5 text-gray-600">{item.label}</td>
                    <td className="py-1.5 text-right font-medium">{fmt(item.amount)}</td>
                  </tr>
                ))}
                <tr className="bg-red-50">
                  <td className="py-2 font-bold">{invoice.deductions.total_label}</td>
                  <td className="py-2 text-right font-bold text-red-600 text-base">{fmt(invoice.deductions.total)} ကျပ်</td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {/* Summary line */}
        <div className="border-t-2 border-gray-300 mt-4 pt-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">{invoice.summary.base_amount_label}</span>
            <span className="font-medium">{fmt(invoice.summary.base_amount)} ကျပ်</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{invoice.summary.total_deductions_label}</span>
            <span className="font-medium text-red-600">-{fmt(invoice.summary.total_deductions)} ကျပ်</span>
          </div>
        </div>

        {/* ── Final Payout ── */}
        <div className="mt-5 border-4 border-double border-gray-800 p-5 text-center">
          <p className="text-sm text-gray-500 mb-1">{invoice.summary.final_amount_label}</p>
          <p className="text-3xl font-bold">
            {fmt(invoice.summary.final_total || invoice.summary.final_amount)}
          </p>
          <p className="text-lg font-semibold mt-1">ကျပ်</p>
        </div>

        {/* Footer */}
        <div className="flex justify-between mt-5 text-xs text-gray-400 border-t border-gray-200 pt-3">
          <span>ဘောင်ချာ: {invoice.invoice_id}</span>
          <span>ထုတ်ယူသည့်ရက်: {new Date().toLocaleDateString("my-MM")}</span>
        </div>
      </div>
    </div>
  );
}
