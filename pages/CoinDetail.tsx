import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchKLines, fetch24hTicker } from '../services/binanceService';
import { BINANCE_WS_BASE } from '../constants';
import { ChartDataPoint, MarketSummary } from '../types';
import Chart from '../components/Chart';
import { useLanguage } from '../contexts/LanguageContext';

const CoinDetail: React.FC = () => {
  const { t } = useLanguage();
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  
  const [summary, setSummary] = useState<MarketSummary | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  
  // Chart Controls
  const [interval, setInterval] = useState<string>('1h');
  const [isLoadingChart, setIsLoadingChart] = useState<boolean>(false);

  // Sidebar
  const [orderBook, setOrderBook] = useState<{price: number, amount: number, type: 'ask' | 'bid'}[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!symbol) return;
    
    const loadSummary = async () => {
      try {
        const tickers = await fetch24hTicker();
        const coinSummary = tickers.find(t => t.symbol === symbol);
        if (coinSummary) {
          setSummary(coinSummary);
          setLivePrice(coinSummary.price);
          generateOrderBook(coinSummary.price);
        }
      } catch (e) {
        console.error("Failed to load summary", e);
      }
    };
    
    loadSummary();
  }, [symbol]);

  useEffect(() => {
    if (!symbol) return;

    const loadChart = async () => {
      setIsLoadingChart(true);
      try {
        const apiInterval = interval.toLowerCase(); 
        const limit = 500;
        const klines = await fetchKLines(symbol, apiInterval, limit); 
        setChartData(klines);
      } catch (error) {
        console.error("Failed to load chart data", error);
      } finally {
        setIsLoadingChart(false);
      }
    };

    loadChart();
  }, [symbol, interval]);

  useEffect(() => {
    if (!symbol) return;
    if (wsRef.current) wsRef.current.close();

    const streamName = `${symbol.toLowerCase()}@trade`;
    const ws = new WebSocket(`${BINANCE_WS_BASE}/${streamName}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.p) {
        const newPrice = parseFloat(message.p);
        setLivePrice(newPrice);
        if (Math.random() > 0.8) generateOrderBook(newPrice);
      }
    };

    return () => { if (wsRef.current) wsRef.current.close(); };
  }, [symbol]);

  const generateOrderBook = (basePrice: number) => {
    const spread = basePrice * 0.0005;
    const asks = Array.from({length: 12}, (_, i) => ({
      price: basePrice + spread + (i * spread),
      amount: Math.random() * (10000 / basePrice),
      type: 'ask' as const
    })).reverse();
    
    const bids = Array.from({length: 12}, (_, i) => ({
      price: basePrice - spread - (i * spread),
      amount: Math.random() * (10000 / basePrice),
      type: 'bid' as const
    }));
    
    setOrderBook([...asks, ...bids]);
  };

  if (!symbol) return <div className="p-20 text-center font-mono text-primary animate-pulse text-xl">{t('loading')}</div>;

  const isPositive = summary ? summary.change24h >= 0 : true;
  const timeframeOptions = ['15m', '1H', '4H', '1D', '1W'];

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full">
      
      {/* HUD Header - Swiss Style */}
      <div className="swiss-card p-6 flex flex-wrap justify-between items-center gap-6">
        
        <div className="flex items-center gap-6 z-10">
           <Link to="/" className="w-10 h-10 flex items-center justify-center bg-background border border-border text-secondary hover:text-primary hover:border-primary transition-colors rounded">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
           </Link>
           <div>
             <h1 className="text-4xl font-bold text-primary tracking-tight">{symbol.replace('USDT', '')}<span className="text-secondary text-xl mx-2">/</span><span className="text-secondary text-xl">USDT</span></h1>
             <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span className="text-[10px] text-emerald-600 font-mono tracking-widest uppercase font-bold">{t('market_open')}</span>
             </div>
           </div>
        </div>
        
        <div className="flex gap-12 items-end z-10">
           <div className="text-right">
             <p className="text-[10px] font-mono text-secondary uppercase mb-1">{t('mark_price')}</p>
             <p className={`text-5xl font-mono font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
               ${livePrice?.toLocaleString(undefined, {minimumFractionDigits: 2})}
             </p>
           </div>
           
           <div className="hidden md:block text-right">
             <p className="text-[10px] font-mono text-secondary uppercase mb-1">{t('change_24h')}</p>
             <p className={`text-xl font-mono font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
               {summary?.change24h > 0 ? '+' : ''}{summary?.change24h.toFixed(2)}%
             </p>
           </div>
           
           <div className="hidden lg:block text-right">
             <p className="text-[10px] font-mono text-secondary uppercase mb-1">{t('vol_24h')}</p>
             <p className="text-xl font-mono text-primary font-bold">${(summary?.volume24h || 0).toLocaleString()}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[600px]">
        
        {/* Main Chart Area */}
        <div className="lg:col-span-9 swiss-card p-0 flex flex-col relative overflow-hidden">
          {/* Chart Header Controls */}
          <div className="h-12 border-b border-border bg-background flex items-center justify-between px-4">
             <div className="flex gap-1">
               {timeframeOptions.map((tf) => (
                 <button 
                    key={tf} 
                    onClick={() => setInterval(tf)}
                    className={`px-3 py-1 text-xs font-mono font-bold border rounded-sm transition-all duration-200 
                      ${interval === tf 
                        ? 'text-background bg-primary border-primary' 
                        : 'text-secondary border-transparent hover:bg-surface'}`}
                 >
                   {tf}
                 </button>
               ))}
             </div>
             <div className="text-[10px] font-mono text-secondary">TRADINGVIEW // v.5.0</div>
          </div>
          
          <div className="flex-grow relative bg-background">
             {isLoadingChart && (
                <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="font-mono text-primary text-xs font-bold">UPDATING TIMEFRAME...</div>
                </div>
             )}
             
             {chartData.length > 0 ? (
               <Chart data={chartData} isPositive={isPositive} />
             ) : (
               <div className="absolute inset-0 flex items-center justify-center text-secondary font-bold animate-pulse text-2xl">
                 {isLoadingChart ? t('loading') : 'NO DATA AVAILABLE'}
               </div>
             )}
          </div>
        </div>

        {/* Right Sidebar: Order Book Only (AI Removed) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Order Book */}
          <div className="swiss-card p-4 flex-1 flex flex-col min-h-[300px]">
            <h3 className="text-xs font-bold text-primary font-mono mb-4 flex justify-between border-b border-border pb-2">
                <span>{t('order_book')}</span>
                <span className="text-secondary">L2</span>
            </h3>
            
            <div className="flex-grow flex flex-col gap-0.5 font-mono text-[10px] overflow-hidden">
              {/* Asks (Sells) - Red */}
              <div className="flex-1 flex flex-col justify-end gap-0.5 mb-2">
                 {orderBook.filter(o => o.type === 'ask').slice(0, 12).map((order, i) => (
                   <div key={`ask-${i}`} className="flex justify-between relative px-1 py-0.5 cursor-crosshair hover:bg-surface">
                     <div className="absolute top-0 bottom-0 right-0 bg-red-500/10 transition-all duration-300" style={{ width: `${Math.min(100, (order.amount * order.price) / 100)}%` }}></div>
                     <span className="text-red-600 z-10 relative font-bold">{order.price.toFixed(livePrice && livePrice < 10 ? 4 : 2)}</span>
                     <span className="text-secondary z-10 relative">{order.amount.toFixed(3)}</span>
                   </div>
                 ))}
              </div>
              
              {/* Spread / Current Price */}
              <div className="py-2 border-y border-border bg-surface text-center text-lg font-bold text-primary tracking-wider">
                {livePrice?.toFixed(livePrice && livePrice < 10 ? 4 : 2)}
              </div>

              {/* Bids (Buys) - Green */}
              <div className="flex-1 flex flex-col justify-start gap-0.5 mt-2">
                 {orderBook.filter(o => o.type === 'bid').slice(0, 12).map((order, i) => (
                   <div key={`bid-${i}`} className="flex justify-between relative px-1 py-0.5 cursor-crosshair hover:bg-surface">
                     <div className="absolute top-0 bottom-0 right-0 bg-emerald-500/10 transition-all duration-300" style={{ width: `${Math.min(100, (order.amount * order.price) / 100)}%` }}></div>
                     <span className="text-emerald-600 z-10 relative font-bold">{order.price.toFixed(livePrice && livePrice < 10 ? 4 : 2)}</span>
                     <span className="text-secondary z-10 relative">{order.amount.toFixed(3)}</span>
                   </div>
                 ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CoinDetail;