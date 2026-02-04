import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, CrosshairMode, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';
import { ChartDataPoint } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface ChartProps {
  data: ChartDataPoint[];
  isPositive?: boolean; 
}

const Chart: React.FC<ChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [legendData, setLegendData] = useState<ChartDataPoint | null>(null);
  const { resolvedTheme } = useTheme();

  // Colors based on theme
  const textColor = resolvedTheme === 'dark' ? '#94a3b8' : '#334155'; // Slate 400 vs Slate 700
  const gridColor = resolvedTheme === 'dark' ? '#1e293b' : '#e2e8f0'; // Slate 800 vs Slate 200
  const crosshairColor = resolvedTheme === 'dark' ? '#475569' : '#94a3b8';

  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (chartRef.current) {
        chartRef.current.remove();
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: textColor,
        fontFamily: 'Space Grotesk',
      },
      grid: {
        vertLines: { color: gridColor }, 
        horzLines: { color: gridColor },
      },
      width: chartContainerRef.current.clientWidth,
      height: 550, 
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
             width: 1,
             color: crosshairColor, 
             style: 3, 
             labelBackgroundColor: resolvedTheme === 'dark' ? '#f8fafc' : '#0f172a',
        },
        horzLine: {
             width: 1,
             color: crosshairColor,
             style: 3, 
             labelBackgroundColor: resolvedTheme === 'dark' ? '#f8fafc' : '#0f172a',
        }
      },
      timeScale: {
        borderColor: gridColor,
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: gridColor,
      },
    });

    chartRef.current = chart;

    // 1. Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981', // Emerald
      downColor: '#ef4444', // Red
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    // 2. Moving Average Series
    const ma7Series = chart.addSeries(LineSeries, {
      color: '#f59e0b', // Amber
      lineWidth: 1,
      crosshairMarkerVisible: false,
      title: 'MA(7)',
    });

    const ma25Series = chart.addSeries(LineSeries, {
      color: '#8b5cf6', // Violet
      lineWidth: 1,
      crosshairMarkerVisible: false,
      title: 'MA(25)',
    });

    const ma99Series = chart.addSeries(LineSeries, {
      color: resolvedTheme === 'dark' ? '#f8fafc' : '#0f172a', // White vs Black
      lineWidth: 2,
      crosshairMarkerVisible: false,
      title: 'MA(99)',
    });

    // 3. Volume Series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Overlay
    });
    
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8, 
        bottom: 0,
      },
    });

    const candlestickData = data.map(d => ({
      time: d.time as any,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    const volumeData = data.map(d => ({
      time: d.time as any,
      value: d.volume,
      color: d.close >= d.open ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
    }));

    const ma7Data = data.filter(d => d.ma7).map(d => ({ time: d.time as any, value: d.ma7! }));
    const ma25Data = data.filter(d => d.ma25).map(d => ({ time: d.time as any, value: d.ma25! }));
    const ma99Data = data.filter(d => d.ma99).map(d => ({ time: d.time as any, value: d.ma99! }));

    candleSeries.setData(candlestickData);
    volumeSeries.setData(volumeData);
    ma7Series.setData(ma7Data);
    ma25Series.setData(ma25Data);
    ma99Series.setData(ma99Data);

    if (data.length > 0) setLegendData(data[data.length - 1]);

    chart.subscribeCrosshairMove((param) => {
      if (param.time) {
        const item = data.find(d => d.time === param.time);
        if (item) setLegendData(item);
      } else if (data.length > 0) {
        setLegendData(data[data.length - 1]);
      }
    });

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) chartRef.current.remove();
    };
  }, [data, resolvedTheme]);

  return (
    <div className="relative w-full h-[550px]">
      {/* Legend Overlay */}
      <div className="absolute top-4 left-4 z-10 p-3 pointer-events-none font-mono text-xs bg-background/90 backdrop-blur-sm border border-border rounded shadow-sm">
         <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
            <span className="text-secondary">O <span className="text-primary font-bold">{legendData?.open.toFixed(2)}</span></span>
            <span className="text-secondary">H <span className="text-primary font-bold">{legendData?.high.toFixed(2)}</span></span>
            <span className="text-secondary">L <span className="text-primary font-bold">{legendData?.low.toFixed(2)}</span></span>
            <span className="text-secondary">C <span className={`font-bold ${legendData?.open && legendData.close > legendData.open ? 'text-emerald-600' : 'text-red-600'}`}>{legendData?.close.toFixed(2)}</span></span>
         </div>
         <div className="flex flex-wrap gap-4">
           <span className="text-amber-500 font-bold">MA(7) {legendData?.ma7?.toFixed(2) || '-'}</span>
           <span className="text-violet-500 font-bold">MA(25) {legendData?.ma25?.toFixed(2) || '-'}</span>
           <span className="text-primary font-bold">MA(99) {legendData?.ma99?.toFixed(2) || '-'}</span>
         </div>
      </div>
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
};

export default React.memo(Chart);