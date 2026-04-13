import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';

const DPR = typeof window !== 'undefined' ? window.devicePixelRatio || 2 : 2;
const BIN_KM = 10_000_000; // 10 M km per bucket

// Proximity-aware colour: green → amber → blue → slate as distance grows
const binColor = (lo) => {
  if (lo < 20_000_000)  return '#22c55e'; // 0–20 M  green
  if (lo < 50_000_000)  return '#f59e0b'; // 20–50 M amber
  if (lo < 100_000_000) return '#3b82f6'; // 50–100M blue
  return '#64748b';                        // 100 M+  slate
};

export default function EChartsBar({ asteroids, onClick, activeDistance }) {
  const bins = useMemo(() => {
    if (!asteroids.length) return [];
    const maxDist = Math.max(...asteroids.map((a) => a.distance_km));
    const numBins = Math.ceil(maxDist / BIN_KM);
    return Array.from({ length: numBins }, (_, i) => {
      const lo    = i * BIN_KM;
      const hi    = lo + BIN_KM;
      const count = asteroids.filter((a) => a.distance_km >= lo && a.distance_km < hi).length;
      return { lo, hi, count };
    });
  }, [asteroids]);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(255,255,255,0.04)' } },
      backgroundColor: 'rgba(11,17,32,0.96)',
      borderColor: '#334155',
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: '#f1f5f9', fontSize: 12 },
      extraCssText: 'border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,0.6);',
      formatter: (params) => {
        const p   = params[0];
        const bin = bins[p.dataIndex];
        if (!bin) return '';
        const lo  = (bin.lo / 1_000_000).toFixed(0);
        const hi  = (bin.hi / 1_000_000).toFixed(0);
        const pct = asteroids.length
          ? ((bin.count / asteroids.length) * 100).toFixed(1)
          : '0';
        const color = binColor(bin.lo);
        return [
          `<div style="font-weight:700;font-size:13px;color:#f8fafc;margin-bottom:8px">${lo}M – ${hi}M km</div>`,
          `<div style="display:flex;justify-content:space-between;gap:24px;margin-bottom:3px"><span style="color:#64748b">Asteroids</span><span style="color:#f1f5f9;font-variant-numeric:tabular-nums">${bin.count}</span></div>`,
          `<div style="display:flex;justify-content:space-between;gap:24px"><span style="color:#64748b">Share</span><span style="color:#f1f5f9;font-variant-numeric:tabular-nums">${pct}%</span></div>`,
          `<div style="margin-top:8px;padding-top:8px;border-top:1px solid #1e293b;color:${color};font-weight:600;font-size:11px">● ${lo}M – ${hi}M km band</div>`,
        ].join('');
      },
    },
    grid: { left: 0, right: 12, top: 20, bottom: 28, containLabel: true },
    xAxis: {
      type: 'category',
      data: bins.map((b) => `${(b.lo / 1_000_000).toFixed(0)}M`),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#64748b',
        fontSize: 10,
        // when many bins, skip alternating labels to avoid overlap
        interval: bins.length > 10 ? 1 : 0,
      },
      name: 'km from Earth',
      nameLocation: 'middle',
      nameGap: 22,
      nameTextStyle: { color: '#475569', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#64748b', fontSize: 11 },
      splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } },
    },
    series: [
      {
        type: 'bar',
        barWidth: '82%',
        data: bins.map((bin) => {
          const isActive = activeDistance && activeDistance.lo === bin.lo;
          const dimmed   = activeDistance && !isActive;
          return {
            value: bin.count,
            itemStyle: {
              color:        binColor(bin.lo),
              borderRadius: [4, 4, 0, 0],
              opacity:      dimmed ? 0.22 : 1,
            },
            label: {
              show:      bin.count > 0,
              position:  'top',
              color:     '#64748b',
              fontSize:  10,
              fontWeight: 600,
              formatter: '{c}',
            },
          };
        }),
      },
    ],
  };

  const onEvents = {
    click: (p) => {
      const bin = bins[p.dataIndex];
      if (bin) onClick && onClick({ lo: bin.lo, hi: bin.hi });
    },
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Distance Histogram</h3>
      <ReactECharts
        option={option}
        style={{ height: '290px', width: '100%' }}
        opts={{ devicePixelRatio: DPR, renderer: 'canvas' }}
        onEvents={onEvents}
      />
    </div>
  );
}
