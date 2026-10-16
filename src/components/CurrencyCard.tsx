import React from 'react';
import { Star, TrendingUp, TrendingDown, Calculator, ArrowRight } from 'lucide-react';
import { CurrencyRate } from '../types/currency';
import { Sparkline } from './Sparkline';
import { formatMasQuote } from '../services/currencyService';

interface CurrencyCardProps {
  currency: CurrencyRate;
  isFavorite: boolean;
  onToggleFavorite: (code: string) => void;
  onSelectForCalculator: (code: string) => void;
  onViewDetails: (currency: CurrencyRate) => void;
}

export const CurrencyCard: React.FC<CurrencyCardProps> = ({
  currency,
  isFavorite,
  onToggleFavorite,
  onSelectForCalculator,
  onViewDetails,
}) => {
  const isPositive = currency.change24h >= 0;
  const sgdCrossRate = 1 / currency.rateToSgd;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:border-neutral-300 transition-all hover:shadow-xs flex flex-col justify-between">
      {/* Header: Flag, Code, Name, Star */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none select-none">{currency.flag}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold font-mono tracking-tight text-neutral-900">
                  {currency.code}
                </span>
                <span className="text-xs text-neutral-400 font-medium">·</span>
                <span className="text-xs text-neutral-500 font-medium">{currency.country}</span>
              </div>
              <div className="text-xs text-neutral-600 line-clamp-1">{currency.name}</div>
            </div>
          </div>

          <button
            onClick={() => onToggleFavorite(currency.code)}
            className="p-1.5 text-neutral-300 hover:text-amber-500 transition-colors cursor-pointer rounded-md hover:bg-neutral-50"
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={`Toggle favorite for ${currency.code}`}
          >
            <Star
              className={`w-4 h-4 ${
                isFavorite ? 'fill-amber-400 text-amber-500' : 'text-neutral-400 hover:text-amber-400'
              }`}
            />
          </button>
        </div>

        {/* Primary Rate & 24h change */}
        <div className="mt-4 mb-3">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <div className="text-xs text-neutral-400 font-medium mb-0.5">1 SGD =</div>
              <div className="text-xl font-bold font-mono tracking-tight text-neutral-900 tabular-nums">
                {sgdCrossRate > 1000
                  ? sgdCrossRate.toLocaleString('en-SG', { maximumFractionDigits: 0 })
                  : sgdCrossRate.toFixed(sgdCrossRate < 2 ? 4 : 2)}{' '}
                <span className="text-xs font-normal text-neutral-500">{currency.code}</span>
              </div>
            </div>

            {/* 24h Change */}
            <div
              className={`flex items-center gap-0.5 text-xs font-mono font-medium px-2 py-0.5 rounded ${
                isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{isPositive ? `+${currency.change24h}%` : `${currency.change24h}%`}</span>
            </div>
          </div>

          {/* Inverse & MAS official quotation line */}
          <div className="mt-2 text-xs text-neutral-500 flex flex-wrap items-center justify-between gap-1 border-t border-neutral-100 pt-2">
            <span className="font-mono">1 {currency.code} = S$ {currency.rateToSgd.toFixed(4)}</span>
            <span className="text-neutral-400 font-mono text-[11px]">
              {formatMasQuote(currency)}
            </span>
          </div>
        </div>

        {/* 7-Day Sparkline mini trend */}
        <div className="my-3 py-2 bg-neutral-50/60 rounded-lg px-3 flex items-center justify-between">
          <span className="text-[11px] text-neutral-400 font-medium">7D Trend</span>
          <Sparkline data={currency.history7d} isPositive={isPositive} width={100} height={24} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-neutral-100 flex items-center gap-2">
        <button
          onClick={() => onSelectForCalculator(currency.code)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 rounded-lg transition-colors cursor-pointer"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Convert</span>
        </button>
        <button
          onClick={() => onViewDetails(currency)}
          className="py-1.5 px-2.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer flex items-center gap-1"
          title="View detailed rate history"
        >
          <span>Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
