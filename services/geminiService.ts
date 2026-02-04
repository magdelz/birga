import { ChartDataPoint, MarketSummary } from "../types";

export const analyzeCryptoTrend = async (
  symbol: string,
  currentData: MarketSummary,
  history: ChartDataPoint[]
): Promise<string> => {
  void symbol;
  void currentData;
  void history;
  return "Trend analysis is not available.";
};