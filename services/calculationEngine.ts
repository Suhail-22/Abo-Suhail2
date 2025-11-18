// services/calculationEngine.ts
export const parseExpression = (expression: string): number => {
  // استبدال الرموز
  const safe = expression
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/%/g, '/100');

  // تقييم التعبير بأمان
  const result = eval(safe);
  if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
    throw new Error('تعبير غير صالح');
  }
  return result;
};

// --- دالة لحساب الضريبة (مخصصة للاستخدام الداخلي) ---
export const calculateTax = (amount: number, rate: number, type: 'addition' | 'discount'): number => {
  if (type === 'addition') {
    return amount * (rate / 100);
  } else if (type === 'discount') {
    return amount * (rate / 100);
  }
  return 0;
};

export const applyTax = (amount: number, taxAmount: number, type: 'addition' | 'discount'): number => {
  if (type === 'addition') {
    return amount + taxAmount;
  } else if (type === 'discount') {
    return amount - taxAmount;
  }
  return amount;
};