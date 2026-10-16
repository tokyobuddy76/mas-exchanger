import { CurrencyRate, MASConfig, SpreadType } from '../types/currency';
import { INITIAL_CURRENCIES, SPREAD_OPTIONS } from '../data/currencies';

const FAVORITES_KEY = 'singarate_favorites';
const MAS_CONFIG_KEY = 'singarate_mas_config';
const RATES_CACHE_KEY = 'singarate_rates_cache';

const DEFAULT_FAVORITES = ['MYR', 'JPY', 'USD', 'THB', 'IDR', 'AUD'];

export const DEFAULT_MAS_CONFIG: MASConfig = {
  apiKey: '',
  endpointUrl: 'https://eservices.mas.gov.sg/api/action/datastore/search.json?resource_id=95932927-c4bc-4775-823e-e50e82502b21',
  useLiveApi: false,
  lastUpdated: new Date().toLocaleTimeString('en-SG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  }),
};

export const getStoredFavorites = (): string[] => {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read favorites from localStorage', err);
  }
  return DEFAULT_FAVORITES;
};

export const saveStoredFavorites = (favorites: string[]): void => {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (err) {
    console.error('Failed to save favorites to localStorage', err);
  }
};

export const getStoredMASConfig = (): MASConfig => {
  try {
    const raw = localStorage.getItem(MAS_CONFIG_KEY);
    if (raw) {
      return { ...DEFAULT_MAS_CONFIG, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Failed to read MAS config', err);
  }
  return DEFAULT_MAS_CONFIG;
};

export const saveStoredMASConfig = (config: MASConfig): void => {
  try {
    localStorage.setItem(MAS_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save MAS config', err);
  }
};

export const getStoredRates = (): CurrencyRate[] => {
  try {
    const raw = localStorage.getItem(RATES_CACHE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read cached rates', err);
  }
  return INITIAL_CURRENCIES;
};

export const saveStoredRates = (rates: CurrencyRate[]): void => {
  try {
    localStorage.setItem(RATES_CACHE_KEY, JSON.stringify(rates));
  } catch (err) {
    console.error('Failed to cache rates', err);
  }
};

/**
 * Perform currency conversion considering spread / fees
 * If direction is 'fromSgd': user converts SGD to Foreign Currency (Buying foreign currency)
 * If direction is 'toSgd': user converts Foreign Currency to SGD (Selling foreign currency)
 */
export const calculateConversion = (
  amount: number,
  rateToSgd: number,
  direction: 'fromSgd' | 'toSgd',
  spreadType: SpreadType = 'midmarket'
): {
  result: number;
  effectiveRate: number;
  spreadDifference: number;
} => {
  const spread = SPREAD_OPTIONS.find((s) => s.id === spreadType)?.marginPercent || 0;
  const spreadMultiplier = 1 - spread / 100;

  if (direction === 'fromSgd') {
    // User pays SGD, gets foreign currency
    // Raw midmarket gives amount / rateToSgd
    const midMarketResult = rateToSgd > 0 ? amount / rateToSgd : 0;
    const effectiveRate = rateToSgd > 0 ? (1 / rateToSgd) * spreadMultiplier : 0;
    const result = midMarketResult * spreadMultiplier;
    const spreadDifference = midMarketResult - result;

    return { result, effectiveRate, spreadDifference };
  } else {
    // User pays foreign currency, gets SGD
    // Raw midmarket gives amount * rateToSgd
    const midMarketResult = amount * rateToSgd;
    const effectiveRate = rateToSgd * spreadMultiplier;
    const result = midMarketResult * spreadMultiplier;
    const spreadDifference = midMarketResult - result;

    return { result, effectiveRate, spreadDifference };
  }
};

/**
 * Format currency numbers with appropriate decimal precision
 */
export const formatCurrencyAmount = (num: number, code?: string): string => {
  if (isNaN(num) || !isFinite(num)) return '0.00';

  // For high denomination currencies like IDR, VND, KRW
  if (code && ['IDR', 'VND', 'KRW'].includes(code)) {
    return new Intl.NumberFormat('en-SG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  }

  if (num > 1000) {
    return new Intl.NumberFormat('en-SG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }

  if (num < 0.001) {
    return num.toFixed(6);
  } else if (num < 1) {
    return num.toFixed(4);
  }

  return new Intl.NumberFormat('en-SG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(num);
};

/**
 * Format MAS Rate display standard: e.g. "SGD 30.14 per 100 MYR" or "SGD 1.3325 per 1 USD"
 */
export const formatMasQuote = (rate: CurrencyRate): string => {
  if (rate.masQuoteUnit === 100) {
    const valueFor100 = (rate.rateToSgd * 100).toFixed(rate.code === 'IDR' || rate.code === 'VND' ? 4 : 2);
    return `S$ ${valueFor100} / 100 ${rate.code}`;
  }
  return `S$ ${rate.rateToSgd.toFixed(4)} / 1 ${rate.code}`;
};

/**
 * Simulate live tick or fetch from MAS endpoint if enabled
 */
export const fetchOrSimulateRates = async (
  currentRates: CurrencyRate[],
  config: MASConfig
): Promise<{ rates: CurrencyRate[]; source: 'live' | 'simulation'; timestamp: string }> => {
  const timestamp = new Date().toLocaleTimeString('en-SG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });

  try {
    const res = await fetch('/api/exchangerates');
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'live' && data.records && data.records.length > 0) {
        // Map MAS records to our currency rates if available
        return { rates: currentRates, source: 'live', timestamp };
      }
    }
  } catch (err) {
    // If running in purely static environment or backend is not running yet
  }

  // Realistic micro-market variation (0.01% - 0.08% fluctuation)
  const updatedRates = currentRates.map((c) => {
    // Generate small random jitter between -0.05% and +0.05%
    const jitterPercent = (Math.random() - 0.5) * 0.1;
    const newRate = Number((c.rateToSgd * (1 + jitterPercent / 100)).toFixed(6));
    const newChange = Number((c.change24h + jitterPercent * 2).toFixed(2));
    const newHigh = Math.max(c.high24h, newRate);
    const newLow = Math.min(c.low24h, newRate);

    // Update 7d history last point
    const updatedHistory = [...c.history7d.slice(0, 6), newRate];

    return {
      ...c,
      rateToSgd: newRate,
      change24h: newChange,
      high24h: newHigh,
      low24h: newLow,
      history7d: updatedHistory,
    };
  });

  saveStoredRates(updatedRates);

  return {
    rates: updatedRates,
    source: 'simulation',
    timestamp,
  };
};
