import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetch24hTicker } from '../services/binanceService';
import { MarketSummary } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const [coins, setCoins] = useState<MarketSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      const data = await fetch24hTicker();
      setCoins(data);
      if (loading) setLoading(false);
    };
    loadData();
    const interval = setInterval(loadData, 5000); 
    return () => clearInterval(interval);
  }, []);

  const filteredCoins = coins.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-fade-in">
      
      {/* Hero Section */}
      <div className="relative py-10 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border pb-10">
        <div className="relative">
           <h1 className="text-6xl font-sans font-extrabold text-primary uppercase leading-none tracking-tight">
             {t('market_overview')} <span className="text-secondary">{t('market_overview_highlight')}</span>
           </h1>
           <p className="mt-2 text-secondary font-mono text-sm tracking-wide">
             GLOBAL_CRYPTO_DATA_STREAM // LIVE
           </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <div className="swiss-input flex items-center px-2 shadow-sm">
             <span className="pl-2 text-secondary">/</span>
             <input
              type="text"
              placeholder={t('search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none text-primary placeholder-secondary px-2 py-3 focus:outline-none font-mono text-sm uppercase"
             />
             <div className="pr-3 text-secondary">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>
          </div>
        </div>
      </div>

      {/* Marquee Header */}
      <div className="w-full overflow-hidden border-y border-border bg-surface py-3">
         <div className="animate-marquee whitespace-nowrap flex gap-12">
            {[...coins.slice(0, 15), ...coins.slice(0, 15)].map((coin, i) => (
              <div key={`${coin.symbol}-${i}`} className="flex items-center gap-3 font-mono text-xs">
                <span className="font-bold text-primary">{coin.name}</span>
                <span className={coin.change24h >= 0 ? "text-emerald-600 font-bold" : "text-red-600 font-bold"}>
                   {coin.price.toFixed(2)}
                </span>
              </div>
            ))}
         </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4">
           {[...Array(8)].map((_, i) => (
             <div key={i} className="h-20 w-full bg-surface border border-border animate-pulse rounded"></div>
           ))}
        </div>
      ) : (
        <div className="overflow-x-auto swiss-card border-none shadow-none bg-transparent">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-mono text-secondary uppercase tracking-widest border-b border-border">
                <th className="p-4 pl-6">{t('col_asset')}</th>
                <th className="p-4 text-right">{t('col_price')}</th>
                <th className="p-4 text-right">{t('col_change')}</th>
                <th className="p-4 text-right hidden sm:table-cell">{t('col_high_low')}</th>
                <th className="p-4 text-right hidden md:table-cell">{t('col_vol')}</th>
                <th className="p-4 text-right pr-6">{t('col_action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm font-medium tracking-wide">
              {filteredCoins.map((coin) => (
                <tr 
                  key={coin.symbol} 
                  className="group hover:bg-hover transition-all duration-200"
                >
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-4">
                      {/* Logo Placeholder */}
                      <div className="w-8 h-8 flex items-center justify-center bg-primary text-background rounded-full">
                         <span className="font-bold text-xs">{coin.name.substring(0,2)}</span>
                      </div>
                      <div>
                        <div className="font-bold text-lg text-primary">{coin.name}</div>
                        <div className="text-[10px] text-secondary font-mono">/USDT</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4 text-right">
                    <span className="text-lg font-bold text-primary">
                      ${coin.price < 1 ? coin.price.toFixed(5) : coin.price.toFixed(2)}
                    </span>
                  </td>
                  
                  <td className="p-4 text-right">
                    <div className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded ${coin.change24h >= 0 ? 'bg-emerald-100/20 text-emerald-600' : 'bg-red-100/20 text-red-600'}`}>
                      {coin.change24h > 0 ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
                    </div>
                  </td>
                  
                  <td className="p-4 text-right text-secondary text-xs hidden sm:table-cell font-mono">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-primary">{coin.high24h.toLocaleString()}</span>
                      <span className="text-secondary">{coin.low24h.toLocaleString()}</span>
                    </div>
                  </td>
                  
                  <td className="p-4 text-right text-secondary hidden md:table-cell font-mono">
                    ${(coin.volume24h / 1_000_000).toFixed(2)}M
                  </td>
                  
                  <td className="p-4 text-right pr-6">
                    <Link 
                      to={`/trade/${coin.symbol}`}
                      className="inline-block border border-primary bg-background text-primary hover:bg-primary hover:text-background px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all shadow-sm rounded-sm"
                    >
                      {t('btn_trade')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;