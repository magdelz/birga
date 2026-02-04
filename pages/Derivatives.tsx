import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetch24hTicker } from '../services/binanceService';
import { MarketSummary } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const Derivatives: React.FC = () => {
  const { t } = useLanguage();
  const [coins, setCoins] = useState<MarketSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetch24hTicker();
      const derivs = data.filter(c => ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT'].includes(c.symbol));
      setCoins(derivs);
      if (loading) setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="space-y-10 animate-fade-in">
       {/* Hero */}
       <div className="relative py-8 border-b border-border pb-8">
           <h1 className="text-6xl font-bold text-primary uppercase leading-none tracking-tighter">
             {t('deriv_title')} <span className="text-secondary">{t('deriv_highlight')}</span>
           </h1>
           <p className="mt-2 text-secondary font-mono text-sm tracking-wide">
             LEVERAGE_TRADING // FUTURES_V2
           </p>
       </div>

       {/* Derivatives Table */}
       <div className="overflow-x-auto swiss-card border shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-mono text-secondary uppercase tracking-widest border-b border-border bg-surface">
                <th className="p-4 pl-6">{t('col_asset')}</th>
                <th className="p-4 text-right">{t('col_price')}</th>
                <th className="p-4 text-right">{t('funding')}</th>
                <th className="p-4 text-right">{t('open_interest')}</th>
                <th className="p-4 text-right pr-6">{t('col_action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm font-medium tracking-wide">
              {coins.map((coin) => (
                <tr key={coin.symbol} className="group hover:bg-hover transition-all">
                   <td className="p-4 pl-6">
                      <div className="flex items-center gap-4">
                         <div className="w-8 h-8 flex items-center justify-center bg-primary border border-border text-background rounded-sm">
                            <span className="font-bold text-sm">{coin.name.substring(0,2)}</span>
                         </div>
                         <div>
                            <div className="font-bold text-lg text-primary">{coin.name} <span className="text-xs text-secondary ml-1">PERP</span></div>
                         </div>
                      </div>
                   </td>
                   <td className="p-4 text-right font-bold text-primary">
                      ${coin.price.toFixed(2)}
                   </td>
                   <td className="p-4 text-right text-xs font-mono">
                      <span className="text-amber-600 font-bold">0.0100%</span> <span className="text-secondary">/ 07:45:12</span>
                   </td>
                   <td className="p-4 text-right text-xs font-mono text-secondary">
                      ${(coin.volume24h * 0.4).toLocaleString()}
                   </td>
                   <td className="p-4 text-right pr-6">
                      <Link 
                        to={`/trade/${coin.symbol}`}
                        className="inline-block border border-primary text-primary hover:bg-primary hover:text-background px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-sm"
                      >
                        {t('btn_trade')}
                      </Link>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
       </div>
    </div>
  );
};

export default Derivatives;