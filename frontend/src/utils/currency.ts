/**
 * Format a number as Indian Rupee currency.
 * e.g., 125000 → "₹1,25,000"
 */
export function formatINR(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  // Strip ".00" for whole numbers
  return formatted.replace(/\.00$/, '');
}

/**
 * Format currency in short form for KPI cards.
 * e.g., 125000 → "₹1.25L", 10000000 → "₹1Cr"
 */
export function formatINRShort(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 1_00_00_000) {
    const cr = abs / 1_00_00_000;
    return `${sign}₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2).replace(/\.?0+$/, '')}Cr`;
  }
  if (abs >= 1_00_000) {
    const lakh = abs / 1_00_000;
    return `${sign}₹${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(2).replace(/\.?0+$/, '')}L`;
  }
  if (abs >= 1_000) {
    const k = abs / 1_000;
    return `${sign}₹${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1).replace(/\.?0+$/, '')}K`;
  }
  return `${sign}₹${abs}`;
}

/**
 * Format with sign prefix for INCOME/EXPENSE display.
 * e.g., "+₹85,000" or "-₹45,000"
 */
export function formatSign(amount: number, type: 'INCOME' | 'EXPENSE'): string {
  const prefix = type === 'INCOME' ? '+' : '-';
  return `${prefix}${formatINR(Math.abs(amount))}`;
}
