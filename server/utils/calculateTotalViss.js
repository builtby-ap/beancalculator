/**
 * ပိဿာ တွက်ချက်ခြင်း utility function
 *
 * Bag-based viss calculation for Myanmar bean trading.
 * No tical system — viss only.
 *
 * Formula: total_viss = (numberOfBags × vissPerBag) + extraViss
 *
 * @param {Object} data
 * @param {number} data.numberOfBags  - အိတ်အရေအတွက်
 * @param {number} data.vissPerBag    - တစ်အိတ်လျှင် ပိဿာ (e.g. 25)
 * @param {number} data.extraViss     - အပို ပိဿာ (leftover, can be 0)
 *
 * @returns {{
 *   totalViss: number,
 *   breakdown: {
 *     bagsViss: number,
 *     extraViss: number,
 *     numberOfBags: number,
 *     vissPerBag: number,
 *   }
 * }}
 */
function calculateTotalViss({ numberOfBags, vissPerBag, extraViss = 0 }) {
  const bags = Number(numberOfBags) || 0;
  const perBag = Number(vissPerBag) || 0;
  const extra = Number(extraViss) || 0;

  const bagsViss = bags * perBag;
  const totalViss = bagsViss + extra;

  return {
    totalViss,
    breakdown: {
      bagsViss,
      extraViss: extra,
      numberOfBags: bags,
      vissPerBag: perBag,
    },
  };
}

module.exports = { calculateTotalViss };
