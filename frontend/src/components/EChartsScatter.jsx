import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';

const DPR = typeof window !== 'undefined' ? window.devicePixelRatio || 2 : 2;

export default function EChartsScatter({ asteroids, onClick, selectedAsteroid }) {
  const { safeData, hazardData } = useMemo(() => {
    const safeData = asteroids
      .filter((a) => !a.hazardous)
      .map((a) => ({
        value: [a.distance_km, a.speed_kph, a.diameter],
        name: a.name,
        itemStyle:
          selectedAsteroid === a.name
            ? { color: '#22c55e', borderColor: '#fff', borderWidth: 2 }
            : undefined,
      }));
    const hazardData = asteroids
      .filter((a) => a.hazardous)
      .map((a) => ({
        value: [a.distance_km, a.speed_kph, a.diameter],
        name: a.name,
        itemStyle:
          selectedAsteroid === a.name
            ? { color: '#f97316', borderColor: '#fff', borderWidth: 2 }
            : undefined,
      }));
    return { safeData, hazardData };
  }, [asteroids, selectedAsteroid]);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(11,17,32,0.96)',
      borderColor: '#334155',
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: '#f1f5f9', fontSize: 12 },
      extraCssText: 'border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,0.6);',
      formatter: (params) => {
        const { name, value, seriesName } = params;
        const isHazardous = seriesName === 'Hazardous';
        const color = isHazardous ? '#f97316' : '#22c55e';
        return [
          `<div style="font-weight:700;font-size:13px;color:#f8fafc;margin-bottom:8px">${name}</div>`,
          `<div style="display:flex;justify-content:space-between;gap:24px;margin-bottom:3px"><span style="color:#64748b">Distance</span><span style="color:#f1f5f9;font-variant-numeric:tabular-nums">${(value[0] / 1_000_000).toFixed(2)}M km</span></div>`,
          `<div style="display:flex;justify-content:space-between;gap:24px;margin-bottom:3px"><span style="color:#64748b">Speed</span><span style="color:#f1f5f9;font-variant-numeric:tabular-nums">${value[1].toLocaleString()} km/h</span></div>`,
          `<div style="display:flex;justify-content:space-between;gap:24px"><span style="color:#64748b">Diameter</span><span style="color:#f1f5f9;font-variant-numeric:tabular-nums">${value[2].toFixed(1)} m</span></div>`,
          `<div style="margin-top:8px;padding-top:8px;border-top:1px solid #1e293b;color:${color};font-weight:600;font-size:11px">${isHazardous ? '⚠ Hazardous' : '✓ Safe'}</div>`,
        ].join('');
      },
    },
    legend: {
      data: [
        { name: 'Safe',      icon: 'circle' },
        { name: 'Hazardous', icon: 'circle' },
      ],
      top: 4,
      right: 8,
      orient: 'horizontal',
      itemGap: 20,
      itemHeight: 8,
      itemWidth: 8,
      textStyle: { color: '#64748b', fontSize: 11 },
    },
    grid: { left: 0, right: 16, top: 32, bottom: 28, containLabel: true },
    xAxis: {
      type: 'value',
      name: 'Distance (M km)',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: { color: '#475569', fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#64748b', fontSize: 11, formatter: (v) => `${(v / 1_000_000).toFixed(0)}M` },
      splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } },
    },
    yAxis: {
      type: 'value',
      name: 'Speed (km/h)',
      nameLocation: 'end',
      nameGap: 8,
      nameTextStyle: { color: '#475569', fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#64748b', fontSize: 11 },
      splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } },
    },
    series: [
      {
        name: 'Safe',
        type: 'scatter',
        itemStyle: { color: '#22c55e', opacity: 0.85 },
        data: safeData,
        symbolSize: (val) => Math.max(8, Math.min(22, Math.sqrt(val[2]) * 1.5)),
        emphasis: { scale: true, scaleSize: 5, itemStyle: { borderColor: '#fff', borderWidth: 1.5 } },
      },
      {
        name: 'Hazardous',
        type: 'scatter',
        itemStyle: { color: '#f97316', opacity: 0.9 },
        data: hazardData,
        symbolSize: (val) => Math.max(8, Math.min(22, Math.sqrt(val[2]) * 1.5)),
        emphasis: { scale: true, scaleSize: 5, itemStyle: { borderColor: '#fff', borderWidth: 1.5 } },
      },
    ],
  };

  const onEvents = { click: (p) => onClick && onClick(p.data.name) };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Speed vs Distance</h3>
      <ReactECharts
        option={option}
        style={{ height: '340px', width: '100%' }}
        opts={{ devicePixelRatio: DPR, renderer: 'canvas' }}
        onEvents={onEvents}
      />
    </div>
  );
}
