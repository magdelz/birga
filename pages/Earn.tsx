import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Earn: React.FC = () => {
  const { t } = useLanguage();
  
  const earnOptions = [
    { asset: 'USDT', apy: '12.5%', duration: 'Flexible' },
    { asset: 'BTC', apy: '4.2%', duration: '30 Days' },
    { asset: 'ETH', apy: '5.1%', duration: 'Flexible' },
    { asset: 'BNB', apy: '8.8%', duration: '90 Days' },
    { asset: 'DOT', apy: '14.2%', duration: '120 Days' },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
       <div className="relative py-8 border-b border-border pb-8">
           <h1 className="text-6xl font-bold text-primary uppercase leading-none tracking-tighter">
             {t('earn_title')} <span className="text-secondary">{t('earn_highlight')}</span>
           </h1>
           <p className="mt-2 text-secondary font-mono text-sm tracking-wide">
             STAKING_POOLS // YIELD_FARMING
           </p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {earnOptions.map((opt, i) => (
             <div key={i} className="swiss-card p-6 flex flex-col items-center text-center hover:shadow-lg transition-all group relative overflow-hidden">
                <div className="relative z-10 w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-4">
                   <span className="font-bold text-xl text-primary">{opt.asset}</span>
                </div>
                <h3 className="relative z-10 text-4xl font-bold text-primary mb-1">{opt.apy}</h3>
                <p className="relative z-10 text-xs font-mono text-emerald-600 font-bold uppercase tracking-widest mb-6">{t('apy')}</p>
                
                <div className="relative z-10 w-full flex justify-between text-xs font-mono text-secondary mb-6 border-t border-border pt-4">
                   <span>{t('duration')}</span>
                   <span className="text-primary font-bold">{opt.duration === 'Flexible' ? t('flexible') : opt.duration.replace('Days', ` ${t('days')}`)}</span>
                </div>
                
                <button className="relative z-10 w-full py-3 bg-primary hover:opacity-90 text-background font-bold uppercase tracking-wide rounded-sm">
                   {t('stake')} {opt.asset}
                </button>
             </div>
          ))}
       </div>
    </div>
  );
};

export default Earn;