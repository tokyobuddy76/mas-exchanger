import React from 'react';
import { Star, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { CurrencyRate } from '../types/currency';

interface WatchlistBannerProps {
  favoriteCurrencies: CurrencyRate[];
  onSelectForCalculator: (code: string) => void;
  onViewDetails: (currency: CurrencyRate) => void;
  onToggleFavorite: (code: string) => void;
}

export const WatchlistBanner: React.FC<WatchlistBannerProps> = ({
  favoriteCurrencies,
  onSelectForCalculator,
  onViewDetails,
  onToggleFavorite,
}) => {
  if (favoriteCurrencies.length === 0) {
    return (
      <div className="bg-neutral-50 rounded-xl border border-dashed border-neutral-300 p-6 text-center text-xs text-neutral-500">
        <Star className="w-5 h-5 mx-auto mb-2 text-neutral-300" />
        <p className="font-semibold text-neutral-700">No favorite currencies saved yet.</p>
        <p className="mt-0.5">Click the star icon on any currency below to pin it to your quick-access watchlist.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {favoriteCurrencies.map((c) => {
        const isPositive = c.change24h >= 0;
        const sgdCross = 1 / c.rateToSgd;

        return (
          <div
            key={c.code}
            className="bg-white rounded-xl border border-neutral-200 p-3 hover:border-neutral-300 transition-all shadow-2xs group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-lg leading-none">{c.flag}</span>
                <span className="font-bold font-mono text-xs text-neutral-900">{c.code}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(c.code);
                }}
                className="text-amber-400 hover:text-amber-600 transition-colors cursor-pointer p-0.5"
                title="Remove from favorites"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400" />
              </button>
            </div>

            <div className="my-2">
              <div className="text-[10px] text-neutral-400 font-medium">1 SGD =</div>
              <div className="text-sm font-bold font-mono tracking-tight text-neutral-900 tabular-nums">
                {sgdCross > 1000
                  ? sgdCross.toLocaleString('en-SG', { maximumFractionDigits: 0 })
                  : sgdCross.toFixed(sgdCross < 2 ? 4 : 2)}
              </div>
              <div
                className={`text-[10px] font-mono font-medium flex items-center gap-0.5 mt-0.5 ${
                  isPositive ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{isPositive ? `+${c.change24h}%` : `${c.change24h}%`}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
              <button
                onClick={() => onSelectForCalculator(c.code)}
                className="font-medium text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
              >
                Convert
              </button>
              <button
                onClick={() => onViewDetails(c)}
                className="text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              >
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
