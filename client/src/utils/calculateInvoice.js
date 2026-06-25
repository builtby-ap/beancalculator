/**
 * ဘောင်ချာ တွက်ချက်ခြင်း — Multi-bean invoice calculation
 *
 * A single invoice can contain multiple bean types.
 * Each bean has its own standardWeight for value calculation.
 * Deductions are per-bag (× total bags), except ပွဲခ which is % of total base amount.
 *
 * Formula per bean row:
 *   total_viss = (viss_per_bag × number_of_bags) + extra_viss
 *   value      = total_viss × price ÷ standard_weight
 *
 * @param {Object} params
 * @param {Array} params.beanRows - Array of bean items
 * @param {Array} params.deductions - Array of deduction entries
 *
 * Bean row: { beanTypeId, beanName, standardWeight, vissPerBag, numberOfBags, extraViss, price }
 * Deduction: { key, label, type: 'per_bag'|'percent', amount }
 */

export function calculateInvoice({ beanRows, deductions }) {
  // Step 1: Calculate each bean row
  const calculatedRows = (beanRows || [])
    .filter((row) => row.beanTypeId && row.numberOfBags && row.vissPerBag && row.price)
    .map((row) => {
      const vissPerBag = Number(row.vissPerBag) || 0;
      const numberOfBags = Number(row.numberOfBags) || 0;
      const extraViss = Number(row.extraViss) || 0;
      const price = Number(row.price) || 0;
      const standardWeight = Number(row.standardWeight) || 1;

      const totalViss = vissPerBag * numberOfBags + extraViss;
      // value = total_viss × price ÷ standard_weight
      const value = Math.round((totalViss * price) / standardWeight);

      return {
        ...row,
        vissPerBag,
        numberOfBags,
        extraViss,
        price,
        standardWeight,
        totalViss,
        value,
      };
    });

  // Step 2: Sum across all bean rows
  const totalBags = calculatedRows.reduce((s, r) => s + r.numberOfBags, 0);
  const totalViss = calculatedRows.reduce((s, r) => s + r.totalViss, 0);
  const totalValue = calculatedRows.reduce((s, r) => s + r.value, 0);

  // Step 3: Calculate deductions
  const calculatedDeductions = (deductions || [])
    .filter((d) => d.amount && Number(d.amount) > 0)
    .map((d) => {
      const amount = Number(d.amount) || 0;
      let total = 0;

      if (d.type === "percent") {
        // ပွဲခ — percentage of total base amount
        total = Math.round((totalValue * amount) / 100);
      } else {
        // per_bag — multiply with total bags
        total = amount * totalBags;
      }

      return {
        key: d.key,
        label: d.label,
        type: d.type,
        amount,
        total,
        formula:
          d.type === "percent"
            ? `${formatNum(totalValue)} × ${amount}%`
            : `${formatNum(amount)} × ${totalBags} အိတ်`,
      };
    });

  const totalDeductions = calculatedDeductions.reduce((s, d) => s + d.total, 0);
  const finalTotal = totalValue - totalDeductions;

  return {
    beanRows: calculatedRows,
    totalBags,
    totalViss,
    totalValue,
    deductions: calculatedDeductions,
    totalDeductions,
    finalTotal,
  };
}

function formatNum(n) {
  return Number(n).toLocaleString("my-MM");
}
