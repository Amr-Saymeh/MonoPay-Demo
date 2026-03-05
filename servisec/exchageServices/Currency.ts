const API_BASE_URL = 'https://api.frankfurter.app';

export async function getCurrencies() {
  try {
    const response = await fetch(`${API_BASE_URL}/currencies`);
    if (!response.ok) {
      throw new Error('Failed to fetch currencies');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching currency names: ', error);
    return {};
  }
}

export async function getLatestRates(baseCurrency: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/latest?from=${baseCurrency}&t=${new Date().getTime()}`);
    if (!response.ok) {
        throw new Error('Failed to fetch latest rates');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching rates data: ', error);
    return null;
  }
}
