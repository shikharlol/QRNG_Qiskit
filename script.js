/**
 * QRNG — Quantum Random Number Generator
 * Undergraduate Mini Project — JavaScript Core
 *
 * Entropy source: window.crypto.getRandomValues()
 * This uses the browser's cryptographically secure PRNG, which is seeded
 * from hardware-level entropy (CPU thermal noise, interrupt timing, etc.)
 * — the closest analog to true quantum randomness available in a browser.
 *
 * In a real quantum system, each qubit is initialized in state |0⟩,
 * a Hadamard gate creates equal superposition (|0⟩ + |1⟩)/√2,
 * and measurement collapses it to 0 or 1 with P=0.5 each.
 */

'use strict';

/* =============================================
   STATE
   ============================================= */
const state = {
  numQubits:  8,
  minVal:     0,
  maxVal:     255,
  autoRate:   1000,
  autoTimer:  null,
  history:    [],
  lastBits:   '',
  lastDecimal: null,
  superTimer: null,
  chartBuckets: [],
  bitStreamBits: '',
};

/* =============================================
   QUANTUM ENTROPY SOURCE
   ============================================= */

/**
 * Returns a cryptographically secure random float in [0, 1).
 * Uses Uint32Array from Web Crypto API.
 */
function quantumFloat() {
  const buf = new Uint32Array(1);
  window.crypto.getRandomValues(buf);
  return buf[0] / (0xFFFFFFFF + 1);
}

/**
 * Simulates measurement of n qubits, each in equal superposition.
 * Returns an array of 0/1 bits (quantum measurement outcomes).
 */
function measureQubits(n) {
  const bits = [];
  const buf = new Uint8Array(Math.ceil(n / 8));
  window.crypto.getRandomValues(buf);
  for (let i = 0; i < n; i++) {
    const byte = buf[Math.floor(i / 8)];
    bits.push((byte >> (i % 8)) & 1);
  }
  return bits;
}

/**
 * Converts a bit array to an integer.
 */
function bitsToInt(bits) {
  return bits.reduce((acc, b, i) => acc + (b << (bits.length - 1 - i)), 0);
}

/**
 * Scales a raw integer from [0, 2^n - 1] to [min, max].
 */
function scaleToRange(rawInt, n, min, max) {
  const maxRaw = Math.pow(2, n) - 1;
  return Math.round(min + (rawInt / maxRaw) * (max - min));
}

/**
 * Computes Shannon entropy of a bit array (bits per symbol).
 * Max entropy = 1.0 (perfectly balanced 0s and 1s).
 */
function shannonEntropy(bits) {
  const n = bits.length;
  if (n === 0) return 0;
  const ones  = bits.filter(b => b === 1).length;
  const zeros = n - ones;
  const p1 = ones  / n;
  const p0 = zeros / n;
  let H = 0;
  if (p1 > 0) H -= p1 * Math.log2(p1);
  if (p0 > 0) H -= p0 * Math.log2(p0);
  return H; // 0.0 to 1.0
}

/* =============================================
   QUBIT VISUALIZER
   ============================================= */

function buildQubitGrid() {
  const grid = document.getElementById('qubit-grid');
  grid.innerHTML = '';
  for (let i = 0; i < state.numQubits; i++) {
    const cell = document.createElement('div');
    cell.className = 'qubit-cell sup';
    cell.id = `qc-${i}`;
    cell.innerHTML = `
      <div class="qc-idx">q${i}</div>
      <div class="qc-state">±</div>
      <div class="qc-bar"><div class="qc-bar-fill" style="width:50%"></div></div>
    `;
    grid.appendChild(cell);
  }
}

function animateSuperposition() {
  if (state.superTimer) clearInterval(state.superTimer);
  state.superTimer = setInterval(() => {
    for (let i = 0; i < state.numQubits; i++) {
      const cell = document.getElementById(`qc-${i}`);
      if (!cell || !cell.classList.contains('sup')) continue;
      const prob = quantumFloat();
      const fill = cell.querySelector('.qc-bar-fill');
      const stateEl = cell.querySelector('.qc-state');
      if (fill)    fill.style.width = (30 + prob * 40) + '%';
      if (stateEl) stateEl.textContent = prob > 0.5 ? '|1⟩' : '|0⟩';
    }
  }, 100);
}

