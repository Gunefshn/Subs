const EXCHANGE_API_KEY = process.env.EXPO_PUBLIC_EXCHANGE_API_KEY!;
const BASE_URL = `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}`;

export type Currency = 'TRY' | 'USD' | 'EUR';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
};

export async function fetchRates(): Promise<Record<string, number>> {
  try {
    const response = await fetch(`${BASE_URL}/latest/TRY`);
    const data = await response.json();
    if (data.result === 'success') {
      return data.conversion_rates;
    }
    throw new Error('Kur verisi alınamadı');
  } catch (error) {
    console.error('Exchange rate hatası:', error);
    return { TRY: 1, USD: 0.026, EUR: 0.024 };
  }
}

export function convertCurrency(
  amountInTRY: number,
  targetCurrency: Currency,
  rates: Record<string, number>
): number {
  if (targetCurrency === 'TRY') return amountInTRY;
  const rate = rates[targetCurrency] ?? 1;
  return amountInTRY * rate;
}

export function formatAmount(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  return `${symbol}${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}