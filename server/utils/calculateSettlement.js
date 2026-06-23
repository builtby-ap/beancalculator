/**
 * ငွေရှင်းတွက်ချက်ခြင်း — Settlement calculation
 *
 * Calculates the final payable amount to a farmer after deductions.
 *
 * Formulas:
 *   base_amount      = total_viss × price ÷ standard_weight
 *   labor_fee        = per_bag_labor × number_of_bags
 *   bag_cost         = per_bag_cost × number_of_bags
 *   service_fee      = base_amount × service_percentage ÷ 100
 *   other_fees[i]    = per_bag_amount × number_of_bags
 *   total_deductions = labor_fee + bag_cost + service_fee + sum(other_fees)
 *   final_total      = base_amount - total_deductions
 *
 * @param {Object} params
 * @param {number} params.totalViss              - စုစုပေါင်း ပိဿာ
 * @param {number} params.price                  - ဈေးနှုန်း (manual input)
 * @param {number} params.standardWeight         - စံချိန်တန်း အလေးချိန်
 * @param {number} params.numberOfBags           - အိတ်အရေအတွက်
 * @param {number} [params.laborFeePerBag=0]     - အလုပ်ခ (တစ်အိတ်လျှင်)
 * @param {number} [params.bagCostPerBag=0]      - အိတ်ခ (တစ်အိတ်လျှင်)
 * @param {number} [params.serviceFeePercent=0]  - ပွဲခ (ရာခိုင်နှုန်း)
 * @param {Array<{name: string, amountPerBag: number}>} [params.otherFees=[]] - အခြားကုန်ကျစရိတ် (တစ်အိတ်လျှင်)
 */
function calculateSettlement({
  totalViss,
  price,
  standardWeight,
  numberOfBags,
  laborFeePerBag = 0,
  bagCostPerBag = 0,
  serviceFeePercent = 0,
  otherFees = [],
}) {
  const viss = Number(totalViss) || 0;
  const p = Number(price) || 0;
  const sw = Number(standardWeight) || 1;
  const bags = Number(numberOfBags) || 0;
  const laborPerBag = Number(laborFeePerBag) || 0;
  const bagPerBag = Number(bagCostPerBag) || 0;
  const servicePercent = Number(serviceFeePercent) || 0;

  // base_amount = total_viss × price ÷ standard_weight
  const baseAmount = Math.round((viss * p) / sw);

  // Per-bag costs × number of bags
  const laborTotal = laborPerBag * bags;
  const bagTotal = bagPerBag * bags;

  // Service fee = base_amount × percentage ÷ 100
  const serviceTotal = Math.round((baseAmount * servicePercent) / 100);

  // Other fees: each is per-bag × number of bags
  const cleanedOtherFees = (otherFees || [])
    .filter((f) => f && f.name && Number(f.amountPerBag) > 0)
    .map((f) => {
      const perBag = Number(f.amountPerBag);
      return {
        name: f.name,
        amountPerBag: perBag,
        total: perBag * bags,
      };
    });

  const otherFeesTotal = cleanedOtherFees.reduce((sum, f) => sum + f.total, 0);

  const totalDeductions = laborTotal + bagTotal + serviceTotal + otherFeesTotal;
  const finalTotal = baseAmount - totalDeductions;

  return {
    weight: { totalViss: viss },
    pricing: { price: p, standardWeight: sw },
    baseAmount,
    deductions: {
      laborFee: { perBag: laborPerBag, total: laborTotal },
      bagCost: { perBag: bagPerBag, total: bagTotal },
      serviceFee: { percent: servicePercent, total: serviceTotal },
      otherFees: cleanedOtherFees,
      totalDeductions,
    },
    finalTotal,
  };
}

module.exports = { calculateSettlement };