function collapseQubitCells(bits) {
  bits.forEach((b, i) => {
    const cell = document.getElementById(`qc-${i}`);
    if (!cell) return;
    cell.className = `qubit-cell ${b === 1 ? 'c1' : 'c0'}`;
    const stateEl = cell.querySelector('.qc-state');
    if (stateEl) stateEl.textContent = b === 1 ? '|1⟩' : '|0⟩';
  });
  setTimeout(() => {
    for (let i = 0; i < state.numQubits; i++) {
      const cell = document.getElementById(`qc-${i}`);
      if (cell) cell.className = 'qubit-cell sup';
    }
  }, 650);
}

/* =============================================
   MEASURE — MAIN ACTION
   ============================================= */

function measure() {
  const bits    = measureQubits(state.numQubits);
  const rawInt  = bitsToInt(bits);
  const scaled  = scaleToRange(rawInt, state.numQubits, state.minVal, state.maxVal);
  const entropy = shannonEntropy(bits);
  const bitStr  = bits.join('');
  const hexStr  = rawInt.toString(16).toUpperCase().padStart(Math.ceil(state.numQubits / 4), '0');

  state.lastBits    = bitStr;
  state.lastDecimal = scaled;

  collapseQubitCells(bits);
  updateOutput(scaled, hexStr, bits, entropy);
  addToHistory(scaled, hexStr, bitStr, entropy);
  updateBitStream(bitStr);
  updateStats();
  updateChart(scaled);
}

/* =============================================
   OUTPUT DISPLAY
   ============================================= */

function flashEl(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), 120);
}

function updateOutput(decimal, hex, bits, entropy) {
  flashEl('out-decimal');
  flashEl('out-hex');
  flashEl('out-bin');

  setTimeout(() => {
    document.getElementById('out-decimal').textContent = decimal;
    document.getElementById('out-hex').textContent = '0x' + hex;

    const binEl = document.getElementById('out-bin');
    binEl.innerHTML = bits.map(b =>
      `<span class="${b === 1 ? 'bit-1' : 'bit-0'}">${b}</span>`
    ).join('');

    const pct = Math.round(entropy * 100);
    document.getElementById('entropy-fill').style.width = pct + '%';
    document.getElementById('entropy-pct').textContent = pct + '%';
  }, 120);
}

/* =============================================
   HISTORY
   ============================================= */

function addToHistory(decimal, hex, bitStr, entropy) {
  state.history.unshift({
    n: state.history.length + 1,
    decimal,
    hex,
    bitStr,
    bits: state.numQubits,
    entropy: Math.round(entropy * 100),
  });
  if (state.history.length > 200) state.history.pop();
  renderHistory();
  document.getElementById('history-count').textContent =
    state.history.length + ' sample' + (state.history.length !== 1 ? 's' : '');
}

function renderHistory() {
  const tbody = document.getElementById('history-body');
  if (state.history.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6">No measurements yet. Click <strong>Measure Qubits</strong> to begin.</td></tr>`;
    return;
  }
  tbody.innerHTML = state.history.slice(0, 50).map(h => `
    <tr>
      <td>${h.n}</td>
      <td>${h.decimal}</td>
      <td>${'0x' + h.hex}</td>
      <td style="font-size:10px; letter-spacing:0.04em">${h.bitStr}</td>
      <td>${h.bits}</td>
      <td>${h.entropy}%</td>
    </tr>
  `).join('');
}

/* =============================================
   BIT STREAM
   ============================================= */

function updateBitStream(newBits) {
  state.bitStreamBits = (newBits + state.bitStreamBits).slice(0, 512);
  const bsEl = document.getElementById('bitstream');
  bsEl.innerHTML = state.bitStreamBits.split('').map(b =>
    `<span class="${b === '1' ? 'b1' : 'b0'}">${b}</span>`
  ).join('');
}

/* =============================================
   STATISTICS
   ============================================= */

