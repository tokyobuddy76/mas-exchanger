import React from 'react';
import { Star, TrendingUp, TrendingDown, Calculator, ChevronRight } from 'lucide-react';
import { CurrencyRate } from '../types/currency';
import { Sparkline } from './Sparkline';
import { formatMasQuote } from '../services/currencyService';

interface CurrencyTableProps {
  currencies: CurrencyRate[];
  favorites: string[];
  onToggleFavorite: (code: string) => void;
  onSelectForCalculator: (code: string) => void;
  onViewDetails: (currency: CurrencyRate) => void;
}

export const CurrencyTable: React.FC<CurrencyTableProps> = ({
  currencies,
  favorites,
  onToggleFavorite,
  onSelectForCalculator,
  onViewDetails,
}) => {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/75 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-10 text-center">Fav</th>
              <th className="py-3 px-4">Currency / Country</th>
              <th className="py-3 px-4 text-right">1 SGD =</th>
              <th className="py-3 px-4 text-right">1 Unit in SGD</th>
              <th className="py-3 px-4 text-right hidden sm:table-cell">MAS Official Quote</th>
              <th className="py-3 px-4 text-right">24h Change</th>
              <th className="py-3 px-4 text-center hidden md:table-cell">7D Trend</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-xs">
            {currencies.map((currency) => {
              const isFav = favorites.includes(currency.code);
              const isPositive = currency.change24h >= 0;
              const sgdCrossRate = 1 / currency.rateToSgd;

              return (
                <tr
                  key={currency.code}
                  className="hover:bg-neutral-50/80 transition-colors group cursor-pointer"
                  onClick={() => onViewDetails(currency)}
                >
                  {/* Favorite Toggle */}
                  <td
                    className="py-3 px-4 text-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(currency.code);
                    }}
                  >
                    <button
                      className="p-1 text-neutral-300 hover:text-amber-500 transition-colors cursor-pointer rounded"
                      aria-label={`Favorite ${currency.code}`}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          isFav ? 'fill-amber-400 text-amber-500' : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  </td>

                  {/* Currency Name & Flag */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl select-none">{currency.flag}</span>
                      <div>
                        <div className="font-bold font-mono text-neutral-900 flex items-center gap-1.5">
                          <span>{currency.code}</span>
                          <span className="text-[11px] font-normal text-neutral-400">
                            {currency.country}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate max-w-[140px] sm:max-w-none">
                          {currency.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 1 SGD Cross Rate */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900 tabular-nums">
                    {sgdCrossRate > 1000
                      ? sgdCrossRate.toLocaleString('en-SG', { maximumFractionDigits: 0 })
                      : sgdCrossRate.toFixed(sgdCrossRate < 2 ? 4 : 2)}{' '}
                    <span className="text-[11px] font-normal text-neutral-400">
                      {currency.code}
                    </span>
                  </td>

                  {/* 1 Unit in SGD */}
                  <td className="py-3 px-4 text-right font-mono text-neutral-700 tabular-nums">
                    S$ {currency.rateToSgd.toFixed(currency.rateToSgd < 0.001 ? 6 : 4)}
                  </td>

                  {/* MAS Official Quote standard */}
                  <td className="py-3 px-4 text-right font-mono text-neutral-600 hidden sm:table-cell tabular-nums">
                    {formatMasQuote(currency)}
                  </td>

                  {/* 24h Change */}
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-0.5 font-mono font-medium px-1.5 py-0.5 rounded text-[11px] ${
                        isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>
                        {isPositive ? `+${currency.change24h}%` : `${currency.change24h}%`}
                      </span>
                    </span>
                  </td>

                  {/* 7D Trend */}
                  <td className="py-3 px-4 text-center hidden md:table-cell">
                    <div className="inline-block">
                      <Sparkline
                        data={currency.history7d}
                        isPositive={isPositive}
                        width={80}
                        height={20}
                      />
                    </div>
                  </td>

                  {/* Action buttons */}
                  <td
                    className="py-3 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onSelectForCalculator(currency.code)}
                        className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                        title="Calculate with this currency"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onViewDetails(currency)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                        title="View details"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
