# QRNG_Qiskit
A browser-based Quantum Random Number Generator that simulates qubit superposition and wave function collapse to produce cryptographically-strong random numbers. Built with HTML, CSS, and JavaScript — no dependencies, no install.
# Overview
QRNG is an interactive web app that demonstrates core quantum computing principles — superposition, the Hadamard gate, and Born's rule — through a real-time random number generator. Randomness is sourced from window.crypto.getRandomValues(), a hardware-seeded entropy pool compliant with NIST SP 800-90A, making it the closest analog to true quantum randomness available in a browser.
Each "measurement" simulates n qubits collapsing from superposition into definite 0/1 states. The result is displayed in decimal, hexadecimal, and binary, alongside a live Shannon entropy score, frequency distribution histogram, and running statistics.
