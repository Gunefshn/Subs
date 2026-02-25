const EXCHANGE_API_KEY = '4f3978839694d35da066a312';
const BASE_URL = `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}`;

export type Currency = 'TRY' | 'USD' | 'EUR';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
};

// Kurları çek — TRY baz alınarak
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
    // Fallback sabit kurlar
    return { TRY: 1, USD: 0.026, EUR: 0.024 };
  }
}

// TRY cinsinden tutarı hedef para birimine çevir
export function convertCurrency(
  amountInTRY: number,
  targetCurrency: Currency,
  rates: Record<string, number>
): number {
  if (targetCurrency === 'TRY') return amountInTRY;
  const rate = rates[targetCurrency] ?? 1;
  return amountInTRY * rate;
}

// Para formatla
export function formatAmount(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  return `${symbol}${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}