export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'ILS', 'JOD', 'EGP'];

export const CURRENCY_NAMES: { [key: string]: string } = {
  USD: 'US Dollar',
  EUR: 'Euro',
  ILS: 'Israeli Shekel',
  NIS: 'Israeli Shekel',
  JOD: 'Jordanian Dinar',
  EGP: 'Egyptian Pound',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan',
};

export function normalizeCurrency(code: string): string {
  if (code === 'NIS') return 'ILS';
  return code;
}

export function denormalizeCurrency(code: string): string {
  if (code === 'ILS') return 'NIS';
  return code;
}

export function getAvailableToCurrencies(fromCurrency: string): string[] {
  return SUPPORTED_CURRENCIES.filter(
    (c) => normalizeCurrency(c) !== normalizeCurrency(fromCurrency)
  );
}
