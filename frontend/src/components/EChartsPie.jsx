import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';

const DPR = typeof window !== 'undefined' ? window.devicePixelRatio || 2 : 2;

export default function EChartsPie({ asteroids, onClick, activeRisk }) {
  const data = useMemo(() => {
    const hazardous = asteroids.filter((a) => a.hazardous).length;
    const safe = asteroids.length - hazardous;
    return [
      { name: 'Hazardous', value: hazardous, color: '#f97316' },
      { name: 'Safe',      value: safe,      color: '#22c55e' },
    ];
  }, [asteroids]);

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
      formatter: (p) => [
        `<div style="font-weight:700;font-size:13px;color:#f8fafc;margin-bottom:8px">${p.name}</div>`,
        `<div style="display:flex;justify-content:space-between;gap:24px;margin-bottom:3px"><span style="color:#64748b">Count</span><span style="color:#f1f5f9;font-variant-numeric:tabular-nums">${p.value}</span></div>`,
        `<div style="display:flex;justify-content:space-between;gap:24px"><span style="color:#64748b">Share</span><span style="color:#f1f5f9;font-variant-numeric:tabular-nums">${p.percent}%</span></div>`,
        `<div style="margin-top:8px;padding-top:8px;border-top:1px solid #1e293b;color:${p.color};font-weight:600;font-size:11px">${p.name === 'Hazardous' ? '⚠ Hazardous' : '✓ Safe'}</div>`,
      ].join(''),
    },
    legend: {
      orient: 'horizontal',
      bottom: 4,
      itemHeight: 8,
      itemWidth: 8,
      itemGap: 20,
      textStyle: { color: '#64748b', fontSize: 11 },
    },
    series: [
      {
        name: 'Risk',
        type: 'pie',
        radius: ['48%', '72%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: '#0b1120', borderWidth: 2 },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{d}%',
          color: '#94a3b8',
          fontSize: 11,
          lineHeight: 16,
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 8,
          lineStyle: { color: '#334155' },
        },
        emphasis: {
          scale: true,
          scaleSize: 6,
          itemStyle: { shadowBlur: 16, shadowColor: 'rgba(0,0,0,0.3)' },
        },
        data: data.map((item) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: item.color,
            borderColor:
              activeRisk === item.name.toLowerCase() ? '#3b82f6' : '#0b1120',
            borderWidth: activeRisk === item.name.toLowerCase() ? 3 : 2,
          },
        })),
      },
    ],
  };

  const onEvents = {
    click: (p) => onClick && onClick(p.name === 'Hazardous' ? 'hazardous' : 'safe'),
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Risk Distribution</h3>
      <ReactECharts
        option={option}
        style={{ height: '290px', width: '100%' }}
        opts={{ devicePixelRatio: DPR, renderer: 'canvas' }}
        onEvents={onEvents}
      />
    </div>
  );
}
