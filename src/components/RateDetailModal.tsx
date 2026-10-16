import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, Star, Calculator, ExternalLink, Copy, Check } from 'lucide-react';
import { CurrencyRate } from '../types/currency';
import { formatCurrencyAmount, formatMasQuote } from '../services/currencyService';

interface RateDetailModalProps {
  currency: CurrencyRate | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (code: string) => void;
  onSelectForCalculator: (code: string) => void;
}

export const RateDetailModal: React.FC<RateDetailModalProps> = ({
  currency,
  onClose,
  isFavorite,
  onToggleFavorite,
  onSelectForCalculator,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  if (!currency) return null;

  const isPositive = currency.change24h >= 0;
  const sgdCrossRate = 1 / currency.rateToSgd;

  // 7-day trend chart coordinates
  const history = currency.history7d;
  const minRate = Math.min(...history);
  const maxRate = Math.max(...history);
  const range = maxRate - minRate || 1;

  const chartWidth = 520;
  const chartHeight = 160;
  const padX = 24;
  const padY = 24;
  const usableWidth = chartWidth - padX * 2;
  const usableHeight = chartHeight - padY * 2;

  const points = history.map((val, idx) => {
    const x = padX + (idx / (history.length - 1)) * usableWidth;
    const y = chartHeight - padY - ((val - minRate) / range) * usableHeight;
    return { x, y, val };
  });

  const polylinePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // 24h range percentage
  const rangeSpan = currency.high24h - currency.low24h || 0.0001;
  const currentPosPercent = Math.min(
    100,
    Math.max(0, ((currency.rateToSgd - currency.low24h) / rangeSpan) * 100)
  );

  const handleCopyRate = () => {
    navigator.clipboard.writeText(`1 ${currency.code} = ${currency.rateToSgd.toFixed(4)} SGD`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dayLabels = ['-6d', '-5d', '-4d', '-3d', '-2d', 'Yesterday', 'Today'];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rate-detail-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-xl w-full p-6 md:p-8 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{currency.flag}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="rate-detail-modal-title" className="text-xl font-bold font-mono text-neutral-900">
                  {currency.code}
                </h3>
                <span className="text-xs text-neutral-400 font-medium">·</span>
                <span className="text-xs text-neutral-500 font-medium">{currency.country}</span>
              </div>
              <p className="text-xs text-neutral-600">{currency.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(currency.code)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isFavorite
                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                  : 'bg-neutral-50 text-neutral-400 border-neutral-200 hover:text-amber-500'
              }`}
              title={isFavorite ? 'Remove favorite' : 'Add favorite'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Rate Big Overview */}
        <div className="grid grid-cols-2 gap-4 py-5 border-b border-neutral-100">
          <div>
            <div className="text-xs text-neutral-400 font-medium">1 SGD to {currency.code}</div>
            <div className="text-2xl font-bold font-mono text-neutral-900 tracking-tight mt-0.5">
              {formatCurrencyAmount(sgdCrossRate, currency.code)}{' '}
              <span className="text-xs font-normal text-neutral-500">{currency.code}</span>
            </div>
            <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
              1 {currency.code} = S$ {currency.rateToSgd.toFixed(currency.rateToSgd < 0.001 ? 6 : 4)}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-neutral-400 font-medium">24h Net Change</div>
            <div
              className={`text-lg font-bold font-mono inline-flex items-center gap-1 mt-0.5 ${
                isPositive ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{isPositive ? `+${currency.change24h}%` : `${currency.change24h}%`}</span>
            </div>
            <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
              MAS: {formatMasQuote(currency)}
            </div>
          </div>
        </div>

        {/* 24h High / Low Bar */}
        <div className="py-4 border-b border-neutral-100">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-medium mb-1.5">
            <span>24h Low: S$ {currency.low24h.toFixed(currency.rateToSgd < 0.001 ? 6 : 4)}</span>
            <span>24h High: S$ {currency.high24h.toFixed(currency.rateToSgd < 0.001 ? 6 : 4)}</span>
          </div>
          <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden relative">
            <div
              className="bg-neutral-900 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.max(5, currentPosPercent)}%` }}
            />
          </div>
        </div>

        {/* 7-Day Rate Chart */}
        <div className="py-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-neutral-800">7-Day Rate Trajectory (in SGD)</span>
            {hoveredPoint !== null ? (
              <span className="font-mono text-neutral-900 font-semibold text-xs">
                {dayLabels[hoveredPoint]}: S$ {history[hoveredPoint].toFixed(4)}
              </span>
            ) : (
              <span className="text-neutral-400 text-[11px]">Hover nodes for daily close</span>
            )}
          </div>

          <div className="bg-neutral-50/70 rounded-xl p-2 border border-neutral-100 relative">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-36 overflow-visible"
            >
              {/* Grid Lines */}
              <line
                x1={padX}
                y1={padY}
                x2={chartWidth - padX}
                y2={padY}
                stroke="#e5e5e5"
                strokeDasharray="3 3"
              />
              <line
                x1={padX}
                y1={chartHeight / 2}
                x2={chartWidth - padX}
                y2={chartHeight / 2}
                stroke="#e5e5e5"
                strokeDasharray="3 3"
              />
              <line
                x1={padX}
                y1={chartHeight - padY}
                x2={chartWidth - padX}
                y2={chartHeight - padY}
                stroke="#e5e5e5"
                strokeDasharray="3 3"
              />

              {/* Line path */}
              <polyline
                fill="none"
                stroke={isPositive ? '#16a34a' : '#dc2626'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePoints}
              />

              {/* Interactive nodes */}
              {points.map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r={hoveredPoint === idx ? 5 : 3.5}
                  fill={isPositive ? '#16a34a' : '#dc2626'}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredPoint(idx)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </svg>

            {/* Day labels below chart */}
            <div className="flex justify-between px-2 pt-1 text-[10px] text-neutral-400 font-mono">
              {dayLabels.map((lbl, i) => (
                <span key={i}>{lbl}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-4 mt-2 border-t border-neutral-100 flex items-center justify-between gap-3">
          <button
            onClick={handleCopyRate}
            className="px-3.5 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Rate'}</span>
          </button>

          <button
            onClick={() => {
              onSelectForCalculator(currency.code);
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Open in Calculator</span>
          </button>
        </div>
      </div>
    </div>
  );
};
