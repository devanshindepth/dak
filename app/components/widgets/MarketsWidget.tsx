'use client';

import React, { useEffect, useState } from 'react';
import { MarketsWidgetConfig, MarketItem } from '@/app/types/dashboard';
import WidgetShell from '@/app/components/ui/WidgetShell';

interface MarketResult {
  symbol: string;
  price: number;
  changePercent: number;
  isPositive: boolean;
}

export default function MarketsWidget({ config }: { config: MarketsWidgetConfig }) {
  const [markets, setMarkets] = useState<MarketItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`dak-markets-${config.id || 'default'}`);
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return config.markets || [
      { symbol: 'BTC-USD', name: 'Bitcoin' },
      { symbol: 'ETH-USD', name: 'Ethereum' },
      { symbol: 'SPY', name: 'S&P 500 ETF' },
      { symbol: 'NVDA', name: 'NVIDIA Corp' },
      { symbol: 'AAPL', name: 'Apple Inc' },
    ];
  });

  const [data, setData] = useState<MarketResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`dak-markets-${config.id || 'default'}`, JSON.stringify(markets));
    }
  }, [markets, config.id]);

  useEffect(() => {
    async function fetchMarkets() {
      if (markets.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }
      try {
        const symbols = markets.map((m) => m.symbol).join(',');
        const res = await fetch(`/api/markets?symbols=${encodeURIComponent(symbols)}`);
        if (!res.ok) throw new Error('Fetch failed');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchMarkets();
  }, [markets]);

  const handleAddTicker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;
    const sym = newSymbol.trim().toUpperCase();
    if (!markets.some((m) => m.symbol === sym)) {
      setMarkets([...markets, { symbol: sym, name: newName.trim() || sym }]);
    }
    setNewSymbol('');
    setNewName('');
    setShowAddForm(false);
  };

  const handleRemoveTicker = (symbol: string) => {
    setMarkets(markets.filter((m) => m.symbol !== symbol));
  };

  const marketNames: Record<string, string> = {};
  markets.forEach((m) => {
    marketNames[m.symbol] = m.name;
  });

  return (
    <WidgetShell
      title={config.title || 'Markets Watch'}
      titleUrl={config.titleUrl}
      hideHeader={config.hideHeader}
      error={error}
      loading={loading}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-tertiary">
          <span>Tracked Tickers: {markets.length}</span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            {showAddForm ? '✕ Close' : '＋ Add Ticker'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddTicker} className="flex gap-2 p-2 rounded border border-subtle bg-subtle">
            <input
              type="text"
              placeholder="Symbol (e.g. TSLA, SOL)"
              className="w-1/2 px-2 py-1 text-xs bg-input border border-subtle rounded text-primary focus:outline-none uppercase"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
            />
            <input
              type="text"
              placeholder="Name (Optional)"
              className="w-1/2 px-2 py-1 text-xs bg-input border border-subtle rounded text-primary focus:outline-none"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button type="submit" className="px-2.5 py-1 text-xs font-semibold bg-primary text-background rounded">
              Add
            </button>
          </form>
        )}

        <div className="flex flex-col gap-1">
          {data.map((item) => (
            <div
              key={item.symbol}
              className="group flex items-center justify-between py-1.5 px-2 rounded hover:bg-subtle/70 border-b border-subtle last:border-b-0 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div>
                  <div className="text-xs font-semibold text-primary">
                    {marketNames[item.symbol] || item.symbol}
                  </div>
                  <div className="text-[10px] text-tertiary">{item.symbol}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-mono font-medium text-primary">
                    ${item.price < 10 ? item.price.toFixed(4) : item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div
                    className={`text-[10px] font-mono font-semibold ${
                      item.isPositive ? 'text-positive' : 'text-negative'
                    }`}
                  >
                    {item.isPositive ? '+' : ''}
                    {item.changePercent.toFixed(2)}%
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveTicker(item.symbol)}
                  className="opacity-0 group-hover:opacity-100 text-tertiary hover:text-negative transition-opacity text-xs"
                  title="Remove ticker"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WidgetShell>
  );
}
