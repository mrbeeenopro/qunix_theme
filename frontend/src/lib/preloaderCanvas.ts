/**
 * Vector rendering for high-tech Qunix preloader styles:
 * - 'bar': Minimal Bar (glowing rounded bar with sliding gradient)
 * - 'circular': Orbit Rings (dual concentric counter-rotating arcs + white satellite dot + pulsing core)
 * - 'dots': Pulse Dots (5 sine-wave oscillating dots with scale/alpha breathing)
 * - 'cyber': Cyber Scanner (laser bounding box + vertical tick grid + sweeping laser beam + corner brackets)
 * - 'cube': Quantum Cube (3D perspective-projected wireframe cube with glowing edges and bright node vertices)
 * - 'wave': Equalizer Wave (7 vertical equalizer bars with sinusoidal height animation)
 */

export function drawPreloaderSpinner(
  ctx: CanvasRenderingContext2D,
  style: string,
  activeColor: string,
  cx: number,
  loaderY: number,
  time: number
): void {
  if (style === 'circular') {
    const orbitR1 = 20;
    const orbitR2 = 12;

    ctx.save();
    ctx.translate(cx, loaderY);
    ctx.rotate(time * 1.2);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = activeColor;
    ctx.shadowColor = activeColor;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, orbitR1, 0, Math.PI * 1.3);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(orbitR1 * Math.cos(Math.PI * 1.3), orbitR1 * Math.sin(Math.PI * 1.3), 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(cx, loaderY);
    ctx.rotate(-time * 1.5);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#bb9af7';
    ctx.shadowColor = '#bb9af7';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(0, 0, orbitR2, 0, Math.PI * 1.1);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(cx, loaderY);
    const coreScale = 3 + Math.sin(time * 2.0) * 1.0;
    ctx.fillStyle = activeColor;
    ctx.shadowColor = activeColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, coreScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (style === 'dots') {
    const dotCount = 5;
    const dotSpacing = 16;
    const totalW = (dotCount - 1) * dotSpacing;
    const startX = cx - totalW / 2;

    for (let i = 0; i < dotCount; i++) {
      const dx = startX + i * dotSpacing;
      const phase = time * 2.2 - i * 0.5;
      const dy = loaderY + Math.sin(phase) * 5;
      const scale = 3.2 + Math.sin(phase) * 0.9;
      const alpha = 0.4 + 0.6 * ((Math.sin(phase) + 1) / 2);

      ctx.save();
      ctx.fillStyle = activeColor;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = activeColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(dx, dy, Math.max(1, scale), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (style === 'cyber') {
    const scanW = 180;
    const scanH = 22;
    const sx = cx - scanW / 2;
    const sy = loaderY - scanH / 2;

    ctx.save();
    ctx.strokeStyle = `${activeColor}44`;
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.rect(sx, sy, scanW, scanH);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    for (let gx = sx + 15; gx < sx + scanW; gx += 15) {
      ctx.beginPath();
      ctx.moveTo(gx, sy);
      ctx.lineTo(gx, sy + scanH);
      ctx.stroke();
    }

    const sweep = ((Math.sin(time * 1.4) + 1) / 2) * (scanW - 24);
    const beamX = sx + 12 + sweep;
    const beamGrad = ctx.createLinearGradient(beamX - 16, sy, beamX + 16, sy);
    beamGrad.addColorStop(0, 'transparent');
    beamGrad.addColorStop(0.5, activeColor);
    beamGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = beamGrad;
    ctx.shadowColor = activeColor;
    ctx.shadowBlur = 12;
    ctx.fillRect(beamX - 16, sy, 32, scanH);

    ctx.strokeStyle = activeColor;
    ctx.lineWidth = 1.5;
    // Corner accents
    ctx.beginPath();
    ctx.moveTo(sx, sy + 5); ctx.lineTo(sx, sy); ctx.lineTo(sx + 5, sy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sx + scanW - 5, sy); ctx.lineTo(sx + scanW, sy); ctx.lineTo(sx + scanW, sy + 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sx, sy + scanH - 5); ctx.lineTo(sx, sy + scanH); ctx.lineTo(sx + 5, sy + scanH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sx + scanW - 5, sy + scanH); ctx.lineTo(sx + scanW, sy + scanH); ctx.lineTo(sx + scanW, sy + scanH - 5);
    ctx.stroke();
    ctx.restore();
  } else if (style === 'cube') {
    ctx.save();
    const size = 15;
    const rotX = time * 0.55;
    const rotY = time * 0.75;
    const rotZ = time * 0.35;

    const vertices = [
      [-size, -size, -size],
      [size, -size, -size],
      [size, size, -size],
      [-size, size, -size],
      [-size, -size, size],
      [size, -size, size],
      [size, size, size],
      [-size, size, size],
    ];

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    const projected: { x: number; y: number }[] = [];

    vertices.forEach(([x, y, z]) => {
      const x1 = x * Math.cos(rotY) + z * Math.sin(rotY);
      const z1 = -x * Math.sin(rotY) + z * Math.cos(rotY);
      const y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
      const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
      const x3 = x1 * Math.cos(rotZ) - y2 * Math.sin(rotZ);
      const y3 = x1 * Math.sin(rotZ) + y2 * Math.cos(rotZ);

      const fov = 180;
      const scale = fov / (fov + z2);
      projected.push({
        x: cx + x3 * scale,
        y: loaderY + y3 * scale,
      });
    });

    ctx.strokeStyle = activeColor;
    ctx.lineWidth = 1.6;
    ctx.shadowColor = activeColor;
    ctx.shadowBlur = 8;
    edges.forEach(([p1, p2]) => {
      ctx.beginPath();
      ctx.moveTo(projected[p1].x, projected[p1].y);
      ctx.lineTo(projected[p2].x, projected[p2].y);
      ctx.stroke();
    });

    ctx.fillStyle = '#ffffff';
    projected.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  } else if (style === 'wave') {
    const barCount = 7;
    const barSpacing = 7;
    const barW = 4;
    const totalW = barCount * barW + (barCount - 1) * (barSpacing - barW);
    const startX = cx - totalW / 2;

    for (let i = 0; i < barCount; i++) {
      const bx = startX + i * barSpacing;
      const phase = time * 2.5 + i * 0.55;
      const barH = 6 + 18 * Math.abs(Math.sin(phase));
      const by = loaderY - barH / 2;

      const grad = ctx.createLinearGradient(bx, by, bx, by + barH);
      grad.addColorStop(0, activeColor);
      grad.addColorStop(1, '#bb9af7');

      ctx.save();
      ctx.fillStyle = grad;
      ctx.shadowColor = activeColor;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(bx, by, barW, barH, 2);
      } else {
        ctx.rect(bx, by, barW, barH);
      }
      ctx.fill();
      ctx.restore();
    }
  } else {
    // Default: bar
    const barW = 160;
    const barH = 3.5;
    const rx = cx - barW / 2;
    const ry = loaderY - barH / 2;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(rx, ry, barW, barH, 2);
    } else {
      ctx.rect(rx, ry, barW, barH);
    }
    ctx.fill();

    const barWFill = barW * 0.42;
    const slideProgress = (time * 0.5) % 1.6;
    let fillX = rx - barWFill + (slideProgress / 1.6) * (barW + barWFill);
    fillX = Math.max(rx, Math.min(rx + barW - barWFill, fillX));

    const barGrad = ctx.createLinearGradient(fillX, ry, fillX + barWFill, ry);
    barGrad.addColorStop(0, activeColor);
    barGrad.addColorStop(1, '#bb9af7');

    ctx.save();
    ctx.shadowColor = activeColor;
    ctx.shadowBlur = 10;
    ctx.fillStyle = barGrad;
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(fillX, ry, barWFill, barH, 2);
    } else {
      ctx.rect(fillX, ry, barWFill, barH);
    }
    ctx.fill();
    ctx.restore();
  }
}

export function renderPreloaderCanvas(
  canvas: HTMLCanvasElement,
  style: string,
  color: string,
  width = 220,
  height = 70
): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  let animFrameId: number | null = null;
  let lastTimestamp = performance.now();
  let virtualTime = 0;
  const activeColor = color && color.trim() ? color.trim() : '#7aa2f7';

  const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const cx = width / 2;
  const cy = height / 2;

  const render = (now: number) => {
    // Delta-time smoothing: clamp delta to max 33ms so CPU freezes during load never cause skips or jerks
    const delta = Math.min(Math.max(0, (now - lastTimestamp) / 1000), 0.033);
    lastTimestamp = now;
    virtualTime += delta;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    drawPreloaderSpinner(ctx, style, activeColor, cx, cy, virtualTime);

    ctx.restore();
    animFrameId = requestAnimationFrame(render);
  };

  animFrameId = requestAnimationFrame(render);

  return () => {
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  };
}
