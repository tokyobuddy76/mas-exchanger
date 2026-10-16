export type CurrencyCategory = 'all' | 'asean' | 'major' | 'east_asia' | 'other';

export interface CurrencyRate {
  code: string;               // e.g. "MYR", "USD", "JPY"
  name: string;               // e.g. "Malaysian Ringgit"
  country: string;            // e.g. "Malaysia"
  flag: string;               // Flag emoji e.g. "🇲🇾"
  symbol: string;             // e.g. "RM", "$", "¥"
  rateToSgd: number;          // Value of 1 unit of foreign currency in SGD (e.g. 1 USD = 1.3325 SGD)
  masQuoteUnit: 1 | 100;      // MAS official quotation convention (e.g. JPY is per 100 units in MAS bulletins)
  change24h: number;          // % change over last 24h (e.g. +0.25)
  high24h: number;            // 24h high in SGD
  low24h: number;             // 24h low in SGD
  history7d: number[];        // 7-day closing rates in SGD
  category: CurrencyCategory;
  isPopular?: boolean;
}

export type SpreadType = 'midmarket' | 'moneychanger' | 'bank' | 'multicard';

export interface SpreadOption {
  id: SpreadType;
  label: string;
  description: string;
  marginPercent: number; // e.g. 0 for midmarket, 0.4 for money changer, 2.0 for credit card, 0.2 for YouTrip/Wise
}

export interface MASConfig {
  apiKey: string;
  endpointUrl: string;
  useLiveApi: boolean;
  lastUpdated: string;
}
