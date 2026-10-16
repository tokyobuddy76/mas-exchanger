import React, { useState, useId } from 'react';
import { ArrowUpDown, Star, ChevronDown, Check, Info, ShieldAlert, Sparkles, Copy } from 'lucide-react';
import { CurrencyRate, SpreadType } from '../types/currency';
import { SPREAD_OPTIONS, POPULAR_TRAVEL_DENOMINATIONS } from '../data/currencies';
import { calculateConversion, formatCurrencyAmount, formatMasQuote } from '../services/currencyService';

interface CurrencyCalculatorProps {
  currencies: CurrencyRate[];
  selectedCode: string;
  onSelectCurrency: (code: string) => void;
  favorites: string[];
  onToggleFavorite: (code: string) => void;
  onViewDetails: (currency: CurrencyRate) => void;
}

export const CurrencyCalculator: React.FC<CurrencyCalculatorProps> = ({
  currencies,
  selectedCode,
  onSelectCurrency,
  favorites,
  onToggleFavorite,
  onViewDetails,
}) => {
  const [amount, setAmount] = useState<string>('1000');
  const [direction, setDirection] = useState<'fromSgd' | 'toSgd'>('fromSgd');
  const [spreadType, setSpreadType] = useState<SpreadType>('midmarket');
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [selectorSearch, setSelectorSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const dropdownSearchInputId = useId();

  const selectedCurrency = currencies.find((c) => c.code === selectedCode) || currencies[0];
  const isFav = favorites.includes(selectedCurrency.code);

  const numericAmount = parseFloat(amount.replace(/,/g, '')) || 0;

  const conversion = calculateConversion(
    numericAmount,
    selectedCurrency.rateToSgd,
    direction,
    spreadType
  );

  const handleSwap = () => {
    setDirection((prev) => (prev === 'fromSgd' ? 'toSgd' : 'fromSgd'));
  };

  const handleCopy = () => {
    const textToCopy = `${formatCurrencyAmount(conversion.result, direction === 'fromSgd' ? selectedCurrency.code : 'SGD')} ${
      direction === 'fromSgd' ? selectedCurrency.code : 'SGD'
    }`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredCurrencies = currencies.filter(
    (c) =>
      c.code.toLowerCase().includes(selectorSearch.toLowerCase()) ||
      c.name.toLowerCase().includes(selectorSearch.toLowerCase()) ||
      c.country.toLowerCase().includes(selectorSearch.toLowerCase())
  );

  const quickPresets = [100, 500, 1000, 2500, 5000];

  // Banknote denominations preview
  const denominations = POPULAR_TRAVEL_DENOMINATIONS[selectedCurrency.code];
  const primaryDenom = denominations ? denominations[denominations.length - 1] : null;
  const denomCount = primaryDenom && conversion.result > 0 ? Math.floor(conversion.result / primaryDenom) : 0;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-6 md:p-8">
      {/* Top Banner / Currency Selector Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-100">
        <div>
          <span className="text-xs font-semibold text-neutral-400 tracking-wider uppercase">
            Currency Calculator
          </span>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Singapore Dollar (SGD) &nbsp;⇄&nbsp; {selectedCurrency.name}
          </h2>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
            <span>MAS Official Quotation:</span>
            <span className="font-mono font-medium text-neutral-800">
              {formatMasQuote(selectedCurrency)}
            </span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => onViewDetails(selectedCurrency)}
              className="text-rose-600 hover:text-rose-700 underline font-medium cursor-pointer"
            >
              View 7-day trend
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleFavorite(selectedCurrency.code)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              isFav
                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-500' : 'text-neutral-400'}`} />
            <span>{isFav ? 'Favorited' : 'Favorite'}</span>
          </button>
        </div>
      </div>

      {/* Main Conversion Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center my-6">
        {/* Source Currency Box */}
        <div className="lg:col-span-5 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-500">
              {direction === 'fromSgd' ? 'You Send (Singapore Dollar)' : `You Send (${selectedCurrency.code})`}
            </span>
            <span className="text-xs font-mono font-medium text-neutral-600">
              {direction === 'fromSgd' ? '🇸🇬 SGD' : `${selectedCurrency.flag} ${selectedCurrency.code}`}
            </span>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-mono text-neutral-400">
              {direction === 'fromSgd' ? 'S$' : selectedCurrency.symbol}
            </span>
            <input
              type="number"
              step="any"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-3 text-2xl md:text-3xl font-mono font-bold text-neutral-900 bg-white rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 tabular-nums"
            />
          </div>

          {/* Quick preset buttons for SGD */}
          {direction === 'fromSgd' && (
            <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1">
              <span className="text-xs text-neutral-400 whitespace-nowrap mr-1">Quick:</span>
              {quickPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset.toString())}
                  className={`px-2.5 py-1 text-xs font-mono rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
                    amount === preset.toString()
                      ? 'bg-rose-50 border-rose-300 text-rose-700 font-semibold'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Swap Direction Button */}
        <div className="lg:col-span-1 flex justify-center py-2 lg:py-0">
          <button
            onClick={handleSwap}
            className="p-3 bg-white hover:bg-neutral-100 active:bg-neutral-200 text-neutral-700 rounded-full border border-neutral-200 shadow-xs transition-transform hover:rotate-180 duration-300 cursor-pointer"
            title="Swap currency direction"
            aria-label="Swap currency direction"
          >
            <ArrowUpDown className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {/* Target Currency Box */}
        <div className="lg:col-span-5 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-500">
              {direction === 'fromSgd' ? `You Receive (${selectedCurrency.code})` : 'You Receive (Singapore Dollar)'}
            </span>

            {/* Target Currency Selector Trigger */}
            <div className="relative">
              <button
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1 text-xs font-semibold bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors cursor-pointer"
              >
                <span>{direction === 'fromSgd' ? selectedCurrency.flag : '🇸🇬'}</span>
                <span>{direction === 'fromSgd' ? selectedCurrency.code : 'SGD'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {/* Currency Dropdown Selector */}
              {currencyDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-neutral-200 z-50 p-2">
                  <div className="p-1 mb-2">
                    <label htmlFor={dropdownSearchInputId} className="sr-only">
                      Search currency
                    </label>
                    <input
                      id={dropdownSearchInputId}
                      type="text"
                      placeholder="Search currency, code, country..."
                      value={selectorSearch}
                      onChange={(e) => setSelectorSearch(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-0.5">
                    {filteredCurrencies.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          onSelectCurrency(c.code);
                          setCurrencyDropdownOpen(false);
                          setSelectorSearch('');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer text-left ${
                          c.code === selectedCurrency.code
                            ? 'bg-rose-50 text-rose-900 font-semibold'
                            : 'hover:bg-neutral-50 text-neutral-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{c.flag}</span>
                          <div>
                            <div className="font-mono font-medium">{c.code}</div>
                            <div className="text-[11px] text-neutral-500">{c.name}</div>
                          </div>
                        </div>
                        {c.code === selectedCurrency.code && (
                          <Check className="w-4 h-4 text-rose-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-mono text-neutral-400">
              {direction === 'fromSgd' ? selectedCurrency.symbol : 'S$'}
            </span>
            <div className="w-full pl-10 pr-12 py-3 text-2xl md:text-3xl font-mono font-bold text-neutral-900 bg-white rounded-lg border border-neutral-200 flex items-center tabular-nums overflow-x-auto">
              {formatCurrencyAmount(
                conversion.result,
                direction === 'fromSgd' ? selectedCurrency.code : 'SGD'
              )}
            </div>
            <button
              onClick={handleCopy}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer rounded-md hover:bg-neutral-100"
              title="Copy converted amount"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          {copied && (
            <div className="text-[11px] font-medium text-emerald-600 mt-2 flex items-center gap-1">
              <Check className="w-3 h-3" /> Amount copied to clipboard
            </div>
          )}
        </div>
      </div>

      {/* Real-time Cross Rate Summary Strip */}
      <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-neutral-700">
          <div>
            <span className="text-neutral-500">Mid-Market Rate:</span>{' '}
            <span className="font-mono font-semibold text-neutral-900">
              1 SGD = {(1 / selectedCurrency.rateToSgd).toFixed(selectedCurrency.rateToSgd < 0.001 ? 2 : 4)}{' '}
              {selectedCurrency.code}
            </span>
          </div>
          <span className="hidden sm:inline text-neutral-300">|</span>
          <div>
            <span className="text-neutral-500">Inverse:</span>{' '}
            <span className="font-mono font-semibold text-neutral-900">
              1 {selectedCurrency.code} = {selectedCurrency.rateToSgd.toFixed(4)} SGD
            </span>
          </div>
          {selectedCurrency.masQuoteUnit === 100 && (
            <>
              <span className="hidden sm:inline text-neutral-300">|</span>
              <div>
                <span className="text-neutral-500">Per 100 Units:</span>{' '}
                <span className="font-mono font-semibold text-neutral-900">
                  100 {selectedCurrency.code} = {(selectedCurrency.rateToSgd * 100).toFixed(4)} SGD
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-neutral-500">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Live Quotation</span>
        </div>
      </div>

      {/* Spread / Provider Comparison Tool (Crucial for Singaporeans) */}
      <div className="mt-8 pt-6 border-t border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
              <span>Exchange Rate Spread & Channel Comparison</span>
              <span className="text-xs font-normal text-neutral-500">
                (Compare money changer vs credit card vs mid-market)
              </span>
            </h3>
          </div>
          <div className="text-xs text-neutral-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span>Interactive channel rates for Singapore spenders</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {SPREAD_OPTIONS.map((option) => {
            const optConv = calculateConversion(
              numericAmount,
              selectedCurrency.rateToSgd,
              direction,
              option.id
            );
            const isSelected = spreadType === option.id;

            return (
              <button
                key={option.id}
                onClick={() => setSpreadType(option.id)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-bold truncate ${
                      isSelected ? 'text-white' : 'text-neutral-900'
                    }`}
                  >
                    {option.label}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-neutral-800 text-neutral-300'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {option.marginPercent === 0 ? '0% spread' : `+${option.marginPercent}% spread`}
                  </span>
                </div>

                <div className="text-base font-mono font-bold tracking-tight mb-1">
                  {formatCurrencyAmount(
                    optConv.result,
                    direction === 'fromSgd' ? selectedCurrency.code : 'SGD'
                  )}{' '}
                  <span className="text-xs font-normal opacity-80">
                    {direction === 'fromSgd' ? selectedCurrency.code : 'SGD'}
                  </span>
                </div>

                <div
                  className={`text-[11px] leading-tight ${
                    isSelected ? 'text-neutral-300' : 'text-neutral-500'
                  }`}
                >
                  {option.description}
                </div>

                {option.marginPercent > 0 && optConv.spreadDifference > 0 && (
                  <div
                    className={`mt-2 text-[10px] font-mono ${
                      isSelected ? 'text-rose-300' : 'text-rose-600'
                    }`}
                  >
                    Spread cost: ~{formatCurrencyAmount(optConv.spreadDifference, direction === 'fromSgd' ? selectedCurrency.code : 'SGD')} {direction === 'fromSgd' ? selectedCurrency.code : 'SGD'}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Travel Denomination & Budget breakdown */}
      {denominations && primaryDenom && denomCount > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <span className="font-semibold">Travel Cash Denomination Tip:</span>{' '}
              <span>
                At current rate, S${numericAmount} gives approx{' '}
                <strong className="font-mono">{denomCount}</strong> x{' '}
                <strong className="font-mono">{selectedCurrency.symbol}{primaryDenom}</strong> notes{' '}
                (with change).
              </span>
            </div>
          </div>
          <div className="text-amber-800/80 text-[11px] whitespace-nowrap">
            Common cash notes: {denominations.map((d) => `${selectedCurrency.symbol}${d}`).join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};
