import { BINANCE_REST_BASE, QUOTE_ASSET } from '../constants';
import { BinanceTicker, BinanceKLine, ChartDataPoint, MarketSummary } from '../types';

// Fallback Mock Data Generators
const getMockTickerData = (): MarketSummary[] => {
  return [
    { symbol: 'BTCUSDT', name: 'BTC', price: 64231.45, change24h: 2.45, volume24h: 45000000000, high24h: 65100, low24h: 63200 },
    { symbol: 'ETHUSDT', name: 'ETH', price: 3452.12, change24h: -1.20, volume24h: 15000000000, high24h: 3550, low24h: 3400 },
    { symbol: 'SOLUSDT', name: 'SOL', price: 145.67, change24h: 5.60, volume24h: 3000000000, high24h: 152, low24h: 138 },
    { symbol: 'BNBUSDT', name: 'BNB', price: 590.30, change24h: 0.50, volume24h: 1000000000, high24h: 595, low24h: 585 },
    { symbol: 'XRPUSDT', name: 'XRP', price: 0.62, change24h: -0.80, volume24h: 800000000, high24h: 0.63, low24h: 0.61 },
    { symbol: 'ADAUSDT', name: 'ADA', price: 0.45, change24h: 1.10, volume24h: 400000000, high24h: 0.46, low24h: 0.44 },
    { symbol: 'DOGEUSDT', name: 'DOGE', price: 0.16, change24h: 8.40, volume24h: 1200000000, high24h: 0.17, low24h: 0.14 },
    { symbol: 'AVAXUSDT', name: 'AVAX', price: 35.40, change24h: -2.30, volume24h: 250000000, high24h: 36.5, low24h: 34.2 },
    { symbol: 'DOTUSDT', name: 'DOT', price: 7.20, change24h: -1.50, volume24h: 150000000, high24h: 7.5, low24h: 7.1 },
    { symbol: 'LINKUSDT', name: 'LINK', price: 14.50, change24h: 3.20, volume24h: 300000000, high24h: 15.0, low24h: 14.0 },
    { symbol: 'MATICUSDT', name: 'MATIC', price: 0.75, change24h: -0.50, volume24h: 100000000, high24h: 0.78, low24h: 0.74 },
  ];
};

const getMockKLines = (symbol: string): ChartDataPoint[] => {
  const now = Math.floor(Date.now() / 1000);
  const data: ChartDataPoint[] = [];
  let price = symbol.includes('BTC') ? 64000 : symbol.includes('ETH') ? 3400 : 100;
  
  for(let i = 100; i > 0; i--) {
      const time = now - (i * 3600);
      const volatility = price * 0.01;
      const change = (Math.random() - 0.5) * volatility;
      
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;
      
      data.push({
          time,
          date: new Date(time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          open, high, low, close, 
          volume: Math.random() * 1000 + 500,
          ma7: close, 
          ma25: close * 0.99, 
          ma99: close * 0.95 
      });
      price = close;
  }
  return data;
};

/**
 * Fetches 24hr ticker price change statistics for all symbols or a specific one.
 */
export const fetch24hTicker = async (): Promise<MarketSummary[]> => {
  try {
    const response = await fetch(`${BINANCE_REST_BASE}/ticker/24hr`);
    if (!response.ok) throw new Error('Failed to fetch ticker data');
    
    const data: BinanceTicker[] = await response.json();
    
    // Filter for USDT pairs to keep the list clean and map to our internal type
    return data
      .filter((ticker) => ticker.symbol.endsWith(QUOTE_ASSET))
      .map((ticker) => ({
        symbol: ticker.symbol,
        name: ticker.symbol.replace(QUOTE_ASSET, ''),
        price: parseFloat(ticker.lastPrice),
        change24h: parseFloat(ticker.priceChangePercent),
        volume24h: parseFloat(ticker.quoteVolume),
        high24h: parseFloat(ticker.highPrice),
        low24h: parseFloat(ticker.lowPrice),
      }))
      .sort((a, b) => b.volume24h - a.volume24h)
      .slice(0, 50);
  } catch (error) {
    console.warn("Binance API unreachable (CORS/Network). Using Mock Data.");
    return getMockTickerData();
  }
};

/**
 * Calculates Simple Moving Average
 */
const calculateSMA = (data: number[], period: number): number | undefined => {
  if (data.length < period) return undefined;
  const slice = data.slice(data.length - period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / period;
};

/**
 * Fetches candlestick data (K-Lines) for a symbol and adds MA calculations
 */
export const fetchKLines = async (symbol: string, interval: string = '1h', limit: number = 100): Promise<ChartDataPoint[]> => {
  try {
    const url = `${BINANCE_REST_BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch kline data');
    
    const rawData: BinanceKLine[] = await response.json();
    const closePrices = rawData.map(k => parseFloat(k[4]));

    return rawData.map((k, index) => {
      const close = parseFloat(k[4]);
      const pricesSoFar = closePrices.slice(0, index + 1);
      
      return {
        time: k[0] / 1000, 
        date: new Date(k[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: close,
        volume: parseFloat(k[5]),
        ma7: calculateSMA(pricesSoFar, 7),
        ma25: calculateSMA(pricesSoFar, 25),
        ma99: calculateSMA(pricesSoFar, 99),
      };
    });
  } catch (error) {
    console.warn("Binance KLine API unreachable. Using Mock Data.");
    return getMockKLines(symbol);
  }
};