function updateStats() {
  const nums = state.history.map(h => h.decimal);
  if (nums.length === 0) return;

  const count  = nums.length;
  const mean   = nums.reduce((a,b) => a+b, 0) / count;
  const variance = nums.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / count;
  const std    = Math.sqrt(variance);
  const min    = Math.min(...nums);
  const max    = Math.max(...nums);
  const avgEnt = Math.round(state.history.reduce((a,h) => a + h.entropy, 0) / count);

  document.getElementById('stat-count').textContent   = count;
  document.getElementById('stat-mean').textContent    = mean.toFixed(1);
  document.getElementById('stat-std').textContent     = std.toFixed(1);
  document.getElementById('stat-min').textContent     = min;
  document.getElementById('stat-max').textContent     = max;
  document.getElementById('stat-entropy').textContent = avgEnt + '%';

  // Uniformity: coefficient of variation (lower = more uniform)
  const cv = mean > 0 ? (std / mean) : 0;
  const uniformity = Math.max(0, Math.round((1 - cv / 0.6) * 100));
  document.getElementById('uniformity-score').textContent = uniformity + '%';
}

/* =============================================
   DISTRIBUTION CHART
   ============================================= */

function initChart() {
  const BUCKETS = 20;
  state.chartBuckets = new Array(BUCKETS).fill(0);
  drawChart();
}

function updateChart(val) {
  const BUCKETS = state.chartBuckets.length;
  const range   = state.maxVal - state.minVal;
  if (range === 0) return;
  const idx = Math.min(BUCKETS - 1, Math.floor(((val - state.minVal) / range) * BUCKETS));
  state.chartBuckets[idx]++;
  drawChart();

  document.getElementById('chart-label-left').textContent  = state.minVal;
  document.getElementById('chart-label-right').textContent = state.maxVal;
}

function drawChart() {
  const canvas  = document.getElementById('dist-chart');
  const ctx     = canvas.getContext('2d');
  const W = canvas.offsetWidth || 600;
  const H = 200;
  canvas.width  = W;
  canvas.height = H;

  ctx.clearRect(0, 0, W, H);

  const buckets = state.chartBuckets;
  const maxB    = Math.max(...buckets, 1);
  const n       = buckets.length;
  const barW    = W / n;
  const pad     = 2;

  // Ideal line
  const ideal = (state.history.length / n);
  const idealY = H - (ideal / maxB) * (H - 20) - 10;
  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = 'rgba(255,170,0,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, idealY);
  ctx.lineTo(W, idealY);
  ctx.stroke();
  ctx.restore();

  // Bars
  buckets.forEach((v, i) => {
    const x = i * barW + pad;
    const bh = Math.max(2, (v / maxB) * (H - 20));
    const y  = H - bh - 10;
    const t  = i / (n - 1);
    // Gradient from cyan → purple → green
    const r = Math.round(0   + t * 179);
    const g = Math.round(212 - t * 76);
    const b = Math.round(255 - t * 95);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.roundRect(x, y, barW - pad * 2, bh, [3, 3, 0, 0]);
    ctx.fill();

    // Count label on tallest bar
    if (v === maxB && v > 0) {
      ctx.globalAlpha = 0.6;
      ctx.fillStyle   = '#fff';
      ctx.font        = '9px "IBM Plex Mono"';
      ctx.textAlign   = 'center';
      ctx.fillText(v, x + (barW - pad * 2) / 2, y - 3);
    }
  });
  ctx.globalAlpha = 1;
}

/* =============================================
   AUTO MODE
   ============================================= */

function toggleAuto() {
  const btn = document.getElementById('btn-auto');
  if (state.autoTimer) {
    clearInterval(state.autoTimer);
    state.autoTimer = null;
    btn.innerHTML = '<span class="btn-icon">▶</span> Auto Mode';
    btn.classList.remove('active');
    document.getElementById('status-text').textContent = 'Superposition active';
  } else {
    measure();
    state.autoTimer = setInterval(measure, state.autoRate);
    btn.innerHTML = '<span class="btn-icon">■</span> Stop Auto';
    btn.classList.add('active');
    document.getElementById('status-text').textContent = 'Auto-measuring...';
  }
}

