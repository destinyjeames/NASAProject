import { useRef, useEffect, useMemo, useState, useCallback } from 'react';

const CLOSE_KM  = 10_000_000;
const MEDIUM_KM = 50_000_000;

const fmtDist = (km) =>
  km >= 1_000_000
    ? `${(km / 1_000_000).toFixed(2)}M km`
    : `${Math.round(km).toLocaleString()} km`;

// Stable star field — positions as 0-1 ratios resolved at draw time
const STARS = Array.from({ length: 130 }, () => ({
  rx: Math.random(),
  ry: Math.random(),
  r:  Math.random() * 1.1 + 0.25,
  a:  Math.random() * 0.45 + 0.08,
}));

function TooltipRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 3 }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ color: '#f1f5f9', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

export default function OrbitalMap({ asteroids, selectedAsteroid, onClick }) {
  const canvasRef = useRef(null);
  const hitMapRef = useRef([]);
  const animRef   = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  // Spread asteroids evenly by angle, sorted by distance for visual clarity
  const positioned = useMemo(() => {
    const sorted = [...asteroids].sort((a, b) => a.distance_km - b.distance_km);
    return sorted.map((a, i) => ({
      ...a,
      angle: (i / sorted.length) * Math.PI * 2 - Math.PI / 2,
    }));
  }, [asteroids]);

  const maxDiam = useMemo(
    () => (positioned.length ? Math.max(...positioned.map((a) => a.diameter)) : 1),
    [positioned],
  );

  // ── Core draw function (called every animation frame) ─────────────────────
  const draw = useCallback((sweep, pulse) => {
    const canvas = canvasRef.current;
    if (!canvas || !positioned.length) return;

    const dpr = window.devicePixelRatio || 2;
    const w   = canvas.offsetWidth;
    const h   = canvas.offsetHeight;

    // Only resize backing store when dimensions actually change
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // reset scale cleanly each frame
    ctx.clearRect(0, 0, w, h);

    const cx   = w / 2;
    const cy   = h / 2;
    const maxR = Math.min(cx, cy) - 44;

    const maxDist = Math.max(...positioned.map((a) => a.distance_km), MEDIUM_KM);
    const toR     = (dist) => Math.sqrt(dist / maxDist) * maxR;

    // ── Star field ────────────────────────────────────────────────────────────
    STARS.forEach((s) => {
      ctx.beginPath();
      ctx.arc(s.rx * w, s.ry * h, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(148,163,184,${s.a})`;
      ctx.fill();
    });

    // ── Concentric rings with tick marks ──────────────────────────────────────
    const rings = [
      { dist: CLOSE_KM,  label: '10M km', color: '#22c55e' },
      { dist: MEDIUM_KM, label: '50M km', color: '#f59e0b' },
      { dist: maxDist,   label: `${(maxDist / 1e6).toFixed(0)}M km`, color: '#475569' },
    ];

    rings.forEach(({ dist, label, color }) => {
      const r = toR(dist);

      // Dashed ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = color + '22';
      ctx.lineWidth   = 1;
      ctx.setLineDash([2, 10]);
      ctx.stroke();
      ctx.restore();

      // Cardinal tick marks
      for (let q = 0; q < 4; q++) {
        const ta = (q / 4) * Math.PI * 2;
        const nx = Math.cos(ta);
        const ny = Math.sin(ta);
        ctx.beginPath();
        ctx.moveTo(cx + nx * (r - 5), cy + ny * (r - 5));
        ctx.lineTo(cx + nx * (r + 5), cy + ny * (r + 5));
        ctx.strokeStyle = color + '44';
        ctx.lineWidth   = 1;
        ctx.stroke();
      }

      // Label at 45° (top-right quadrant, away from asteroids)
      const la = -Math.PI / 4;
      ctx.fillStyle    = color + '99';
      ctx.font         = '9px "SF Mono",ui-monospace,monospace';
      ctx.textAlign    = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, cx + Math.cos(la) * r + 7, cy + Math.sin(la) * r);
    });

    // ── Radar sweep ───────────────────────────────────────────────────────────
    const TRAIL = Math.PI * 0.45; // ~80° trailing glow
    for (let i = 0; i < 32; i++) {
      const t  = i / 32;
      const a1 = sweep - TRAIL * t;
      const a2 = sweep - TRAIL * (t + 1 / 32);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR + 2, a1, a2, true);
      ctx.closePath();
      ctx.fillStyle = `rgba(59,130,246,${(1 - t) * 0.065})`;
      ctx.fill();
    }
    // Leading edge
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sweep) * (maxR + 2), cy + Math.sin(sweep) * (maxR + 2));
    ctx.strokeStyle = 'rgba(96,165,250,0.55)';
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    // ── Earth ─────────────────────────────────────────────────────────────────
    // Outer atmosphere halo
    const haloGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 28);
    haloGrad.addColorStop(0, 'rgba(59,130,246,0.2)');
    haloGrad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.fillStyle = haloGrad;
    ctx.fill();

    // Globe body
    const earthGrad = ctx.createRadialGradient(cx - 4, cy - 4, 1, cx, cy, 13);
    earthGrad.addColorStop(0, '#bfdbfe');
    earthGrad.addColorStop(0.45, '#3b82f6');
    earthGrad.addColorStop(1, '#1e3a8a');
    ctx.beginPath();
    ctx.arc(cx, cy, 13, 0, Math.PI * 2);
    ctx.fillStyle = earthGrad;
    ctx.fill();

    // Land masses (clipped to globe)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 13, 0, Math.PI * 2);
    ctx.clip();
    [
      { dx: 3,  dy: -2, rx: 5.5, ry: 3.5, rot:  0.5 },
      { dx: -4, dy:  3, rx: 3,   ry: 2,   rot: -0.3 },
      { dx: 1,  dy:  5, rx: 2.5, ry: 1.5, rot:  0.1 },
    ].forEach(({ dx, dy, rx, ry, rot }) => {
      ctx.beginPath();
      ctx.ellipse(cx + dx, cy + dy, rx, ry, rot, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(21,128,61,0.65)';
      ctx.fill();
    });
    ctx.restore();

    // Atmosphere rim
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(147,197,253,0.4)';
    ctx.lineWidth   = 2.5;
    ctx.stroke();

    // EARTH label
    ctx.fillStyle    = '#7dd3fc';
    ctx.font         = 'bold 8px "SF Mono",ui-monospace,monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('EARTH', cx, cy + 17);

    // ── Asteroids ─────────────────────────────────────────────────────────────
    hitMapRef.current = [];

    positioned.forEach((a) => {
      const r          = toR(a.distance_km);
      const x          = cx + Math.cos(a.angle) * r;
      const y          = cy + Math.sin(a.angle) * r;
      const isSelected = selectedAsteroid === a.name;
      const color      = a.hazardous ? '#f97316' : '#22c55e';
      // Dot size scales with diameter (min 3 px, max 7 px)
      const dotR       = Math.max(3, Math.min(7, 3 + (a.diameter / maxDiam) * 4));

      // Hazardous: animated expanding ring
      if (a.hazardous) {
        const pr    = dotR + 2 + pulse * 11;
        const alpha = (1 - pulse) * 0.55;
        ctx.beginPath();
        ctx.arc(x, y, pr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(249,115,22,${alpha})`;
        ctx.lineWidth   = 1;
        ctx.stroke();
      }

      // Dot glow
      const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, dotR * 2.8);
      glowGrad.addColorStop(0, color + '55');
      glowGrad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(x, y, dotR * 2.8, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(x, y, dotR, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Selected: white ring + name label
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(x, y, dotR + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth   = 1.5;
        ctx.stroke();

        const onRight    = x >= cx;
        const lx         = onRight ? x + dotR + 10 : x - dotR - 10;
        ctx.fillStyle    = '#f1f5f9';
        ctx.font         = '10px "SF Mono",ui-monospace,monospace';
        ctx.textAlign    = onRight ? 'left' : 'right';
        ctx.textBaseline = 'middle';
        // Subtle background pill for readability
        const labelW = ctx.measureText(a.name).width;
        const lpad   = 4;
        const pillX  = onRight ? lx - lpad : lx - labelW - lpad;
        ctx.fillStyle = 'rgba(15,23,42,0.75)';
        ctx.beginPath();
        ctx.roundRect(pillX, y - 8, labelW + lpad * 2, 16, 3);
        ctx.fill();
        ctx.fillStyle = '#f1f5f9';
        ctx.fillText(a.name, lx, y);
      }

      hitMapRef.current.push({ x, y, hitR: dotR + 9, asteroid: a });
    });

  }, [positioned, selectedAsteroid, maxDiam]);

  // ── Animation loop ────────────────────────────────────────────────────────
  useEffect(() => {
    let sweep = -Math.PI / 2;
    let pulse = 0;
    let last  = 0;

    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last  = now;
      sweep += dt * 0.35; // one revolution ~18 s
      pulse  = (pulse + dt * 0.55) % 1;
      draw(sweep, pulse);
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  // ── Interaction ───────────────────────────────────────────────────────────
  const getHit = (e) => {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const mx     = e.clientX - rect.left;
    const my     = e.clientY - rect.top;
    for (const h of hitMapRef.current) {
      if (Math.hypot(mx - h.x, my - h.y) <= h.hitR) return { hit: h, mx, my };
    }
    return { hit: null, mx, my };
  };

  const handleMouseMove = (e) => {
    const { hit, mx, my } = getHit(e);
    setTooltip(hit ? { x: mx, y: my, asteroid: hit.asteroid } : null);
  };

  const handleClick = (e) => {
    const { hit } = getHit(e);
    onClick && onClick(hit ? hit.asteroid.name : null);
  };

  // Flip tooltip left when close to right edge
  const tooltipStyle = tooltip
    ? {
        position:       'absolute',
        left:           tooltip.x < 340 ? tooltip.x + 16 : 'auto',
        right:          tooltip.x < 340 ? 'auto' : '16px',
        top:            Math.max(8, tooltip.y - 20),
        background:     'rgba(11,17,32,0.96)',
        border:         '1px solid #334155',
        borderRadius:   10,
        padding:        '10px 14px',
        fontSize:       12,
        color:          '#f1f5f9',
        pointerEvents:  'none',
        zIndex:         10,
        minWidth:       190,
        boxShadow:      '0 8px 32px rgba(0,0,0,0.6)',
      }
    : null;

  return (
    <div className="chart-container" style={{ position: 'relative' }}>

      {/* Header row: title + inline legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
        <h3 className="chart-title" style={{ margin: 0 }}>Orbital Proximity Map</h3>
        <div style={{ display: 'flex', gap: '1.1rem', fontSize: 11, color: '#64748b', alignItems: 'center' }}>
          <span><span style={{ color: '#22c55e' }}>●</span> Safe</span>
          <span><span style={{ color: '#f97316' }}>●</span> Hazardous</span>
          <span style={{ color: '#475569', fontSize: 10 }}>dot size = diameter</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '430px', display: 'block', cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
        onClick={handleClick}
      />

      {tooltip && (
        <div style={tooltipStyle}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#f8fafc', marginBottom: 8 }}>
            {tooltip.asteroid.name}
          </div>
          <TooltipRow label="Distance" value={fmtDist(tooltip.asteroid.distance_km)} />
          <TooltipRow label="Speed"    value={`${tooltip.asteroid.speed_kph.toLocaleString()} km/h`} />
          <TooltipRow label="Diameter" value={`${tooltip.asteroid.diameter.toFixed(1)} m`} />
          <div style={{
            marginTop:   8,
            paddingTop:  8,
            borderTop:   '1px solid #1e293b',
            color:       tooltip.asteroid.hazardous ? '#f97316' : '#22c55e',
            fontWeight:  600,
            fontSize:    11,
          }}>
            {tooltip.asteroid.hazardous ? '⚠ Hazardous' : '✓ Safe'}
          </div>
        </div>
      )}

    </div>
  );
}
