
export const getCurrencyConfig = () => {
  const locale = navigator.language || 'en-US';
  let currency = 'USD';
  let rate = 1; // Base USD
  
  // Basic mapping for common locales to currencies with Mock Exchange Rates (approx)
  if (locale.startsWith('en-GB') || locale.startsWith('en-UK')) { currency = 'GBP'; rate = 0.79; }
  else if (locale.startsWith('de') || locale.startsWith('fr') || locale.startsWith('es') || locale.startsWith('it') || locale.startsWith('nl')) { currency = 'EUR'; rate = 0.92; }
  else if (locale.startsWith('ja')) { currency = 'JPY'; rate = 150; }
  else if (locale.startsWith('zh')) { currency = 'CNY'; rate = 7.2; }
  else if (locale === 'en-CA') { currency = 'CAD'; rate = 1.35; }
  else if (locale === 'en-AU') { currency = 'AUD'; rate = 1.52; }
  else if (locale.startsWith('ru')) { currency = 'RUB'; rate = 92; }
  else if (locale.startsWith('pt-BR')) { currency = 'BRL'; rate = 5.0; }
  else if (locale.startsWith('in')) { currency = 'INR'; rate = 83; }
  // African Currencies for PayChangu context
  else if (locale === 'en-NG') { currency = 'NGN'; rate = 1600; } // Nigerian Naira
  else if (locale === 'en-KE' || locale === 'sw-KE') { currency = 'KES'; rate = 130; } // Kenyan Shilling
  else if (locale === 'en-GH') { currency = 'GHS'; rate = 13; } // Ghanaian Cedi
  else if (locale === 'en-ZA' || locale === 'af-ZA') { currency = 'ZAR'; rate = 19; } // South African Rand
  
  return { locale, currency, rate };
};

export const formatCurrency = (amount: number, forceCurrency?: string) => {
  const config = getCurrencyConfig();
  const currency = forceCurrency || config.currency;
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const calculateAdCost = (days: number): { amount: number, display: string, currency: string } => {
    const COST_PER_DAY_USD = 3;
    const { rate, currency } = getCurrencyConfig();
    const totalUSD = days * COST_PER_DAY_USD;
    const localAmount = totalUSD * rate;
    
    return {
        amount: localAmount,
        currency: currency,
        display: formatCurrency(localAmount)
    };
};
