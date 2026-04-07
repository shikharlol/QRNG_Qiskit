# QRNG — Quantum Random Number Generator
### Undergraduate Mini Project | Quantum Computing

---

## Overview

A fully functional Quantum Random Number Generator implemented as a web application using HTML, CSS, and JavaScript. The project simulates quantum superposition and wave function collapse to produce cryptographically-strong random numbers, visualizing the quantum process in real time.

---

## Files

```
quantum-rng/
├── index.html    — Main application page (structure & content)
├── style.css     — Stylesheet (dark theme, animations, responsive layout)
├── script.js     — Core logic (entropy, qubits, stats, visualization)
└── README.md     — This file
```

---

## How to Run

Simply open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).

No build tools, frameworks, or server required. Works entirely offline.

---

## Quantum Concepts Implemented

| Concept              | Implementation                                              |
|----------------------|-------------------------------------------------------------|
| Superposition        | Qubits animate between |0⟩ and |1⟩ states continuously    |
| Wave function collapse | Measurement freezes each qubit to a definite 0 or 1      |
| Hadamard gate        | Each qubit sampled with equal P(0) = P(1) = 0.5           |
| Born's rule          | Probability proportional to amplitude squared             |
| Shannon entropy      | H(X) = −Σ p log₂ p computed per measurement              |

---

## Entropy Source

The randomness is generated via `window.crypto.getRandomValues()` — the Web Cryptography API (NIST SP 800-90A compliant). This uses hardware-level entropy from CPU thermal noise, interrupt timing jitter, and OS entropy pools, making it the closest analog to true quantum randomness available in a browser.

In a physical quantum computer, a Hadamard gate would be applied to each qubit before measurement to create true quantum randomness.

---

## Features

- **Real-time qubit visualizer** — Shows each qubit collapsing from superposition to |0⟩ or |1⟩
- **Multi-format output** — Decimal, hexadecimal, and binary display
- **Configurable range** — Scale output to any [min, max] interval
- **Auto-measure mode** — Continuous generation at adjustable intervals
- **Measurement history** — Table of last 50 measurements with entropy scores
- **Distribution chart** — Live frequency histogram of generated numbers
- **Live bit stream** — Scrolling binary output visualization
- **Statistical analysis** — Mean, standard deviation, min/max, avg entropy
- **Theory section** — Explains superposition, collapse, Hadamard gate, Shannon entropy
- **PRNG vs QRNG comparison** — Side-by-side feature comparison

---

## Academic References

1. Nielsen, M. A., & Chuang, I. L. (2010). *Quantum Computation and Quantum Information*. Cambridge University Press.
2. Born, M. (1926). Zur Quantenmechanik der Stoßvorgänge. *Zeitschrift für Physik*, 37, 863–867.
3. Shannon, C. E. (1948). A mathematical theory of communication. *Bell System Technical Journal*, 27(3), 379–423.
4. NIST SP 800-90A Rev. 1 — Recommendation for Random Number Generation Using Deterministic Random Bit Generators.

---

## Technologies Used

- **HTML5** — Semantic structure
- **CSS3** — Custom properties, Grid, Flexbox, animations
- **Vanilla JavaScript (ES2022)** — No dependencies
- **Web Cryptography API** — `crypto.getRandomValues()` for quantum-grade entropy
- **Canvas 2D API** — Background field animation and distribution chart
- **Google Fonts** — IBM Plex Mono, Syne (loaded via CDN)
