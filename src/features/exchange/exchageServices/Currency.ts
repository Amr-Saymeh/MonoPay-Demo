const API_BASE_URL = 'https://open.er-api.com/v6';

const STATIC_CURRENCY_NAMES: { [key: string]: string } = {
  USD: 'US Dollar',
  EUR: 'Euro',
  ILS: 'Israeli New Shekel',
  JOD: 'Jordanian Dinar',
  EGP: 'Egyptian Pound',
};

export async function getCurrencies() {

  return STATIC_CURRENCY_NAMES;
}

export async function getLatestRates(baseCurrency: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/latest/${baseCurrency}`);

    if (!response.ok) {
      throw new Error('Failed to fetch latest rates');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching rates data: ', error);
    return null;
  }
}