/* =============================================
   COPY / CLEAR
   ============================================= */

function copyLast() {
  if (state.lastDecimal === null) return;
  navigator.clipboard.writeText(String(state.lastDecimal)).catch(() => {});
  const btn = event.currentTarget;
  const orig = btn.innerHTML;
  btn.innerHTML = '<span class="btn-icon">✓</span> Copied!';
  setTimeout(() => { btn.innerHTML = orig; }, 1200);
}

function clearAll() {
  state.history = [];
  state.bitStreamBits = '';
  state.lastDecimal = null;
  state.lastBits = '';
  state.chartBuckets = new Array(20).fill(0);

  document.getElementById('out-decimal').textContent = '—';
  document.getElementById('out-hex').textContent     = '—';
  document.getElementById('out-bin').textContent     = '—';
  document.getElementById('entropy-fill').style.width = '0%';
  document.getElementById('entropy-pct').textContent  = '0%';
  document.getElementById('history-count').textContent = '0 samples';
  document.getElementById('bitstream').innerHTML = '';
  document.getElementById('stat-count').textContent   = '0';
  ['stat-mean','stat-std','stat-min','stat-max','stat-entropy','uniformity-score']
    .forEach(id => { document.getElementById(id).textContent = '—'; });
  renderHistory();
  drawChart();
}

/* =============================================
   CONTROLS
   ============================================= */

function bindControls() {
  const bind = (id, valId, key, fmt) => {
    const el = document.getElementById(id);
    const vl = document.getElementById(valId);
    el.addEventListener('input', () => {
      const v = parseInt(el.value);
      state[key] = v;
      vl.textContent = fmt ? fmt(v) : v;
      if (key === 'numQubits') {
        buildQubitGrid();
        animateSuperposition();
        state.chartBuckets = new Array(20).fill(0);
        drawChart();
        if (state.autoTimer) {
          clearInterval(state.autoTimer);
          state.autoTimer = setInterval(measure, state.autoRate);
        }
      }
      if (key === 'autoRate' && state.autoTimer) {
        clearInterval(state.autoTimer);
        state.autoTimer = setInterval(measure, state.autoRate);
      }
      if (key === 'minVal' || key === 'maxVal') {
        state.chartBuckets = new Array(20).fill(0);
        drawChart();
      }
    });
  };
  bind('ctrl-qubits', 'val-qubits', 'numQubits');
  bind('ctrl-min',    'val-min',    'minVal');
  bind('ctrl-max',    'val-max',    'maxVal');
  bind('ctrl-rate',   'val-rate',   'autoRate', v => v + ' ms');
}

/* =============================================
   BACKGROUND CANVAS — QUANTUM FIELD
   ============================================= */

function initFieldCanvas() {
  const canvas = document.getElementById('field-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x:    Math.random() * W,
      y:    Math.random() * H,
      vx:   (Math.random() - 0.5) * 0.3,
      vy:   (Math.random() - 0.5) * 0.3,
      r:    Math.random() * 1.5 + 0.3,
      life: Math.random(),
      decay: 0.002 + Math.random() * 0.003,
      hue:  Math.random() > 0.5 ? 190 : 160, // cyan or green
    };
  }

  function initParticles() {
    particles = Array.from({ length: 120 }, createParticle);
  }

  function drawField() {
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) {
          const alpha = (1 - dist/120) * 0.08;
          ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach((p, idx) => {
      p.x += p.vx; p.y += p.vy; p.life -= p.decay;
      if (p.life <= 0 || p.x < 0 || p.x > W || p.y < 0 || p.y > H) {
        particles[idx] = createParticle();
        return;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue},100%,70%,${p.life * 0.5})`;
      ctx.fill();
    });

    requestAnimationFrame(drawField);
  }

  resize();
  initParticles();
  drawField();
  window.addEventListener('resize', () => { resize(); initParticles(); });
}

/* =============================================
   INIT
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  buildQubitGrid();
  animateSuperposition();
  bindControls();
  initChart();
  initFieldCanvas();
});

window.addEventListener('resize', drawChart);
