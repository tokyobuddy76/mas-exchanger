import React from 'react';
import { RefreshCw, SlidersHorizontal } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenMasConfig: () => void;
  favoritesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onRefresh,
  isRefreshing,
  onOpenMasConfig,
  favoritesCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('calculator');
            }}
            className="text-lg font-bold tracking-tight text-neutral-900 whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              S$
            </span>
            <span>SingaRate</span>
          </a>
          <span className="hidden sm:inline text-xs text-neutral-400 font-medium">
            · MAS FX Desk
          </span>
        </div>

        {/* Zone 2: 4 single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'calculator'
                ? 'text-neutral-950 font-semibold border-b-2 border-rose-600'
                : 'hover:text-neutral-900'
            }`}
          >
            Calculator
          </button>
          <button
            onClick={() => setActiveTab('rates')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'rates'
                ? 'text-neutral-950 font-semibold border-b-2 border-rose-600'
                : 'hover:text-neutral-900'
            }`}
          >
            All Rates
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'text-neutral-950 font-semibold border-b-2 border-rose-600'
                : 'hover:text-neutral-900'
            }`}
          >
            <span>Favorites</span>
            {favoritesCount > 0 && (
              <span className="text-xs font-mono font-medium text-neutral-500">
                ({favoritesCount})
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('talk-to-us')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'talk-to-us'
                ? 'text-neutral-950 font-semibold border-b-2 border-rose-600'
                : 'hover:text-neutral-900'
            }`}
          >
            Talk to Us
          </button>
          <button
            onClick={onOpenMasConfig}
            className="whitespace-nowrap shrink-0 text-neutral-600 hover:text-neutral-900 transition-colors py-1 flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>MAS API Setup</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
            title="Refresh exchange rates"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-neutral-600 ${isRefreshing ? 'animate-spin text-rose-600' : ''}`}
            />
            <span className="hidden sm:inline">Refresh Rates</span>
            <span className="sm:hidden">Refresh</span>
          </button>
        </div>
      </div>
    </header>
  );
};
