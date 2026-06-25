import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const fmt = (n) => Number(n).toLocaleString("my-MM");

export default function InvoicePrintView({ invoiceNo, date, farmerName, result, onClose }) {
  const slipRef = useRef(null);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ဘောင်ချာ - ${invoiceNo}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Myanmar:wght@400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Noto Sans Myanmar', sans-serif; padding: 24px; color: #1a1a1a; font-size: 13px; }
          .slip { max-width: 800px; margin: 0 auto; border: 2px solid #333; padding: 24px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 16px; }
          .header h1 { font-size: 18px; font-weight: 700; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          th, td { border: 1px solid #999; padding: 6px 8px; font-size: 12px; }
          th { background: #f3f4f6; text-align: center; font-weight: 600; }
          .right { text-align: right; }
          .center { text-align: center; }
          .section-title { font-size: 13px; font-weight: 600; background: #f3f4f6; padding: 4px 8px; margin: 12px 0 6px; border-left: 3px solid #333; }
          .summary-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
          .final-box { margin-top: 16px; border: 3px double #333; padding: 12px; text-align: center; }
          .final-box .amount { font-size: 26px; font-weight: 700; }
          .footer { margin-top: 16px; display: flex; justify-content: space-between; font-size: 11px; color: #999; }
          .line { border-top: 1px dashed #ccc; margin: 4px 0; }
          @media print { body { padding: 0; } .slip { border: none; } }
        </style>
      </head>
      <body>
        <div class="slip">
          <div class="header">
            <h1>ငွေရှင်းစာရင်း</h1>
          </div>

          <div class="info-row">
            <span>တောင်သူအမည်: <strong>${farmerName}</strong></span>
            <span>ရက်စွဲ: <strong>${date}</strong></span>
            <span>Invoice No: <strong>${invoiceNo}</strong></span>
          </div>

          <div class="section-title">ပဲစာရင်း</div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>ပဲအမျိုးအစား</th>
                <th>တစ်အိတ်<br/>ပိဿာ</th>
                <th>အိတ်</th>
                <th>အပို<br/>ပိဿာ</th>
                <th>စုစုပေါင်း<br/>ပိဿာ</th>
                <th>စျေးနှုန်း</th>
                <th>တန်ဖိုး</th>
              </tr>
            </thead>
            <tbody>
              ${result.beanRows.map((row, i) => `
                <tr>
                  <td class="center">${i + 1}</td>
                  <td>${row.beanName || ""}</td>
                  <td class="center">${row.vissPerBag}</td>
                  <td class="center">${row.numberOfBags}</td>
                  <td class="center">${row.extraViss}</td>
                  <td class="right">${fmt(row.totalViss)}</td>
                  <td class="right">${fmt(row.price)}</td>
                  <td class="right">${fmt(row.value)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="section-title">အကျဉ်းချုပ်</div>
          <div class="summary-row"><span>စုစုပေါင်း ပိဿာ</span><span><strong>${fmt(result.totalViss)} ပိဿာ</strong></span></div>
          <div class="summary-row"><span>စုစုပေါင်းတန်ဖိုး</span><span><strong>${fmt(result.totalValue)} ကျပ်</strong></span></div>

          ${result.deductions.length > 0 ? `
          <div class="section-title">ဖြတ်တောက်ငွေများ</div>
          ${result.deductions.map(d => `
            <div class="summary-row"><span>${d.label} (${d.formula})</span><span>-${fmt(d.total)} ကျပ်</span></div>
          `).join("")}
          <div class="line"></div>
          <div class="summary-row" style="font-weight:700;color:#b91c1c;"><span>စုစုပေါင်း ဖြတ်တောက်ငွေ</span><span>${fmt(result.totalDeductions)} ကျပ်</span></div>
          ` : ""}

          <div class="final-box">
            <div style="font-size:13px;color:#666;">တောင်သူရရှိမည့်ငွေ</div>
            <div class="amount">${fmt(result.finalTotal)} <span style="font-size:14px;">ကျပ်</span></div>
          </div>

          <div class="footer">
            <span>Invoice No: ${invoiceNo}</span>
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
    const canvas = await html2canvas(slipRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`invoice-${invoiceNo}.pdf`);
  };

  return (
    <div className="space-y-4">
      {/* Buttons */}
      <div className="flex gap-3 justify-between items-center">
        <h3 className="text-lg font-bold">ကြိုတင်ကြည့်ရှု</h3>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm font-medium">
            🖨️ Print
          </button>
          <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium">
            📄 PDF
          </button>
          {onClose && (
            <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm">
              ပိတ်
            </button>
          )}
        </div>
      </div>

      {/* Printable slip */}
      <div ref={slipRef} className="bg-white border-2 border-gray-800 p-6 max-w-[800px] mx-auto">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-800 pb-3 mb-4">
          <h1 className="text-xl font-bold">ငွေရှင်းစာရင်း</h1>
        </div>

        {/* Info */}
        <div className="flex justify-between text-sm mb-4">
          <div><span className="text-gray-500">တောင်သူအမည်:</span> <span className="font-semibold">{farmerName}</span></div>
          <div><span className="text-gray-500">ရက်စွဲ:</span> <span className="font-semibold">{date}</span></div>
          <div><span className="text-gray-500">Invoice No:</span> <span className="font-semibold">{invoiceNo}</span></div>
        </div>

        {/* Bean table */}
        <div className="bg-gray-100 px-3 py-1.5 text-sm font-semibold border-l-4 border-gray-800 mb-2">
          ပဲစာရင်း
        </div>
        <table className="w-full text-sm mb-4 border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 px-2 py-1.5 text-xs">#</th>
              <th className="border border-gray-400 px-2 py-1.5 text-xs">ပဲအမျိုးအစား</th>
              <th className="border border-gray-400 px-2 py-1.5 text-xs">တစ်အိတ်<br/>ပိဿာ</th>
              <th className="border border-gray-400 px-2 py-1.5 text-xs">အိတ်</th>
              <th className="border border-gray-400 px-2 py-1.5 text-xs">အပို<br/>ပိဿာ</th>
              <th className="border border-gray-400 px-2 py-1.5 text-xs">စုစုပေါင်း<br/>ပိဿာ</th>
              <th className="border border-gray-400 px-2 py-1.5 text-xs">စျေးနှုန်း</th>
              <th className="border border-gray-400 px-2 py-1.5 text-xs">တန်ဖိုး</th>
            </tr>
          </thead>
          <tbody>
            {result.beanRows.map((row, i) => (
              <tr key={i}>
                <td className="border border-gray-300 px-2 py-1.5 text-center text-xs">{i + 1}</td>
                <td className="border border-gray-300 px-2 py-1.5">{row.beanName || ""}</td>
                <td className="border border-gray-300 px-2 py-1.5 text-center">{row.vissPerBag}</td>
                <td className="border border-gray-300 px-2 py-1.5 text-center">{row.numberOfBags}</td>
                <td className="border border-gray-300 px-2 py-1.5 text-center">{row.extraViss}</td>
                <td className="border border-gray-300 px-2 py-1.5 text-right font-medium">{fmt(row.totalViss)}</td>
                <td className="border border-gray-300 px-2 py-1.5 text-right">{fmt(row.price)}</td>
                <td className="border border-gray-300 px-2 py-1.5 text-right font-bold">{fmt(row.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="bg-gray-100 px-3 py-1.5 text-sm font-semibold border-l-4 border-gray-800 mb-2">
          အကျဉ်းချုပ်
        </div>
        <div className="space-y-1 text-sm mb-2">
          <div className="flex justify-between"><span className="text-gray-500">စုစုပေါင်း ပိဿာ</span><span className="font-semibold">{fmt(result.totalViss)} ပိဿာ</span></div>
          <div className="flex justify-between"><span className="text-gray-500">စုစုပေါင်းတန်ဖိုး</span><span className="font-bold text-emerald-700">{fmt(result.totalValue)} ကျပ်</span></div>
        </div>

        {result.deductions.length > 0 && (
          <>
            <div className="bg-gray-100 px-3 py-1.5 text-sm font-semibold border-l-4 border-gray-800 mb-2">
              ဖြတ်တောက်ငွေများ
            </div>
            {result.deductions.map((d, i) => (
              <div key={i} className="flex justify-between text-sm py-1">
                <span className="text-gray-500">{d.label} <span className="text-xs text-gray-400">({d.formula})</span></span>
                <span className="text-red-600">-{fmt(d.total)} ကျပ်</span>
              </div>
            ))}
            <div className="border-t border-gray-300 mt-1 pt-1">
              <div className="flex justify-between text-sm font-bold text-red-700">
                <span>စုစုပေါင်း ဖြတ်တောက်ငွေ</span>
                <span>{fmt(result.totalDeductions)} ကျပ်</span>
              </div>
            </div>
          </>
        )}

        {/* Final */}
        <div className="mt-4 border-4 border-double border-gray-800 p-4 text-center">
          <p className="text-sm text-gray-500 mb-1">တောင်သူရရှိမည့်ငွေ</p>
          <p className="text-3xl font-bold">{fmt(result.finalTotal)}</p>
          <p className="text-base font-semibold mt-1">ကျပ်</p>
        </div>

        {/* Footer */}
        <div className="flex justify-between mt-4 text-xs text-gray-400 border-t border-gray-200 pt-3">
          <span>Invoice No: {invoiceNo}</span>
          <span>ထုတ်ယူသည့်ရက်: {new Date().toLocaleDateString("my-MM")}</span>
        </div>
      </div>
    </div>
  );
}
