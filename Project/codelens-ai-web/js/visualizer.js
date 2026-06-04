// js/visualizer.js - Canvas-based Chart Engine

export class Visualizer {
  constructor(canvasSelector) {
    this.canvasSelector = canvasSelector;
    this.canvases = new Map();
    this.animations = new Map();
    this.resizeObservers = new Map();
    this.resizeDebounceTimers = new Map();
    this.tooltipEl = null;
    this._initTooltip();
  }

  _initTooltip() {
    const existing = document.querySelector('.cv-tooltip');
    if (existing) {
      this.tooltipEl = existing;
      return;
    }
    const el = document.createElement('div');
    el.className = 'cv-tooltip';
    Object.assign(el.style, {
      position: 'fixed',
      display: 'none',
      pointerEvents: 'none',
      zIndex: '9999',
      background: 'var(--color-bg, #1a1a2e)',
      color: 'var(--color-text, #e0e0e0)',
      border: '1px solid var(--color-accent, #7c3aed)',
      borderRadius: '6px',
      padding: '4px 10px',
      fontSize: '12px',
      fontFamily: 'monospace',
      whiteSpace: 'nowrap'
    });
    document.body.appendChild(el);
    this.tooltipEl = el;
  }

  _getCSSVar(el, name, fallback) {
    return getComputedStyle(el).getPropertyValue(name).trim() || fallback;
  }

