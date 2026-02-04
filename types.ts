// Binance API Types

export interface BinanceTicker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

// [Open Time, Open, High, Low, Close, Volume, Close Time, ...]
export type BinanceKLine = [
  number, // Open time
  string, // Open
  string, // High
  string, // Low
  string, // Close
  string, // Volume
  number, // Close time
  string, // Quote asset volume
  number, // Number of trades
  string, // Taker buy base asset volume
  string, // Taker buy quote asset volume
  string  // Ignore
];

export interface ChartDataPoint {
  time: number; // Unix timestamp (seconds)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  date: string; // Human readable
  ma7?: number;
  ma25?: number;
  ma99?: number;
}

export enum TimeFrame {
  H1 = '1h',
  H4 = '4h',
  D1 = '1d',
  W1 = '1w',
}

export interface MarketSummary {
  symbol: string;
  name: string; // Derived or mapped
  price: number;
  change24h: number; // Percent
  volume24h: number;
  high24h: number;
  low24h: number;
}

// --- DATABASE TYPES ---

export interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  first_name?: string;
  last_name?: string;
  secret_key?: string;
  role: 'user' | 'admin';
  is_2fa_enabled: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  currency: string;
  balance: number;
}

export interface Order {
  id: string;
  user_id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  price: number;
  amount: number;
  total: number;
  status: 'FILLED' | 'OPEN' | 'CANCELLED';
  created_at: string;
}