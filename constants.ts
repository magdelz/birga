export const BINANCE_REST_BASE = 'https://data-api.binance.vision/api/v3';
export const BINANCE_WS_BASE = 'wss://stream.binance.com:9443/ws';

// We will primarily focus on USDT pairs for this demo
export const QUOTE_ASSET = 'USDT';

export const POPULAR_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 
  'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT',
  'LTCUSDT', 'SHIBUSDT', 'TRXUSDT', 'LINKUSDT', 'ATOMUSDT'
];

export const CHART_COLORS = {
  up: '#10b981', // emerald-500
  down: '#f43f5e', // rose-500
  grid: '#334155', // slate-700
  text: '#94a3b8', // slate-400
};