  _setupCanvas(canvas, width, height) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = width || rect.width;
    const h = height || rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, w, h, dpr };
  }

  _registerResize(canvas, renderFn) {
    const key = this._canvasKey(canvas);
    const ro = new ResizeObserver(() => {
      if (this.resizeDebounceTimers.has(key)) {
        clearTimeout(this.resizeDebounceTimers.get(key));
      }
      this.resizeDebounceTimers.set(key, setTimeout(() => {
        renderFn();
      }, 150));
    });
    ro.observe(canvas);
    this.resizeObservers.set(key, ro);
  }

  _canvasKey(canvas) {
    return canvas.id || canvas.className || Math.random().toString(36).slice(2);
  }

  _cancelAnimations(canvas) {
    const key = this._canvasKey(canvas);
    if (this.animations.has(key)) {
      cancelAnimationFrame(this.animations.get(key));
      this.animations.delete(key);
    }
  }

  destroy() {
    for (const [key, raf] of this.animations) {
      cancelAnimationFrame(raf);
    }
    this.animations.clear();
    for (const [key, ro] of this.resizeObservers) {
      ro.disconnect();
    }
    this.resizeObservers.clear();
    for (const [key, timer] of this.resizeDebounceTimers) {
      clearTimeout(timer);
    }
    this.resizeDebounceTimers.clear();
    this.canvases.clear();
    if (this.tooltipEl && this.tooltipEl.parentNode) {
      this.tooltipEl.parentNode.removeChild(this.tooltipEl);
    }
  }

  // ─── Radar Chart ──────────────────────────────────────────────────────────

  renderRadarChart(canvas, dimensions) {
    this._cancelAnimations(canvas);
    const { ctx, w, h } = this._setupCanvas(canvas);
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.35;
    const count = dimensions.length;
    const angleStep = (Math.PI * 2) / count;
    const offset = -Math.PI / 2;

    const accent = this._getCSSVar(canvas, '--color-accent', '#7c3aed');
    const textColor = this._getCSSVar(canvas, '--color-text', '#e0e0e0');
    const gridColor = this._getCSSVar(canvas, '--color-muted', '#333');

    const labels = dimensions.map((d, i) => {
      const angle = offset + angleStep * i;
      return {
        label: d.label,
        angle,
        tipX: cx + Math.cos(angle) * radius,
        tipY: cy + Math.sin(angle) * radius
      };
    });

    const drawFrame = (progress) => {
      ctx.clearRect(0, 0, w, h);

      // concentric hexagons
      for (let ring = 1; ring <= 5; ring++) {
        const r = (radius / 5) * ring;
        ctx.beginPath();
        for (let i = 0; i < count; i++) {
          const angle = offset + angleStep * i;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.3 + ring * 0.05;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // axes
      for (let i = 0; i < count; i++) {
        const angle = offset + angleStep * i;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // data polygon (animated)
      const dataRadius = progress * radius;
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const d = dimensions[i];
        const ratio = d.max > 0 ? Math.min(d.value / d.max, 1) : 0;
        const r = dataRadius * ratio;
        const angle = offset + angleStep * i;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.15;
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.stroke();

      // data points
      for (let i = 0; i < count; i++) {
        const d = dimensions[i];
        const ratio = d.max > 0 ? Math.min(d.value / d.max, 1) : 0;
        const r = dataRadius * ratio;
        const angle = offset + angleStep * i;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = accent;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // labels
      ctx.font = '11px monospace';
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const lbl of labels) {
        const dist = radius + 18;
        const x = cx + Math.cos(lbl.angle) * dist;
        const y = cy + Math.sin(lbl.angle) * dist;
        ctx.fillText(lbl.label, x, y);
      }
    };

    const duration = 600;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      drawFrame(eased);
      if (progress < 1) {
        this.animations.set(this._canvasKey(canvas), requestAnimationFrame(animate));
      }
    };
    this.animations.set(this._canvasKey(canvas), requestAnimationFrame(animate));
    this._registerResize(canvas, () => this.renderRadarChart(canvas, dimensions));
  }

  // ─── Contribution Calendar ────────────────────────────────────────────────

  renderContributionCalendar(canvas, data) {
    this._cancelAnimations(canvas);
    const { ctx, w, h } = this._setupCanvas(canvas);

    const textColor = this._getCSSVar(canvas, '--color-text', '#e0e0e0');
    const muted = this._getCSSVar(canvas, '--color-muted', '#333');

    const cellSize = Math.floor((w - 60) / 53);
    const cellGap = 2;
    const cellStep = cellSize + cellGap;
    const cellHeight = Math.floor((h - 40) / 7);

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', ''];

    const dataMap = new Map();
    for (const item of data) {
      dataMap.set(item.date, item.count);
    }

    const getColor = (count) => {
      if (!count || count === 0) return 'rgba(0,0,0,0)';
      if (count <= 3) return 'rgba(74, 222, 128, 0.25)';
      if (count <= 6) return 'rgba(74, 222, 128, 0.5)';
      return 'rgba(74, 222, 128, 0.85)';
    };

    const startX = 50;
    const startY = 20;

    // month labels
    ctx.font = '10px monospace';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    let lastMonth = -1;
    for (let week = 0; week < 53; week++) {
      const date = new Date();
      date.setDate(date.getDate() - (53 * 7 - week * 7));
      const month = date.getMonth();
      if (month !== lastMonth) {
        const x = startX + week * cellStep;
        ctx.fillText(months[month], x, startY - 14);
        lastMonth = month;
      }
    }

    // day labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let day = 0; day < 7; day++) {
      if (dayLabels[day]) {
        const y = startY + day * cellStep + cellSize / 2;
        ctx.fillText(dayLabels[day], startX - 6, y);
      }
    }

    // cells
    const cellRects = [];
    const today = new Date();
    for (let week = 0; week < 53; week++) {
      for (let day = 0; day < 7; day++) {
        const d = new Date(today);
        d.setDate(d.getDate() - (53 * 7 - week * 7 - day));
        const dateStr = d.toISOString().slice(0, 10);
        const count = dataMap.get(dateStr) || 0;
        const x = startX + week * cellStep;
        const y = startY + day * cellStep;
        ctx.fillStyle = getColor(count);
        ctx.fillRect(x, y, cellSize, cellSize);
        ctx.strokeStyle = muted;
        ctx.lineWidth = 0.3;
        ctx.strokeRect(x, y, cellSize, cellSize);
        cellRects.push({ x, y, w: cellSize, h: cellSize, date: dateStr, count });
      }
    }

    // hit-test for tooltip
    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      let found = null;
      for (const c of cellRects) {
        if (mx >= c.x && mx <= c.x + c.w && my >= c.y && my <= c.y + c.h) {
          found = c;
          break;
        }
      }
      if (found) {
        this.tooltipEl.textContent = `${found.date} — ${found.count} contributions`;
        this.tooltipEl.style.display = 'block';
        this.tooltipEl.style.left = (e.clientX + 12) + 'px';
        this.tooltipEl.style.top = (e.clientY - 10) + 'px';
      } else {
        this.tooltipEl.style.display = 'none';
      }
    };

    this._registerResize(canvas, () => this.renderContributionCalendar(canvas, data));
  }

  // ─── Complexity Bar Chart ─────────────────────────────────────────────────

  renderComplexityChart(canvas, data) {
    this._cancelAnimations(canvas);
    const { ctx, w, h } = this._setupCanvas(canvas);

    const textColor = this._getCSSVar(canvas, '--color-text', '#e0e0e0');
    const muted = this._getCSSVar(canvas, '--color-muted', '#333');

    const pad = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;
    const maxScore = 10;
    const barCount = data.length;
    const barWidth = Math.min(Math.floor(chartW / barCount) - 2, 20);
    const gap = Math.max(2, (chartW - barWidth * barCount) / (barCount + 1));

    const getBarColor = (score) => {
      if (score <= 3) return '#4ade80';
      if (score <= 6) return '#fbbf24';
      return '#f87171';
    };

    const drawFrame = (progress) => {
      ctx.clearRect(0, 0, w, h);

      // Y axis
      ctx.strokeStyle = muted;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(pad.left, pad.top);
      ctx.lineTo(pad.left, pad.top + chartH);
      ctx.stroke();

      // Y axis ticks
      ctx.font = '10px monospace';
      ctx.fillStyle = textColor;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let i = 0; i <= 10; i += 2) {
        const y = pad.top + chartH - (i / maxScore) * chartH;
        ctx.fillText(String(i), pad.left - 8, y);
        ctx.strokeStyle = muted;
        ctx.lineWidth = 0.3;
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(pad.left + chartW, y);
        ctx.stroke();
      }

      // bars
      for (let i = 0; i < barCount; i++) {
        const item = data[i];
        const barH = (Math.min(item.score, maxScore) / maxScore) * chartH * progress;
        const x = pad.left + gap + i * (barWidth + gap);
        const y = pad.top + chartH - barH;
        const color = getBarColor(item.score);

        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth, barH);

        // label
        if (barCount <= 50 || i % 5 === 0) {
          ctx.fillStyle = textColor;
          ctx.font = '9px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(String(item.line), x + barWidth / 2, pad.top + chartH + 4);
        }
      }

      // axis label
      ctx.fillStyle = textColor;
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('Line Number', pad.left + chartW / 2, h - 8);
    };

    const duration = 500;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      drawFrame(eased);
      if (progress < 1) {
        this.animations.set(this._canvasKey(canvas), requestAnimationFrame(animate));
      }
    };
    this.animations.set(this._canvasKey(canvas), requestAnimationFrame(animate));
    this._registerResize(canvas, () => this.renderComplexityChart(canvas, data));
  }

  // ─── Dependency Graph (Force-directed) ────────────────────────────────────

  renderDependencyGraph(canvas, dependencies) {
    this._cancelAnimations(canvas);
    const { ctx, w, h } = this._setupCanvas(canvas);

    const textColor = this._getCSSVar(canvas, '--color-text', '#e0e0e0');
    const accent = this._getCSSVar(canvas, '--color-accent', '#7c3aed');
    const muted = this._getCSSVar(canvas, '--color-muted', '#333');

    // build node set and edges
    const nodes = new Map();
    const edges = [];

    for (const dep of dependencies) {
      if (!nodes.has(dep.node)) {
        nodes.set(dep.node, {
          id: dep.node,
          x: Math.random() * (w - 60) + 30,
          y: Math.random() * (h - 60) + 30,
          vx: 0, vy: 0,
          radius: 8 + Math.random() * 6
        });
      }
      for (const target of dep.dependsOn) {
        if (!nodes.has(target)) {
          nodes.set(target, {
            id: target,
            x: Math.random() * (w - 60) + 30,
            y: Math.random() * (h - 60) + 30,
            vx: 0, vy: 0,
            radius: 8 + Math.random() * 6
          });
        }
        edges.push({ source: dep.node, target });
      }
    }

    const nodeList = Array.from(nodes.values());
    const centerX = w / 2;
    const centerY = h / 2;
    const repulsion = 800;
    const attraction = 0.005;
    const damping = 0.85;

    // Run force simulation synchronously for ~100 iterations
    for (let iter = 0; iter < 100; iter++) {
      // reset forces
      for (const node of nodeList) {
        node.vx = 0;
        node.vy = 0;
      }

      // repulsion between all pairs
      for (let i = 0; i < nodeList.length; i++) {
        for (let j = i + 1; j < nodeList.length; j++) {
          const a = nodeList[i];
          const b = nodeList[j];
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          let dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = repulsion / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }
      }

      // attraction along edges
      for (const edge of edges) {
        const a = nodes.get(edge.source);
        const b = nodes.get(edge.target);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = dist * attraction;
        a.vx += dx * force;
        a.vy += dy * force;
        b.vx -= dx * force;
        b.vy -= dy * force;
      }

      // center gravity
      for (const node of nodeList) {
        node.vx += (centerX - node.x) * 0.001;
        node.vy += (centerY - node.y) * 0.001;
      }

      // apply forces
      for (const node of nodeList) {
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;
        node.x = Math.max(20, Math.min(w - 20, node.x));
        node.y = Math.max(20, Math.min(h - 20, node.y));
      }
    }

    // module type hash for color
    const moduleColors = ['#7c3aed', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];
    const nodeColors = new Map();
    for (const node of nodeList) {
      const hash = node.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      nodeColors.set(node.id, moduleColors[hash % moduleColors.length]);
    }

    // draw
    ctx.clearRect(0, 0, w, h);

    // edges
    ctx.strokeStyle = muted;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.5;
    for (const edge of edges) {
      const a = nodes.get(edge.source);
      const b = nodes.get(edge.target);
      if (!a || !b) continue;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // nodes
    for (const node of nodeList) {
      const color = nodeColors.get(node.id);
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.25;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // label
      ctx.font = '10px monospace';
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(node.id, node.x, node.y + node.radius + 4);
    }

    this._registerResize(canvas, () => this.renderDependencyGraph(canvas, dependencies));
  }

  // ─── Circular Progress ────────────────────────────────────────────────────

  renderCircularProgress(canvas, percent, color, label) {
    this._cancelAnimations(canvas);
    const { ctx, w, h } = this._setupCanvas(canvas);

    const textColor = this._getCSSVar(canvas, '--color-text', '#e0e0e0');
    const muted = this._getCSSVar(canvas, '--color-muted', '#333');

    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.35;
    const lineWidth = 10;

    const drawFrame = (progress) => {
      ctx.clearRect(0, 0, w, h);

      const currentPercent = percent * progress;
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + (Math.PI * 2) * (currentPercent / 100);

      // background ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = muted;
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      // gradient fill
      const gradient = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
      gradient.addColorStop(0, color || '#7c3aed');
      gradient.addColorStop(0.5, '#06b6d4');
      gradient.addColorStop(1, color || '#7c3aed');

      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      // percentage text
      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(currentPercent) + '%', cx, cy - 4);

      // label
      ctx.font = '11px monospace';
      ctx.fillStyle = textColor;
      ctx.globalAlpha = 0.7;
      ctx.fillText(label, cx, cy + 20);
      ctx.globalAlpha = 1;
    };

    const duration = 800;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      drawFrame(eased);
      if (progress < 1) {
        this.animations.set(this._canvasKey(canvas), requestAnimationFrame(animate));
      }
    };
    this.animations.set(this._canvasKey(canvas), requestAnimationFrame(animate));
    this._registerResize(canvas, () => this.renderCircularProgress(canvas, percent, color, label));
  }
}
