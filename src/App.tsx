import React, { useState, useEffect, useMemo, useId } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Download,
  ArrowUpDown,
  Sparkles,
  RefreshCw,
  Star,
  Info,
  Clock,
  ExternalLink,
} from 'lucide-react';

import { CurrencyCategory, CurrencyRate, MASConfig } from './types/currency';
import { Navbar } from './components/Navbar';
import { CurrencyCalculator } from './components/CurrencyCalculator';
import { CurrencyCard } from './components/CurrencyCard';
import { CurrencyTable } from './components/CurrencyTable';
import { RateDetailModal } from './components/RateDetailModal';
import { MASConfigModal } from './components/MASConfigModal';
import { WatchlistBanner } from './components/WatchlistBanner';

import {
  getStoredFavorites,
  saveStoredFavorites,
  getStoredMASConfig,
  saveStoredMASConfig,
  getStoredRates,
  fetchOrSimulateRates,
} from './services/currencyService';

export default function App() {
  const [rates, setRates] = useState<CurrencyRate[]>(getStoredRates());
  const [favorites, setFavorites] = useState<string[]>(getStoredFavorites());
  const [masConfig, setMasConfig] = useState<MASConfig>(getStoredMASConfig());
  const [activeTab, setActiveTab] = useState<string>('calculator');
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('MYR');
  const [categoryFilter, setCategoryFilter] = useState<CurrencyCategory | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'popular' | 'code' | 'change' | 'rate'>('popular');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(masConfig.lastUpdated || 'Just now');
  const [detailModalCurrency, setDetailModalCurrency] = useState<CurrencyRate | null>(null);
  const [isMasModalOpen, setIsMasModalOpen] = useState<boolean>(false);
  const searchInputId = useId();

  // Handle Favorites toggle
  const handleToggleFavorite = (code: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code];
      saveStoredFavorites(updated);
      return updated;
    });
  };

  // Handle Rate Refresh (Simulated live ticks or live MAS API)
  const handleRefreshRates = async () => {
    setIsRefreshing(true);
    try {
      const result = await fetchOrSimulateRates(rates, masConfig);
      setRates(result.rates);
      setLastUpdated(result.timestamp);
      setMasConfig((prev) => {
        const updated = { ...prev, lastUpdated: result.timestamp };
        saveStoredMASConfig(updated);
        return updated;
      });
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Save MAS config
  const handleSaveMasConfig = (newConfig: MASConfig) => {
    setMasConfig(newConfig);
    saveStoredMASConfig(newConfig);
  };

  // Export Rates to CSV
  const handleExportCSV = () => {
    const headers = ['Currency Code', 'Name', 'Country', '1 SGD Value', '1 Unit in SGD', 'MAS Quotation', '24h Change %'];
    const rows = rates.map((r) => [
      r.code,
      `"${r.name}"`,
      `"${r.country}"`,
      (1 / r.rateToSgd).toFixed(4),
      r.rateToSgd.toFixed(6),
      `"${r.masQuoteUnit === 100 ? `${(r.rateToSgd * 100).toFixed(4)} per 100` : `${r.rateToSgd.toFixed(4)} per 1`}"`,
      `${r.change24h}%`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `singarate_mas_rates_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and Sort Currencies
  const filteredAndSortedCurrencies = useMemo(() => {
    let result = [...rates];

    // Category filter
    if (categoryFilter === 'favorites') {
      result = result.filter((c) => favorites.includes(c.code));
    } else if (categoryFilter !== 'all') {
      result = result.filter((c) => c.category === categoryFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'popular') {
        const aFav = favorites.includes(a.code) ? 1 : 0;
        const bFav = favorites.includes(b.code) ? 1 : 0;
        if (aFav !== bFav) return bFav - aFav;
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      }
      if (sortBy === 'code') {
        return a.code.localeCompare(b.code);
      }
      if (sortBy === 'change') {
        return b.change24h - a.change24h;
      }
      if (sortBy === 'rate') {
        return b.rateToSgd - a.rateToSgd;
      }
      return 0;
    });

    return result;
  }, [rates, categoryFilter, searchQuery, sortBy, favorites]);

  // Favorite currencies list for top watchlist strip
  const favoriteCurrenciesList = useMemo(() => {
    return rates.filter((c) => favorites.includes(c.code));
  }, [rates, favorites]);

  const selectForCalculator = (code: string) => {
    setSelectedCurrencyCode(code);
    setActiveTab('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={handleRefreshRates}
        isRefreshing={isRefreshing}
        onOpenMasConfig={() => setIsMasModalOpen(true)}
        favoritesCount={favorites.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4">
            <div>
              <span className="text-xs font-semibold text-rose-600 tracking-wider uppercase">
                Singapore Exchange Rates & Conversion Desk
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 mt-1 max-w-3xl" style={{ textWrap: 'balance' }}>
                Real-Time Singapore Dollar Currency Conversions & MAS Benchmarks
              </h1>
              {/* Zero-Pill Typography Metadata */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 mt-2">
                <span>Monetary Authority of Singapore (MAS) Framework</span>
                <span aria-hidden="true">·</span>
                <span>Mid-Market & Retail Spreads</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-neutral-400" />
                  <span>Updated {lastUpdated}</span>
                </span>
              </div>
            </div>

            {/* Quick Actions / Integration Status */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsMasModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors cursor-pointer shadow-2xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
                <span>Backend API Setup</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors cursor-pointer shadow-2xs"
                title="Download rates as CSV"
              >
                <Download className="w-3.5 h-3.5 text-neutral-500" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Quick Access Watchlist Strip */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>Pinned Watchlist ({favorites.length})</span>
              </span>
              {favorites.length > 0 && (
                <button
                  onClick={() => {
                    setCategoryFilter('favorites');
                    setActiveTab('rates');
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                >
                  View all in table →
                </button>
              )}
            </div>
            <WatchlistBanner
              favoriteCurrencies={favoriteCurrenciesList}
              onSelectForCalculator={selectForCalculator}
              onViewDetails={setDetailModalCurrency}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        </div>

        {/* View Selection Tabs (Functional segmented control, not pills) */}
        <div className="flex items-center justify-between border-b border-neutral-200 mb-6">
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Calculator & Comparison
            </button>
            <button
              onClick={() => {
                setActiveTab('rates');
                if (categoryFilter === 'favorites') setCategoryFilter('all');
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'rates' && categoryFilter !== 'favorites'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All Exchange Rates ({rates.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('rates');
                setCategoryFilter('favorites');
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                categoryFilter === 'favorites' && activeTab === 'rates'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>Watchlist ({favorites.length})</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500 font-mono">
            <span>Base: 🇸🇬 SGD</span>
          </div>
        </div>

        {/* Tab 1: Calculator Section */}
        {activeTab === 'calculator' && (
          <div className="space-y-8">
            <CurrencyCalculator
              currencies={rates}
              selectedCode={selectedCurrencyCode}
              onSelectCurrency={setSelectedCurrencyCode}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onViewDetails={setDetailModalCurrency}
            />

            {/* Quick Currency Grid below calculator for fast swapping */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    Popular Singapore Travel & Business Currencies
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Click any currency to load into calculator or view rate breakdown.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('rates')}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700 cursor-pointer"
                >
                  Browse all {rates.length} currencies →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {rates.slice(0, 8).map((currency) => (
                  <CurrencyCard
                    key={currency.code}
                    currency={currency}
                    isFavorite={favorites.includes(currency.code)}
                    onToggleFavorite={handleToggleFavorite}
                    onSelectForCalculator={selectForCalculator}
                    onViewDetails={setDetailModalCurrency}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: All Exchange Rates Explorer (with Search & Filters) */}
        {activeTab === 'rates' && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <label htmlFor={searchInputId} className="sr-only">
                  Search currency
                </label>
                <input
                  id={searchInputId}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search currency by code, name, or country (e.g. MYR, Ringgit, Japan)..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Category Filters (Segmented Controls) */}
              <div className="flex flex-wrap items-center gap-1 overflow-x-auto pb-1 md:pb-0">
                {(
                  [
                    { id: 'all', label: 'All Currencies' },
                    { id: 'favorites', label: '★ Favorites' },
                    { id: 'asean', label: 'ASEAN / Regional' },
                    { id: 'major', label: 'Major FX' },
                    { id: 'east_asia', label: 'East Asia' },
                    { id: 'other', label: 'Other Global' },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      categoryFilter === cat.id
                        ? 'bg-neutral-900 text-white font-semibold'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* View Mode & Sort Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 border border-neutral-200 rounded-lg p-0.5 bg-neutral-50">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-white text-neutral-900 shadow-2xs'
                        : 'text-neutral-400 hover:text-neutral-700'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      viewMode === 'table'
                        ? 'bg-white text-neutral-900 shadow-2xs'
                        : 'text-neutral-400 hover:text-neutral-700'
                    }`}
                    title="Table View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs font-medium bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none cursor-pointer"
                >
                  <option value="popular">Sort: Popular</option>
                  <option value="code">Sort: Code (A-Z)</option>
                  <option value="change">Sort: 24h Change</option>
                  <option value="rate">Sort: Highest Rate</option>
                </select>
              </div>
            </div>

            {/* Results Count & Notice */}
            <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
              <span>
                Showing {filteredAndSortedCurrencies.length} currencies
                {categoryFilter !== 'all' ? ` in ${categoryFilter}` : ''}
                {searchQuery ? ` matching "${searchQuery}"` : ''}
              </span>
              <span>All quotations quoted relative to 1 Singapore Dollar (SGD)</span>
            </div>

            {/* Empty State */}
            {filteredAndSortedCurrencies.length === 0 && (
              <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
                <Search className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-neutral-800">No matching currencies found</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your search query or reset your category filter to show all Singapore exchange rates.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                  }}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Populated State: Grid or Table View */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredAndSortedCurrencies.map((currency) => (
                  <CurrencyCard
                    key={currency.code}
                    currency={currency}
                    isFavorite={favorites.includes(currency.code)}
                    onToggleFavorite={handleToggleFavorite}
                    onSelectForCalculator={selectForCalculator}
                    onViewDetails={setDetailModalCurrency}
                  />
                ))}
              </div>
            ) : (
              <CurrencyTable
                currencies={filteredAndSortedCurrencies}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onSelectForCalculator={selectForCalculator}
                onViewDetails={setDetailModalCurrency}
              />
            )}
          </div>
        )}

        {/* MAS Statutory & Regulatory Reference Notice */}
        <div className="mt-12 p-6 rounded-xl bg-white border border-neutral-200 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider text-neutral-500">
                  MAS Quotation & Market Convention
                </span>
              </div>
              <p className="text-xs text-neutral-600 mt-1 max-w-3xl leading-relaxed">
                Under the Monetary Authority of Singapore (MAS) exchange rate convention, selected currencies (including Indonesian Rupiah, Japanese Yen, Korean Won, Malaysian Ringgit, Thai Baht, Taiwan Dollar, and Philippine Peso) are officially reported per 100 foreign currency units. Wholesale mid-market rates are updated daily.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsMasModalOpen(true)}
                className="px-3 py-2 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Connect MAS API Keys</span>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      <RateDetailModal
        currency={detailModalCurrency}
        onClose={() => setDetailModalCurrency(null)}
        isFavorite={detailModalCurrency ? favorites.includes(detailModalCurrency.code) : false}
        onToggleFavorite={handleToggleFavorite}
        onSelectForCalculator={selectForCalculator}
      />

      {/* MAS Config Modal */}
      <MASConfigModal
        isOpen={isMasModalOpen}
        onClose={() => setIsMasModalOpen(false)}
        config={masConfig}
        onSaveConfig={handleSaveMasConfig}
      />

      {/* Quiet, Clean Footer */}
      <footer className="border-t border-neutral-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900">SingaRate</span>
            <span>·</span>
            <span>Singapore Exchange Rate Desk & Currency Converter</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMasModalOpen(true)}
              className="hover:text-neutral-900 transition-colors cursor-pointer"
            >
              API Configuration
            </button>
            <span>·</span>
            <button
              onClick={handleExportCSV}
              className="hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Download CSV
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
