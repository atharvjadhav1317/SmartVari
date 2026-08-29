import { FormEvent, useState, type ReactNode } from 'react';

// ============= VIBRANT HACKATHON PITCH DECK STYLES =============
const premiumStyles = `
  :root {
    --accent-cyan: #00d2ff;
    --accent-emerald: #4facfe;
    --accent-orange: #ff5e62;
    --accent-purple: #e100ff;
    --glow-cyan: rgba(0, 210, 255, 0.5);
    --glow-emerald: rgba(79, 172, 254, 0.5);
    --glow-orange: rgba(255, 94, 98, 0.5);
    --glow-purple: rgba(225, 0, 255, 0.5);
    --bg-dark: #f2f2ec;
    --bg-card: #151c2c;
    --bg-card-light: #1a2238;
    --glass-bg: rgba(21, 28, 44, 0.8);
    --glass-border: rgba(0, 210, 255, 0.2);
    --transition-smooth: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* GLASSMORPHISM HEADER - DARK VIBRANT */
  .app-shell header {
    backdrop-filter: blur(16px) !important;
    background: linear-gradient(135deg, rgba(11, 15, 25, 0.95), rgba(21, 28, 44, 0.9)) !important;
    border-bottom: 1px solid var(--accent-cyan) !important;
    box-shadow: 0 0 40px rgba(0, 210, 255, 0.15), 0 8px 32px rgba(0, 0, 0, 0.5) !important;
    transition: var(--transition-smooth);
  }

  .app-shell header h1 {
    color: #ffffff !important;
    text-shadow: 0 0 20px rgba(0, 210, 255, 0.3) !important;
  }

  /* ENHANCED CARD SYSTEM WITH VIBRANT GLOW */
  .ui-card, .metric-card, .card, .request-card, .zone-box {
    transition: var(--transition-smooth);
    position: relative;
    overflow: hidden;
  }

  .card {
    backdrop-filter: blur(12px) !important;
    background: linear-gradient(135deg, rgba(21, 28, 44, 0.8), rgba(26, 34, 56, 0.7)) !important;
    border: 1.5px solid rgba(0, 210, 255, 0.15) !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1) !important;
    color: #ffffff !important;
  }

  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 0 30px rgba(0, 210, 255, 0.3), 0 12px 48px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1) !important;
    border-color: rgba(0, 210, 255, 0.4) !important;
  }

  .card.focused {
    border-color: var(--accent-cyan) !important;
    box-shadow: 0 0 40px var(--glow-cyan), 0 0 80px rgba(0, 210, 255, 0.2), 0 12px 48px rgba(0, 0, 0, 0.6) !important;
    background: linear-gradient(135deg, rgba(0, 210, 255, 0.08), rgba(79, 172, 254, 0.05)) !important;
  }

  /* METRIC CARDS - VIBRANT GRADIENTS */
  .stats article {
    transition: var(--transition-smooth);
    backdrop-filter: blur(12px) !important;
    background: linear-gradient(135deg, rgba(21, 28, 44, 0.85), rgba(26, 34, 56, 0.75)) !important;
    border: 1.5px solid rgba(0, 210, 255, 0.15) !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1) !important;
    cursor: pointer;
    color: #ffffff !important;
  }

  .stats article strong {
    background: linear-gradient(135deg, var(--accent-cyan), var(--accent-emerald)) !important;
    -webkit-background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    background-clip: text !important;
    font-size: 2.2rem !important;
  }

  .stats article:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 0 35px rgba(0, 210, 255, 0.35), 0 12px 48px rgba(0, 0, 0, 0.5) !important;
    border-color: rgba(0, 210, 255, 0.5) !important;
  }

  .stats article.focused {
    border-color: var(--accent-cyan) !important;
    box-shadow: 0 0 50px var(--glow-cyan), 0 0 100px rgba(0, 210, 255, 0.2), 0 12px 48px rgba(0, 0, 0, 0.6) !important;
    background: linear-gradient(135deg, rgba(0, 210, 255, 0.1), rgba(79, 172, 254, 0.06)) !important;
  }

  /* REQUEST CARDS - VIBRANT ORANGE ACCENT */
  .request {
    transition: var(--transition-smooth);
    backdrop-filter: blur(10px);
    background: linear-gradient(135deg, rgba(21, 28, 44, 0.8), rgba(26, 34, 56, 0.7)) !important;
    border: 1.5px solid rgba(255, 94, 98, 0.2) !important;
    cursor: pointer;
    color: #ffffff !important;
  }

  .request:hover {
    transform: translateY(-3px);
    box-shadow: 0 0 30px rgba(255, 94, 98, 0.25), 0 8px 32px rgba(0, 0, 0, 0.4) !important;
    border-color: rgba(255, 94, 98, 0.5) !important;
  }

  .request.focused {
    border-color: var(--accent-orange) !important;
    box-shadow: 0 0 40px var(--glow-orange), 0 0 80px rgba(255, 94, 98, 0.15), 0 8px 32px rgba(0, 0, 0, 0.5) !important;
    background: linear-gradient(135deg, rgba(255, 94, 98, 0.1), rgba(255, 94, 98, 0.05)) !important;
  }

  .request-avatar {
    background: linear-gradient(135deg, var(--accent-orange), #ff7a7e) !important;
    color: white !important;
    font-weight: 700 !important;
  }

  /* SIDEBAR - DARK VIBRANT GRADIENT */
  .sidebar {
    background: linear-gradient(180deg, #0f1624 0%, #141d2f 100%) !important;
    backdrop-filter: blur(12px);
    box-shadow: 2px 0 30px rgba(0, 0, 0, 0.6), inset -1px 0 1px rgba(0, 210, 255, 0.1) !important;
    border-right: 1px solid var(--glass-border) !important;
  }

  .sidebar .brand span {
    color: #ffffff !important;
    text-shadow: 0 0 15px var(--glow-cyan) !important;
  }

  .sidebar .brand-mark {
    background: linear-gradient(135deg, var(--accent-cyan), var(--accent-emerald)) !important;
  }

  /* BUTTON ENHANCEMENTS - VIBRANT ACTIONS */
  button {
    transition: var(--transition-smooth);
  }

  button:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  button:active:not(:disabled) {
    transform: scale(0.96);
  }

  .accept {
    background: linear-gradient(135deg, var(--accent-emerald), #3a9dfc) !important;
    border: 1px solid rgba(79, 172, 254, 0.5) !important;
    color: #ffffff !important;
    font-weight: 700 !important;
    transition: var(--transition-smooth);
  }

  .accept:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 30px rgba(79, 172, 254, 0.4), 0 8px 20px rgba(79, 172, 254, 0.2) !important;
  }

  .accept:active {
    transform: scale(0.96);
  }

  .reject {
    background: rgba(255, 94, 98, 0.1) !important;
    border: 1px solid var(--accent-orange) !important;
    color: var(--accent-orange) !important;
    transition: var(--transition-smooth);
  }

  .reject:hover {
    background: rgba(255, 94, 98, 0.2) !important;
    box-shadow: 0 0 20px rgba(255, 94, 98, 0.25) !important;
  }

  .outline-button, .text-button {
    transition: var(--transition-smooth);
    color: var(--accent-cyan) !important;
    border: 1.5px solid var(--accent-cyan) !important;
  }

  .outline-button:hover, .text-button:hover {
    transform: translateY(-2px);
    background: rgba(0, 210, 255, 0.1) !important;
    box-shadow: 0 0 25px rgba(0, 210, 255, 0.25) !important;
  }

  /* NAVIGATION ITEMS - VIBRANT HIGHLIGHTS */
  .nav-item {
    transition: var(--transition-smooth);
    color: #b0b8c8 !important;
  }

  .nav-item:hover {
    background: rgba(0, 210, 255, 0.08) !important;
    transform: translateX(4px);
    color: var(--accent-cyan) !important;
  }

  .nav-item.selected {
    background: linear-gradient(90deg, rgba(0, 210, 255, 0.2), rgba(0, 210, 255, 0.05)) !important;
    border-left: 3px solid var(--accent-cyan) !important;
    box-shadow: inset 0 0 20px rgba(0, 210, 255, 0.1), 0 0 15px rgba(0, 210, 255, 0.2) !important;
    color: var(--accent-cyan) !important;
    font-weight: 600 !important;
  }

  /* INPUT FIELDS GLOW - VIBRANT CYAN */
  input:focus, select:focus, textarea:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 210, 255, 0.25), 0 0 20px var(--glow-cyan), inset 0 1px 2px rgba(0, 210, 255, 0.1) !important;
    border-color: var(--accent-cyan) !important;
    transform: scale(1.01);
    background: rgba(21, 28, 44, 0.6) !important;
    color: #ffffff !important;
  }

  input, select, textarea {
    background: rgba(21, 28, 44, 0.5) !important;
    border: 1px solid rgba(0, 210, 255, 0.15) !important;
    color: #ffffff !important;
  }

  input::placeholder, textarea::placeholder {
    color: #7a8599 !important;
  }

  /* AVAILABILITY SECTION - VIBRANT GREEN */
  .availability {
    background: linear-gradient(135deg, rgba(79, 172, 254, 0.1), rgba(21, 28, 44, 0.8)) !important;
    border: 1.5px solid var(--accent-emerald) !important;
    box-shadow: 0 0 30px rgba(79, 172, 254, 0.2) !important;
    color: #ffffff !important;
    padding: 24px !important;
    border-radius: 12px !important;
  }

  .toggle {
    transition: var(--transition-smooth);
    background: linear-gradient(135deg, rgba(79, 172, 254, 0.2), rgba(79, 172, 254, 0.1)) !important;
    border: 1.5px solid var(--accent-emerald) !important;
  }

  .toggle:hover {
    box-shadow: 0 0 20px rgba(79, 172, 254, 0.3) !important;
  }

  .toggle.on {
    background: linear-gradient(135deg, #4facfe, #3a9dfc) !important;
    box-shadow: 0 0 30px var(--glow-emerald) !important;
    border-color: var(--accent-emerald) !important;
  }

  .status {
    color: #ff9a56 !important;
  }

  .status.on-text {
    color: var(--accent-emerald) !important;
  }

  /* STOCK & PROGRESS BARS - NEON */
  .progress i {
    transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
  }

  .progress i.green {
    background: linear-gradient(90deg, var(--accent-emerald), #3a9dfc) !important;
    box-shadow: 0 0 20px var(--glow-emerald) !important;
  }

  .progress i.blue {
    background: linear-gradient(90deg, var(--accent-cyan), var(--accent-emerald)) !important;
    box-shadow: 0 0 20px var(--glow-cyan) !important;
  }

  .progress i.orange {
    background: linear-gradient(90deg, var(--accent-orange), #ff7a7e) !important;
    box-shadow: 0 0 20px var(--glow-orange) !important;
  }

  /* ZONE CARD - VIBRANT CYAN */
  .zone-card, .stock-card {
    transition: var(--transition-smooth);
    cursor: pointer;
  }

  .zone-card:hover, .stock-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 0 40px var(--glow-cyan), 0 12px 48px rgba(0, 0, 0, 0.5) !important;
  }

  .alert-card {
    border: 1.5px solid var(--accent-orange) !important;
    background: linear-gradient(135deg, rgba(255, 94, 98, 0.08), rgba(21, 28, 44, 0.8)) !important;
  }

  .alert-card:hover {
    border-color: var(--accent-orange) !important;
    box-shadow: 0 0 40px var(--glow-orange), 0 8px 32px rgba(0, 0, 0, 0.4) !important;
  }

  /* ROUTE CARD - VIBRANT CYAN */
  .route-card {
    position: relative;
    cursor: pointer;
  }

  .route-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 0 40px var(--glow-cyan), 0 12px 48px rgba(0, 0, 0, 0.5) !important;
  }

  .route-map {
    position: relative;
  }

  .route-pill {
    background: linear-gradient(135deg, var(--accent-emerald), #3a9dfc) !important;
    box-shadow: 0 0 20px var(--glow-emerald) !important;
  }

  /* REQUEST PANEL */
  .request-panel {
    transition: var(--transition-smooth);
    cursor: pointer;
  }

  .request-panel:hover {
    transform: translateY(-4px);
    box-shadow: 0 0 40px var(--glow-orange), 0 12px 48px rgba(0, 0, 0, 0.5) !important;
  }

  /* FORM ELEMENTS - VIBRANT STYLING */
  .form-grid input, .form-grid select, .form-grid textarea,
  .stock-editor input, .proof-form input {
    transition: var(--transition-smooth);
    background: rgba(21, 28, 44, 0.6) !important;
    border: 1px solid rgba(0, 210, 255, 0.15) !important;
    color: #ffffff !important;
  }

  .form-grid input:focus, .form-grid select:focus, .form-grid textarea:focus,
  .stock-editor input:focus, .proof-form input:focus {
    background: rgba(21, 28, 44, 0.8) !important;
    border-color: var(--accent-cyan) !important;
    box-shadow: 0 0 0 3px rgba(0, 210, 255, 0.25), 0 0 20px var(--glow-cyan) !important;
    transform: scale(1.01);
  }

  .form-grid label, .stock-editor label {
    color: #e0e7ff !important;
  }

  /* SECTION HEADINGS */
  .section-heading {
    transition: var(--transition-smooth);
  }

  h1, h2, h3 {
    letter-spacing: -0.015em;
    font-weight: 700;
    color: #ffffff !important;
  }

  .eyebrow {
    font-size: 0.75rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    font-weight: 800;
    color: var(--accent-cyan) !important;
    text-shadow: 0 0 10px var(--glow-cyan) !important;
  }

  /* TOAST NOTIFICATION - VIBRANT */
  .toast {
    backdrop-filter: blur(16px);
    background: linear-gradient(135deg, rgba(11, 15, 25, 0.98), rgba(21, 28, 44, 0.95)) !important;
    box-shadow: 0 0 40px var(--glow-cyan), 0 8px 32px rgba(0, 0, 0, 0.6);
    border: 1px solid var(--accent-cyan) !important;
    color: var(--accent-emerald) !important;
  }

  /* HELP CARD - VIBRANT ORANGE */
  .help-card {
    transition: var(--transition-smooth);
    background: linear-gradient(135deg, rgba(255, 94, 98, 0.1), rgba(255, 94, 98, 0.05)) !important;
    border: 1.5px solid var(--accent-orange) !important;
  }

  .help-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 30px var(--glow-orange), 0 8px 24px rgba(255, 94, 98, 0.15) !important;
    border-color: var(--accent-orange) !important;
  }

  /* PROVIDER CARD */
  .provider-card {
    backdrop-filter: blur(10px);
    background: linear-gradient(135deg, rgba(21, 28, 44, 0.8), rgba(26, 34, 56, 0.7)) !important;
    border: 1.5px solid rgba(0, 210, 255, 0.2) !important;
    color: #ffffff !important;
  }

  .provider-logo {
    background: linear-gradient(135deg, var(--accent-cyan), var(--accent-emerald)) !important;
    color: white !important;
  }

  /* CONTENT AREA */
  .content {
    background: linear-gradient(135deg, #0b0f19 0%, #141d2f 50%, #0f1624 100%) !important;
  }

  /* SMOOTH ANIMATIONS */
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 20px var(--glow-cyan), 0 0 40px rgba(0, 210, 255, 0.1); }
    50% { box-shadow: 0 0 40px var(--glow-cyan), 0 0 80px rgba(0, 210, 255, 0.2); }
  }

  @keyframes statusPulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }

  .card.pulse {
    animation: glowPulse 2.5s ease-in-out infinite;
  }

  .status-dot {
    animation: statusPulse 2s ease-in-out infinite;
  }

  /* DELIVERY INFO */
  .delivery-info {
    transition: var(--transition-smooth);
    color: #ffffff !important;
  }

  /* ICON BUTTON */
  .icon-button {
    transition: var(--transition-smooth);
    position: relative;
    color: #b0b8c8 !important;
  }

  .icon-button:hover {
    transform: translateY(-2px);
    color: var(--accent-cyan) !important;
  }

  .icon-button:focus-within {
    box-shadow: 0 0 20px var(--glow-cyan) !important;
  }

  /* FEATURE PANEL */
  .feature-panel {
    transition: var(--transition-smooth);
    cursor: pointer;
  }

  .feature-panel:hover {
    box-shadow: 0 0 40px var(--glow-cyan), 0 12px 48px rgba(0, 0, 0, 0.5) !important;
    transform: translateY(-2px);
  }

  .feature-panel.focused {
    border-color: var(--accent-cyan) !important;
    box-shadow: 0 0 50px var(--glow-cyan), 0 0 100px rgba(0, 210, 255, 0.15), 0 12px 48px rgba(0, 0, 0, 0.6) !important;
    background: linear-gradient(135deg, rgba(0, 210, 255, 0.1), rgba(79, 172, 254, 0.06)) !important;
  }

  /* IMPACT CARDS */
  .impact-main, .impact-list {
    transition: var(--transition-smooth);
    cursor: pointer;
  }

  .impact-main:hover, .impact-list:hover {
    transform: translateY(-4px);
    box-shadow: 0 0 40px var(--glow-purple), 0 12px 48px rgba(0, 0, 0, 0.5) !important;
  }

  .impact-main.focused, .impact-list.focused {
    border-color: var(--accent-purple) !important;
    box-shadow: 0 0 50px var(--glow-purple), 0 0 100px rgba(225, 0, 255, 0.15), 0 12px 48px rgba(0, 0, 0, 0.6) !important;
    background: linear-gradient(135deg, rgba(225, 0, 255, 0.08), rgba(225, 0, 255, 0.04)) !important;
  }

  .impact-main strong, .impact-list strong {
    background: linear-gradient(135deg, var(--accent-purple), #e100ff) !important;
    -webkit-background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    background-clip: text !important;
  }

  .bar-chart i {
    background: linear-gradient(180deg, var(--accent-purple), var(--accent-emerald)) !important;
    box-shadow: 0 0 15px var(--glow-purple) !important;
  }

  /* MOBILE OPTIMIZATION */
  @media (max-width: 768px) {
    .card:hover {
      transform: translateY(-2px);
    }

    .stats article:hover {
      transform: translateY(-2px) scale(1.01);
    }

    button:hover:not(:disabled) {
      transform: translateY(-1px);
    }
  }

  /* Final scoped presentation layer.  It intentionally comes last so this
     self-contained dashboard is not muted by the app-wide Wari stylesheet. */
  .provider-pitch.app-shell {
    min-height: 100vh;
    isolation: isolate;
    color: #f8fbff;
    background:
      radial-gradient(circle at 86% 3%, rgba(0, 210, 255, .16), transparent 25rem),
      radial-gradient(circle at 5% 95%, rgba(127, 0, 255, .13), transparent 28rem),
      #0b0f19 !important;
  }

  .provider-pitch .content {
    max-width: none !important;
    background: transparent !important;
  }

  .provider-pitch .sidebar {
    background: linear-gradient(180deg, rgba(12, 18, 32, .98), rgba(21, 28, 44, .96)) !important;
    border-right: 1px solid rgba(0, 210, 255, .22) !important;
  }

  .provider-pitch .brand { color: #ffffff !important; }
  .provider-pitch .brand-mark,
  .provider-pitch .provider-logo {
    background: linear-gradient(135deg, #00d2ff, #3a7bd5) !important;
    box-shadow: 0 0 24px rgba(0, 210, 255, .45);
  }

  .provider-pitch header {
    position: relative;
    padding: 20px 23px;
    border: 1px solid rgba(255, 255, 255, .08) !important;
    border-radius: 18px;
    overflow: hidden;
  }
  .provider-pitch header::after,
  .provider-pitch .stats article::before,
  .provider-pitch .card::before {
    content: '';
    position: absolute;
    inset: 0;
    padding: 1px;
    border-radius: inherit;
    background: linear-gradient(120deg, rgba(0, 210, 255, .56), transparent 38%, rgba(127, 0, 255, .42));
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
  .provider-pitch .subtitle,
  .provider-pitch .section-heading p,
  .provider-pitch .request-copy p,
  .provider-pitch .request-copy small,
  .provider-pitch .delivery-info p,
  .provider-pitch .zone-info p,
  .provider-pitch .availability p { color: #aebbd0 !important; }

  .provider-pitch .availability {
    position: relative;
    overflow: hidden;
    background: linear-gradient(105deg, rgba(0, 242, 254, .16), rgba(79, 172, 254, .07) 48%, rgba(21, 28, 44, .9)) !important;
    border: 1px solid rgba(0, 242, 254, .6) !important;
    box-shadow: 0 0 28px rgba(0, 242, 254, .16), inset 0 1px rgba(255, 255, 255, .12) !important;
  }
  .provider-pitch .availability strong { color: #ffffff !important; }
  .provider-pitch .availability-icon span,
  .provider-pitch .route-pill span,
  .provider-pitch .icon-button i {
    background: #00f2fe !important;
    box-shadow: 0 0 0 4px rgba(0, 242, 254, .12), 0 0 15px #00f2fe;
    animation: statusPulse 1.7s ease-in-out infinite;
  }
  .provider-pitch .status.on-text { color: #00f2fe !important; text-shadow: 0 0 10px rgba(0, 242, 254, .75); }

  .provider-pitch .stats article,
  .provider-pitch .card {
    position: relative;
    overflow: hidden;
    background: linear-gradient(145deg, rgba(31, 41, 65, .92), rgba(21, 28, 44, .88)) !important;
    border: 1px solid rgba(159, 183, 221, .22) !important;
    border-radius: 16px !important;
    box-shadow: 0 16px 38px rgba(0, 0, 0, .27), inset 0 1px rgba(255, 255, 255, .07) !important;
    backdrop-filter: blur(12px);
  }
  .provider-pitch .stats article:nth-child(1) { --card-accent: #00d2ff; --card-glow: rgba(0, 210, 255, .43); }
  .provider-pitch .stats article:nth-child(2) { --card-accent: #00f2fe; --card-glow: rgba(0, 242, 254, .38); }
  .provider-pitch .stats article:nth-child(3) { --card-accent: #7f00ff; --card-glow: rgba(127, 0, 255, .39); }
  .provider-pitch .stats article:nth-child(4) { --card-accent: #ff9966; --card-glow: rgba(255, 94, 98, .42); }
  .provider-pitch .stats article { border-color: color-mix(in srgb, var(--card-accent) 36%, transparent) !important; }
  .provider-pitch .stats article strong {
    background: linear-gradient(135deg, #ffffff, var(--card-accent)) !important;
    -webkit-background-clip: text !important;
    background-clip: text !important;
  }
  .provider-pitch .stats article.focused {
    border-color: var(--card-accent) !important;
    box-shadow: 0 0 25px var(--card-glow), 0 0 70px color-mix(in srgb, var(--card-glow) 42%, transparent), 0 16px 38px rgba(0, 0, 0, .4) !important;
  }
  .provider-pitch .metric-card:focus-visible,
  .provider-pitch .card:focus-visible,
  .provider-pitch .request-card:focus-visible { outline: 2px solid #00d2ff; outline-offset: 3px; }

  .provider-pitch .request-panel { border-color: rgba(255, 153, 102, .38) !important; }
  .provider-pitch .request-panel.focused,
  .provider-pitch .request-card.focused { border-color: #ff5e62 !important; box-shadow: 0 0 25px rgba(255, 94, 98, .43), 0 0 65px rgba(255, 153, 102, .16) !important; }
  .provider-pitch .route-card,
  .provider-pitch .zone-card { border-color: rgba(0, 210, 255, .38) !important; }
  .provider-pitch .route-card.focused,
  .provider-pitch .zone-card.focused,
  .provider-pitch .stock-card.focused { border-color: #00d2ff !important; box-shadow: 0 0 25px rgba(0, 210, 255, .43), 0 0 65px rgba(58, 123, 213, .17) !important; }
  .provider-pitch .alert-card { border-color: rgba(255, 94, 98, .7) !important; }
  .provider-pitch .alert-card.focused { border-color: #ff5e62 !important; box-shadow: 0 0 25px rgba(255, 94, 98, .48), 0 0 65px rgba(255, 153, 102, .18) !important; }
  .provider-pitch .impact-main.focused,
  .provider-pitch .impact-list.focused { border-color: #e100ff !important; box-shadow: 0 0 25px rgba(225, 0, 255, .48), 0 0 70px rgba(127, 0, 255, .2) !important; }

  .provider-pitch .request-card {
    border-top: 1px solid rgba(255, 153, 102, .18) !important;
    border-radius: 11px;
    padding: 13px 10px;
    margin: 3px -10px;
  }
  .provider-pitch .request-card:hover { background: rgba(255, 94, 98, .07) !important; }
  .provider-pitch .request-avatar { background: linear-gradient(135deg, #ff9966, #ff5e62) !important; box-shadow: 0 0 16px rgba(255, 94, 98, .38); }

  .provider-pitch .route-map {
    background-color: #10192a !important;
    background-image: radial-gradient(rgba(0, 210, 255, .22) 1px, transparent 1px) !important;
    border: 1px solid rgba(0, 210, 255, .22);
  }
  .provider-pitch .route-line { border-top-color: #00d2ff; filter: drop-shadow(0 0 5px #00d2ff); }
  .provider-pitch .route-pill { color: #07141c; font-weight: 800; }
  .provider-pitch .progress { background: rgba(255, 255, 255, .08); box-shadow: inset 0 1px 3px rgba(0, 0, 0, .45); }

  .provider-pitch .nav-item.selected { color: #ffffff !important; background: linear-gradient(90deg, rgba(0, 210, 255, .25), rgba(58, 123, 213, .05)) !important; border-left-color: #00d2ff !important; }
  .provider-pitch .nav-item b { background: linear-gradient(135deg, #ff9966, #ff5e62); box-shadow: 0 0 12px rgba(255, 94, 98, .55); }
  .provider-pitch .accept,
  .provider-pitch .alert-card button { background: linear-gradient(135deg, #00d2ff, #3a7bd5) !important; border-color: rgba(0, 210, 255, .72) !important; box-shadow: 0 8px 20px rgba(0, 210, 255, .2); }
  .provider-pitch .accept:hover,
  .provider-pitch .alert-card button:hover { box-shadow: 0 0 25px rgba(0, 210, 255, .52), 0 9px 24px rgba(0, 0, 0, .34) !important; }
  .provider-pitch .reject { color: #ff9966 !important; border-color: #ff5e62 !important; }
  .provider-pitch .outline-button { color: #00d2ff !important; background: rgba(0, 210, 255, .07) !important; border-color: rgba(0, 210, 255, .65) !important; }
  .provider-pitch .restock { color: #ffb27c; background: rgba(255, 94, 98, .08); border-color: rgba(255, 153, 102, .66); }
  .provider-pitch .status-badge.delivered { background: linear-gradient(135deg, #00f2fe, #4facfe) !important; color: #06131c; box-shadow: 0 0 14px rgba(0, 242, 254, .42); }

  @media (prefers-reduced-motion: reduce) {
    .provider-pitch *, .provider-pitch *::before, .provider-pitch *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
  }

  /* Wari Portal theme alignment — this final scoped layer intentionally wins. */
  .provider-pitch {
    --wari-slate: #0f172a;
    --wari-panel: rgba(30, 41, 59, .85);
    --wari-saffron: #f59e0b;
    --wari-saffron-deep: #d97706;
    --wari-cyan: #00d2ff;
    --wari-blue: #3b82f6;
    --wari-green: #10b981;
    --wari-red: #ef4444;
    background:
      radial-gradient(circle at 88% 0%, rgba(0, 210, 255, .16), transparent 27rem),
      radial-gradient(circle at 3% 96%, rgba(245, 158, 11, .12), transparent 28rem),
      #0a0e1a !important;
  }
  .provider-pitch .sidebar { background: linear-gradient(180deg, #0b0f19 0%, #151c2c 100%) !important; border-right-color: rgba(0, 210, 255, .2) !important; }
  .provider-pitch .brand-mark, .provider-pitch .provider-logo { background: linear-gradient(135deg, #fbbf24, #d97706) !important; box-shadow: 0 0 22px rgba(245, 158, 11, .42) !important; }
  .provider-pitch .brand > span:last-child > span { color: var(--wari-saffron) !important; }
  .provider-pitch header { background: rgba(15, 23, 42, .85) !important; border-color: rgba(245, 158, 11, .28) !important; box-shadow: 0 8px 32px rgba(2, 6, 23, .45) !important; backdrop-filter: blur(16px) !important; }
  .provider-pitch header::after { background: linear-gradient(110deg, rgba(245, 158, 11, .7), transparent 40%, rgba(0, 210, 255, .52)) !important; }
  .provider-pitch .eyebrow { color: var(--wari-saffron) !important; text-shadow: 0 0 10px rgba(245, 158, 11, .35) !important; }
  .provider-pitch .stats article, .provider-pitch .card { background: var(--wari-panel) !important; border-color: rgba(148, 163, 184, .2) !important; }
  .provider-pitch .stats article:nth-child(1) { --card-accent: #f59e0b; --card-glow: rgba(245, 158, 11, .42); }
  .provider-pitch .stats article:nth-child(2) { --card-accent: #10b981; --card-glow: rgba(16, 185, 129, .42); }
  .provider-pitch .stats article:nth-child(3) { --card-accent: #00d2ff; --card-glow: rgba(0, 210, 255, .42); }
  .provider-pitch .stats article:nth-child(4) { --card-accent: #3b82f6; --card-glow: rgba(59, 130, 246, .42); }
  .provider-pitch .stats article.focused { border-color: var(--card-accent) !important; box-shadow: 0 0 30px var(--card-glow), 0 16px 38px rgba(2, 6, 23, .55) !important; }
  .provider-pitch .availability { border-color: var(--wari-green) !important; background: linear-gradient(120deg, rgba(16, 185, 129, .14), rgba(30, 41, 59, .88)) !important; box-shadow: 0 0 30px rgba(16, 185, 129, .25) !important; }
  .provider-pitch .availability:has(.toggle.on) { box-shadow: 0 0 30px rgba(16, 185, 129, .45) !important; }
  .provider-pitch .toggle.on { background: linear-gradient(135deg, #34d399, #10b981) !important; border-color: var(--wari-green) !important; box-shadow: 0 0 24px rgba(16, 185, 129, .5) !important; }
  .provider-pitch .status.on-text, .provider-pitch .availability-icon span { color: var(--wari-green) !important; background: var(--wari-green) !important; box-shadow: 0 0 14px var(--wari-green) !important; }
  .provider-pitch .request-panel { border-color: rgba(245, 158, 11, .38) !important; }
  .provider-pitch .request-panel.focused, .provider-pitch .request-card.focused { border-color: var(--wari-saffron) !important; box-shadow: 0 0 30px rgba(245, 158, 11, .45), 0 12px 32px rgba(2, 6, 23, .48) !important; }
  .provider-pitch .request { border-color: rgba(245, 158, 11, .18) !important; background: rgba(15, 23, 42, .48) !important; }
  .provider-pitch .request:hover { border-color: rgba(245, 158, 11, .58) !important; box-shadow: 0 0 22px rgba(245, 158, 11, .22) !important; }
  .provider-pitch .request-avatar { background: linear-gradient(135deg, #fbbf24, #d97706) !important; box-shadow: 0 0 15px rgba(245, 158, 11, .35) !important; }
  .provider-pitch .route-card, .provider-pitch .zone-card { border-color: rgba(0, 210, 255, .36) !important; }
  .provider-pitch .route-card.focused, .provider-pitch .zone-card.focused { border-color: var(--wari-cyan) !important; box-shadow: 0 0 30px rgba(0, 210, 255, .45), 0 12px 32px rgba(2, 6, 23, .5) !important; }
  .provider-pitch .stock-card.focused { border-color: var(--wari-green) !important; box-shadow: 0 0 30px rgba(16, 185, 129, .45), 0 12px 32px rgba(2, 6, 23, .5) !important; }
  .provider-pitch .alert-card { border-color: rgba(239, 68, 68, .68) !important; background: linear-gradient(135deg, rgba(127, 29, 29, .28), var(--wari-panel)) !important; }
  .provider-pitch .alert-card.focused { border-color: var(--wari-red) !important; box-shadow: 0 0 30px rgba(239, 68, 68, .5), 0 12px 32px rgba(2, 6, 23, .5) !important; }
  .provider-pitch .route-map { background-color: #101b2c !important; background-image: radial-gradient(rgba(0, 210, 255, .24) 1px, transparent 1px) !important; }
  .provider-pitch .route-line { border-top-color: var(--wari-cyan) !important; filter: drop-shadow(0 0 5px var(--wari-cyan)); }
  .provider-pitch .route-pill { background: linear-gradient(135deg, #34d399, #10b981) !important; box-shadow: 0 0 18px rgba(16, 185, 129, .45) !important; }
  .provider-pitch .progress i.green { background: linear-gradient(90deg, #34d399, #10b981) !important; box-shadow: 0 0 16px rgba(16, 185, 129, .55) !important; }
  .provider-pitch .progress i.blue { background: linear-gradient(90deg, var(--wari-cyan), var(--wari-blue)) !important; box-shadow: 0 0 16px rgba(0, 210, 255, .48) !important; }
  .provider-pitch .progress i.orange { background: linear-gradient(90deg, #fbbf24, #d97706) !important; box-shadow: 0 0 16px rgba(245, 158, 11, .48) !important; }
  .provider-pitch .nav-item.selected { border-left-color: var(--wari-saffron) !important; background: linear-gradient(90deg, rgba(245, 158, 11, .22), rgba(0, 210, 255, .05)) !important; box-shadow: inset 0 0 18px rgba(245, 158, 11, .09) !important; }
  .provider-pitch .nav-item:hover { color: #fcd34d !important; background: rgba(245, 158, 11, .08) !important; }
  .provider-pitch .nav-item b { background: linear-gradient(135deg, #fbbf24, #d97706) !important; box-shadow: 0 0 12px rgba(245, 158, 11, .55) !important; }
  .provider-pitch .accept { background: linear-gradient(135deg, var(--wari-cyan), var(--wari-blue)) !important; border-color: rgba(0, 210, 255, .68) !important; }
  .provider-pitch .alert-card button { background: linear-gradient(135deg, #f87171, var(--wari-red)) !important; border-color: rgba(248, 113, 113, .75) !important; }
  .provider-pitch .reject { color: #fca5a5 !important; border-color: var(--wari-red) !important; background: rgba(239, 68, 68, .1) !important; }
  .provider-pitch .outline-button, .provider-pitch .text-button { color: #67e8f9 !important; border-color: rgba(0, 210, 255, .65) !important; }
  .provider-pitch .restock { color: #a7f3d0 !important; border-color: rgba(16, 185, 129, .65) !important; background: rgba(16, 185, 129, .08) !important; }
  .provider-pitch .status-badge.delivered { background: linear-gradient(135deg, #34d399, #10b981) !important; color: #06271d !important; box-shadow: 0 0 14px rgba(16, 185, 129, .42) !important; }
  .provider-pitch button:hover:not(:disabled) { transform: translateY(-2px); } .provider-pitch button:active:not(:disabled) { transform: scale(.96); }

  /* SmartVari light Bhagwa theme — the final layer keeps all interaction state intact. */
  .provider-pitch {
    --bhagwa: #ff9933;
    --bhagwa-deep: #e65100;
    --amber: #f59e0b;
    --ink: #0f172a;
    --muted-ink: #64748b;
    color: var(--ink) !important;
    background: radial-gradient(circle at 92% 2%, rgba(255, 153, 51, .14), transparent 25rem), radial-gradient(circle at 5% 98%, rgba(245, 158, 11, .1), transparent 28rem), #fafaf9 !important;
  }
  .provider-pitch .content { background: transparent !important; }
  .provider-pitch .sidebar { background: rgba(255, 255, 255, .96) !important; border-right: 1px solid rgba(245, 158, 11, .2) !important; box-shadow: 2px 0 24px rgba(15, 23, 42, .07) !important; }
  .provider-pitch .brand, .provider-pitch .brand span, .provider-pitch .provider-card, .provider-pitch .provider-card strong { color: var(--ink) !important; text-shadow: none !important; }
  .provider-pitch .brand > span:last-child > span { color: var(--bhagwa-deep) !important; }
  .provider-pitch .brand-mark, .provider-pitch .provider-logo { color: white !important; background: linear-gradient(135deg, #ff9933, #e65100) !important; box-shadow: 0 0 18px rgba(255, 153, 51, .32) !important; }
  .provider-pitch .provider-card { background: #fffaf3 !important; border-color: rgba(245, 158, 11, .2) !important; }
  .provider-pitch .provider-card small, .provider-pitch .subtitle, .provider-pitch .section-heading p, .provider-pitch .request-copy p, .provider-pitch .request-copy small, .provider-pitch .delivery-info p, .provider-pitch .zone-info p, .provider-pitch .availability p { color: var(--muted-ink) !important; }
  .provider-pitch header { background: rgba(255, 255, 255, .85) !important; border-color: rgba(245, 158, 11, .22) !important; box-shadow: 0 8px 28px rgba(15, 23, 42, .08) !important; backdrop-filter: blur(12px) !important; }
  .provider-pitch header::after { background: linear-gradient(110deg, rgba(255, 153, 51, .72), transparent 42%, rgba(245, 158, 11, .38)) !important; }
  .provider-pitch h1, .provider-pitch h2, .provider-pitch h3, .provider-pitch .section-heading h2, .provider-pitch .availability strong { color: var(--ink) !important; text-shadow: none !important; }
  .provider-pitch .eyebrow { color: var(--bhagwa-deep) !important; text-shadow: none !important; }
  .provider-pitch .nav-item { color: #475569 !important; }.provider-pitch .nav-item:hover { color: var(--bhagwa-deep) !important; background: #fff7ed !important; }.provider-pitch .nav-item.selected { color: #9a3412 !important; border-left-color: var(--bhagwa) !important; background: linear-gradient(90deg, rgba(255,153,51,.24), rgba(255,255,255,0)) !important; box-shadow: inset 0 0 16px rgba(255,153,51,.08) !important; }.provider-pitch .nav-item b { background: linear-gradient(135deg, #ff9933, #e65100) !important; }
  .provider-pitch .stats article, .provider-pitch .card { color: var(--ink) !important; background: rgba(255, 255, 255, .94) !important; border-color: #e2e8f0 !important; box-shadow: 0 10px 28px rgba(15, 23, 42, .08), inset 0 1px rgba(255,255,255,.9) !important; }
  .provider-pitch .stats article::before, .provider-pitch .card::before { background: linear-gradient(120deg, rgba(255,153,51,.62), transparent 42%, rgba(245,158,11,.32)) !important; }
  .provider-pitch .stats article:nth-child(1) { --card-accent: #ff9933; --card-glow: rgba(255, 153, 51, .45); }.provider-pitch .stats article:nth-child(2) { --card-accent: #10b981; --card-glow: rgba(16,185,129,.35); }.provider-pitch .stats article:nth-child(3) { --card-accent: #f59e0b; --card-glow: rgba(245,158,11,.4); }.provider-pitch .stats article:nth-child(4) { --card-accent: #3b82f6; --card-glow: rgba(59,130,246,.32); }
  .provider-pitch .stats article strong { background: linear-gradient(135deg, var(--ink), var(--card-accent)) !important; -webkit-background-clip: text !important; background-clip: text !important; }.provider-pitch .stats article.focused { border-color: var(--card-accent) !important; box-shadow: 0 0 25px var(--card-glow), 0 12px 30px rgba(15,23,42,.12) !important; }
  .provider-pitch .stat-top, .provider-pitch .stats p, .provider-pitch .stock-row strong, .provider-pitch .stock-row span, .provider-pitch .zone-line { color: var(--muted-ink) !important; }
  .provider-pitch .availability { color: var(--ink) !important; background: linear-gradient(115deg, rgba(236,253,245,.95), rgba(255,255,255,.96)) !important; border-color: var(--wari-green) !important; box-shadow: 0 0 25px rgba(16,185,129,.23) !important; }.provider-pitch .availability:has(.toggle.on) { box-shadow: 0 0 25px rgba(16,185,129,.35) !important; }.provider-pitch .toggle.on { background: linear-gradient(135deg, #34d399, #10b981) !important; }.provider-pitch .status.on-text { color: #059669 !important; }
  .provider-pitch .request, .provider-pitch .request-card { color: var(--ink) !important; background: #fffdf8 !important; border-color: rgba(255,153,51,.2) !important; }.provider-pitch .request-copy strong { color: var(--ink) !important; }.provider-pitch .request-panel { border-color: rgba(255,153,51,.34) !important; }.provider-pitch .request-panel.focused, .provider-pitch .request-card.focused { border-color: var(--bhagwa) !important; box-shadow: 0 0 25px rgba(255,153,51,.45), 0 12px 30px rgba(15,23,42,.12) !important; }.provider-pitch .request-avatar { background: linear-gradient(135deg, #ff9933, #e65100) !important; }.provider-pitch .route-card, .provider-pitch .stock-card, .provider-pitch .zone-card { border-color: rgba(245,158,11,.3) !important; }.provider-pitch .route-card.focused, .provider-pitch .stock-card.focused, .provider-pitch .zone-card.focused { border-color: var(--amber) !important; box-shadow: 0 0 25px rgba(245,158,11,.4), 0 12px 30px rgba(15,23,42,.12) !important; }
  .provider-pitch .alert-card { background: linear-gradient(135deg, #fff5f5, #fff) !important; border-color: rgba(239,68,68,.45) !important; }.provider-pitch .alert-card.focused { border-color: #ef4444 !important; box-shadow: 0 0 25px rgba(239,68,68,.35), 0 12px 30px rgba(15,23,42,.12) !important; }
  .provider-pitch .route-map { background-color: #fff8ed !important; background-image: radial-gradient(rgba(245,158,11,.3) 1px, transparent 1px) !important; border-color: rgba(245,158,11,.28) !important; }.provider-pitch .route-line { border-top-color: var(--bhagwa) !important; filter: drop-shadow(0 0 4px rgba(255,153,51,.65)) !important; }.provider-pitch .route-pill { background: linear-gradient(135deg, #34d399, #10b981) !important; }.provider-pitch .progress { background: #e2e8f0 !important; }.provider-pitch .progress i.orange,.provider-pitch .progress i.blue { background: linear-gradient(90deg, #ff9933, #e65100) !important; box-shadow: 0 0 12px rgba(255,153,51,.42) !important; }
  .provider-pitch .accept { background: linear-gradient(135deg, #ff9933, #e65100) !important; border-color: #e65100 !important; }.provider-pitch .alert-card button { background: linear-gradient(135deg, #f87171, #ef4444) !important; }.provider-pitch .reject { color: #dc2626 !important; border-color: #ef4444 !important; background: #fff1f2 !important; }.provider-pitch .outline-button,.provider-pitch .text-button { color: #c2410c !important; border-color: #ff9933 !important; background: #fffaf3 !important; }.provider-pitch .restock { color: #047857 !important; border-color: #10b981 !important; background: #ecfdf5 !important; }.provider-pitch .status-badge.delivered { background: linear-gradient(135deg,#34d399,#10b981) !important; }
  .provider-pitch input, .provider-pitch select, .provider-pitch textarea { color: var(--ink) !important; background: #f1f5f9 !important; border-color: #e2e8f0 !important; }.provider-pitch input:focus, .provider-pitch select:focus, .provider-pitch textarea:focus { border-color: var(--bhagwa) !important; box-shadow: 0 0 0 3px rgba(255,153,51,.25) !important; background: #fff !important; }
  .provider-pitch .toast { color: #065f46 !important; border-color: #10b981 !important; background: rgba(255,255,255,.94) !important; box-shadow: 0 0 25px rgba(16,185,129,.25),0 10px 25px rgba(15,23,42,.12) !important; }
`;

type IconName = 'grid' | 'requests' | 'truck' | 'stock' | 'history' | 'chart' | 'settings' | 'bell' | 'pin' | 'arrow' | 'users' | 'clock' | 'more' | 'check' | 'x' | 'warning' | 'plus' | 'menu';

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    requests: <><path d="M20 11.5a8.4 8.4 0 0 1-1.6 5A8.7 8.7 0 0 1 12 20a8.4 8.4 0 0 1-3.8-.9L4 20l1.2-3.6A8.2 8.2 0 0 1 4 12a8 8 0 0 1 8-8 8.5 8.5 0 0 1 5.5 2"/><path d="M16 9h5m-2.5-2.5v5"/></>,
    truck: <><path d="M3 6h11v10H3z"/><path d="M14 10h4l3 3v3h-7zM5.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM18.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/></>,
    stock: <><path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5M12 7v5l3 2"/></>,
    chart: <><path d="M4 19V5m0 14h16"/><path d="m7 15 4-4 3 2 5-6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.3 2.3-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-3.2v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.3-2.3.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H4.7v-3.2h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L6 8l2.3-2.3.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h3.2v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 8l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1Z"/></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5.2a3 3 0 0 1 0 5.6M18 14c2 1 3 3.1 3 6"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></>,
    check: <path d="m5 12 4 4L19 6"/>, x: <path d="m6 6 12 12M18 6 6 18"/>,
    warning: <><path d="M10.3 4.2 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/></>,
    plus: <path d="M12 5v14M5 12h14"/>, menu: <path d="M4 7h16M4 12h16M4 17h16"/>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const menu = [['grid', 'Overview'], ['requests', 'Service Requests'], ['truck', 'Fleet & Capacity'], ['stock', 'Stock & Resources'], ['history', 'Service History'], ['chart', 'Impact Report']] as [IconName, string][];

export function ServiceProviderDashboard() {
  const [online, setOnline] = useState(true);
  const [notice, setNotice] = useState('');
  const [active, setActive] = useState('Overview');
  const [focusedCard, setFocusedCard] = useState<string | null>(null);
  const [focusedMetric, setFocusedMetric] = useState<number | null>(null);
  const [focusedRequest, setFocusedRequest] = useState<number | null>(null);
  
  const alert = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 2600); };

  return <>
    <style>{premiumStyles}</style>
    <div className="app-shell provider-pitch">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">S</span><span>Smart<span>Vari</span></span></div>
        <div className="provider-card"><div className="provider-logo">SF</div><div><strong>Seva Foundation</strong><small>Food Service Provider</small></div><button aria-label="Provider menu" onClick={() => alert('Provider menu opened')}><Icon name="more" size={18}/></button></div>
        <nav>{menu.map(([icon, label]) => <button key={label} className={active === label ? 'nav-item selected' : 'nav-item'} onClick={() => setActive(label)}><Icon name={icon}/><span>{label}</span>{label === 'Service Requests' && <b>4</b>}</button>)}</nav>
        <div className="side-bottom"><button className="nav-item" onClick={() => setActive('Settings')}><Icon name="settings"/><span>Settings</span></button><button className="help-card clickable" onClick={() => alert('Control Room: +91 98765 43210')}><span>?</span><div><strong>Need assistance?</strong><small>Reach the Control Room</small></div></button></div>
      </aside>
      <main className="content">
        <header><button className="mobile-menu" aria-label="Open menu"><Icon name="menu"/></button><div><p className="eyebrow">SATURDAY, 28 JUNE 2025</p><h1>Good morning, Seva Foundation <span>👋</span></h1><p className="subtitle">Here's what's happening with your services today.</p></div><div className="header-actions"><button className="icon-button" aria-label="Notifications"><Icon name="bell"/><i></i></button><div className="avatar">AM</div><button className="profile-button">Ananya More <span>⌄</span></button></div></header>
        {active === 'Overview' && <><section className="availability"><div className="availability-icon"><span></span></div><div><strong>{online ? 'You are available to serve' : 'You are currently unavailable'}</strong><p>{online ? 'Your service is visible to Warkaris and Control Room.' : 'Turn on availability when your team is ready.'}</p></div><button className={'toggle ' + (online ? 'on' : '')} onClick={() => setOnline(!online)} aria-label="Toggle service availability"><span></span></button><b className={online ? 'status on-text' : 'status'}>{online ? 'Available' : 'Unavailable'}</b></section>
        <section className="stats">{[
          { label: 'Active requests', icon: 'requests', value: '04', change: '+2' },
          { label: 'Services today', icon: 'check', value: '12', change: '+20%' },
          { label: 'People served', icon: 'users', value: '384', change: '+64' },
          { label: 'Avg. response time', icon: 'clock', value: '8 min', change: '↓ 2 min' }
        ].map((stat, i) => (
          <article key={i} className={`metric-card ${focusedMetric === i ? 'focused' : ''}`} onClick={() => setFocusedMetric(focusedMetric === i ? null : i)}>
            <div className="stat-top"><span>{stat.label}</span><Icon name={stat.icon as IconName}/></div>
            <strong>{stat.value}</strong><p><em>{stat.change}</em> from yesterday</p>
          </article>
        ))}</section>
        <section className="grid-layout"><div className={`request-panel card ${focusedCard === 'requests' ? 'focused' : ''}`} onClick={() => setFocusedCard(focusedCard === 'requests' ? null : 'requests')}><div className="section-heading"><div><h2>Incoming service requests <span>4 new</span></h2><p>Requests that need your response</p></div><button className="text-button" onClick={() => setActive('Service Requests')}>View all <Icon name="arrow" size={16}/></button></div><div className="request-list">
          {['Dindi Tukaram Maharaj', 'Sant Gadgebaba Dindi', 'Warkari Group (18)'].map((name, i) => (
            <Request 
              key={name} 
              name={name} 
              details={i === 1 ? "Water · 120 people" : "Food · " + (i === 2 ? '18' : '45') + " people"} 
              distance={i === 0 ? "1.2 km away" : i === 1 ? "2.8 km away" : "0.7 km away"} 
              time={i === 0 ? "2 min ago" : i === 1 ? "8 min ago" : "12 min ago"}
              color={i === 0 ? "#f5b42a" : i === 1 ? "#de766d" : "#7393ca"}
              isFocused={focusedRequest === i}
              onFocus={() => setFocusedRequest(focusedRequest === i ? null : i)}
              onAction={alert}
            />
          ))}
        </div></div><div className={`route-card card ${focusedCard === 'route' ? 'focused' : ''}`} onClick={() => setFocusedCard(focusedCard === 'route' ? null : 'route')}><div className="section-heading"><div><h2>Active delivery</h2><p>Track your team in real time</p></div><button className="dots"><Icon name="more"/></button></div><div className="route-map"><div className="road r1"></div><div className="road r2"></div><div className="road r3"></div><div className="map-label one">Phaltan Road</div><div className="map-label two">Wakhari</div><div className="route-line"></div><div className="map-pin start"><Icon name="stock" size={14}/></div><div className="map-pin end"><Icon name="pin" size={15}/></div><div className="van">🚚</div><div className="route-pill"><span></span> On the way</div></div><div className="delivery-info"><div className="delivery-icon"><Icon name="truck"/></div><div><strong>Food delivery to Dindi Eknath</strong><p>20 food packets · ETA 14 min</p></div><button className="outline-button" onClick={() => alert('Opening route navigation…')}><Icon name="arrow" size={16}/> Navigate</button></div></div></section>
        <section className="lower-grid"><div className={`card stock-card ${focusedCard === 'stock' ? 'focused' : ''}`} onClick={() => setFocusedCard(focusedCard === 'stock' ? null : 'stock')}><div className="section-heading"><div><h2>Food & water stock</h2><p>Current inventory at your location</p></div><button className="dots"><Icon name="more"/></button></div><Stock label="Food packets" value="380" max="500" color="green"/><Stock label="Drinking water" value="84" max="200" color="blue"/><Stock label="ORS packets" value="32" max="100" color="orange"/><button className="restock" onClick={() => alert('Restock request sent to the Control Room.')}><Icon name="plus" size={17}/> Request restocking</button></div><div className={`card zone-card ${focusedCard === 'zone' ? 'focused' : ''}`} onClick={() => setFocusedCard(focusedCard === 'zone' ? null : 'zone')}><div className="section-heading"><div><h2>Your service zone</h2><p>Currently assigned area</p></div><button className="dots"><Icon name="more"/></button></div><div className="zone-info"><div className="zone-icon"><Icon name="pin"/></div><div><strong>Wakhari – Zone 3</strong><p>Phaltan Road, near Wakhari Chowk</p></div></div><div className="zone-line"><span>Operating hours</span><b>06:00 AM – 10:00 PM</b></div><div className="zone-line"><span>Service radius</span><b>5 km</b></div><button className="manage-zone" onClick={() => alert('Zone settings opened.')}>Manage service zone <Icon name="arrow" size={16}/></button></div><div className={`card alert-card ${focusedCard === 'alert' ? 'focused' : ''}`} onClick={() => setFocusedCard(focusedCard === 'alert' ? null : 'alert')}><div className="alert-icon"><Icon name="warning"/></div><h2>Need backup?</h2><p>Request support from nearby providers or the Control Room.</p><button onClick={() => alert('Backup request sent.')}>Request backup <Icon name="arrow" size={16}/></button><a onClick={() => alert('Problem report form opened.')}>Report a problem</a></div></section>
        </>}{active !== 'Overview' && <FeaturePanel active={active} notify={alert} focusedCard={focusedCard} setFocusedCard={setFocusedCard}/>}</main>{notice && <div className="toast"><Icon name="check" size={18}/>{notice}</div>}
    </div>
  </>;
}

function Request({ name, details, distance, time, color, isFocused, onFocus, onAction }: { name: string; details: string; distance: string; time: string; color: string; isFocused: boolean; onFocus: () => void; onAction: (value: string) => void }) { 
  return <div className={`request request-card ${isFocused ? 'focused' : ''}`} onClick={onFocus}>
    <div className="request-avatar" style={{ background: color }}>{name.split(' ').slice(0, 2).map(n => n[0]).join('')}</div>
    <div className="request-copy"><strong>{name}</strong><p>{details} <span>•</span> {distance}</p><small><Icon name="clock" size={13}/>{time}</small></div>
    <div className="request-actions"><button className="reject" onClick={() => onAction(`Request from ${name} rejected.`)}><Icon name="x" size={17}/> Reject</button><button className="accept" onClick={() => onAction(`Request from ${name} accepted.`)}><Icon name="check" size={17}/> Accept</button></div>
  </div> 
}

function Stock({ label, value, max, color }: { label: string; value: string; max: string; color: string }) { 
  const pct = Math.round(Number(value) / Number(max) * 100); 
  return <div className="stock-row"><div><strong>{label}</strong><span>{value} <small>/ {max}</small></span></div><div className="progress"><i className={color} style={{ width: `${pct}%` }}></i></div></div> 
}

function FeaturePanel({ active, notify, focusedCard, setFocusedCard }: { active: string; notify: (message: string) => void; focusedCard: string | null; setFocusedCard: (card: string | null) => void }) {
  const [requestStatus, setRequestStatus] = useState(['New', 'New', 'New', 'On the way']);
  const [stock, setStock] = useState({ food: 380, water: 84, ors: 32 });
  const [vehicle, setVehicle] = useState('MH 12 AB 4702');
  const [proof, setProof] = useState('');
  const advance = (index: number) => { const next: Record<string, string> = { New: 'Accepted', Accepted: 'On the way', 'On the way': 'Arrived', Arrived: 'Picked up', 'Picked up': 'Delivered' }; setRequestStatus(items => items.map((item, i) => i === index ? next[item] ?? item : item)); notify(`Service status updated to ${next[requestStatus[index]] ?? requestStatus[index]}.`); };
  const submit = (event: FormEvent, message: string) => { event.preventDefault(); notify(message); };
  if (active === 'Service Requests') return <section className={`card feature-panel ${focusedCard === 'requests-panel' ? 'focused' : ''}`} onClick={() => setFocusedCard(focusedCard === 'requests-panel' ? null : 'requests-panel')}><div className="section-heading"><div><h2>Service request queue</h2><p>Accept requests, see locations, and update delivery progress.</p></div></div>{['Dindi Tukaram Maharaj', 'Sant Gadgebaba Dindi', 'Warkari Group (18)', 'Dindi Eknath Maharaj'].map((name, i) => <div className="feature-request" key={name}><div><strong>{name}</strong><p>{i === 1 ? 'Water · 120 people' : 'Food · ' + (i === 2 ? '18' : i === 3 ? '20' : '45') + ' people'} · Delivery location {i + 1}.2 km away</p><small>Pickup: Seva Foundation, Wakhari Chowk</small></div><div className="request-actions">{requestStatus[i] === 'New' ? <><button className="reject" onClick={() => { setRequestStatus(items => items.map((item, x) => x === i ? 'Rejected' : item)); notify('Request rejected.'); }}>Reject</button><button className="accept" onClick={() => advance(i)}>Accept</button></> : requestStatus[i] === 'Rejected' ? <span className="status-badge">Rejected</span> : requestStatus[i] === 'Delivered' ? <span className="status-badge delivered">Delivered</span> : <button className="accept" onClick={() => advance(i)}>Mark {({ Accepted: 'On the way', 'On the way': 'Arrived', Arrived: 'Picked up', 'Picked up': 'Delivered' } as Record<string, string>)[requestStatus[i]]}</button>}</div></div>)}<form className="proof-form" onSubmit={e => submit(e, 'Delivery proof uploaded successfully.')}><label>Upload delivery proof<input type="file" onChange={e => setProof(e.target.files?.[0]?.name ?? '')}/></label><span>{proof || 'No file selected'}</span><button className="outline-button" type="submit">Upload proof</button></form></section>;
  if (active === 'Fleet & Capacity') return <section className={`card feature-panel ${focusedCard === 'fleet' ? 'focused' : ''}`} onClick={() => setFocusedCard(focusedCard === 'fleet' ? null : 'fleet')}><div className="section-heading"><div><h2>Fleet & carrying capacity</h2><p>Add or update vehicles used for your service.</p></div></div><form className="form-grid" onSubmit={e => submit(e, 'Vehicle details saved.')}><label>Vehicle registration<input value={vehicle} onChange={e => setVehicle(e.target.value)} required/></label><label>Vehicle type<select defaultValue="Delivery van"><option>Delivery van</option><option>Ambulance</option><option>Water tanker</option><option>Passenger transport</option></select></label><label>Carrying capacity<input type="number" defaultValue="500" min="1" required/></label><label>Driver / team lead<input defaultValue="Ramesh Shinde" required/></label><button className="accept" type="submit">Save vehicle</button></form><div className="capacity-readout"><strong>Current allocation: 380 / 500 food packets</strong><div className="progress"><i className="green" style={{ width: '76%' }}/></div></div></section>;
  if (active === 'Stock & Resources') return <section className={`card feature-panel ${focusedCard === 'stock-panel' ? 'focused' : ''}`} onClick={() => setFocusedCard(focusedCard === 'stock-panel' ? null : 'stock-panel')}><div className="section-heading"><div><h2>Food & water stock</h2><p>Update available stock; your changes are reflected immediately.</p></div></div><form className="stock-editor" onSubmit={e => submit(e, 'Stock levels saved.')}>{([['food', 'Food packets', 500], ['water', 'Drinking water', 200], ['ors', 'ORS packets', 100]] as const).map(([key, label, max]) => <label key={key}>{label}<span><input type="number" min="0" max={max} value={stock[key]} onChange={e => setStock({ ...stock, [key]: Number(e.target.value) })}/><small> / {max}</small></span></label>)}<button className="accept" type="submit">Save stock levels</button><button className="restock" type="button" onClick={() => notify('Restock request sent to the Control Room.')}>Request restocking</button></form></section>;
  if (active === 'Service History') return <section className={`card feature-panel ${focusedCard === 'history' ? 'focused' : ''}`} onClick={() => setFocusedCard(focusedCard === 'history' ? null : 'history')}><div className="section-heading"><div><h2>Completed service history</h2><p>Your confirmed deliveries and completed tasks.</p></div></div><div className="history-table"><div className="table-row table-head"><span>Recipient</span><span>Service</span><span>Date</span><span>Status</span></div>{[['Dindi Jnaneshwar', 'Water · 85 people', 'Yesterday'], ['Dindi Namdev', 'Food · 60 people', '27 Jun'], ['Warkari Group (12)', 'ORS · 12 packets', '27 Jun']].map(item => <div className="table-row" key={item[0]}><strong>{item[0]}</strong><span>{item[1]}</span><span>{item[2]}</span><span className="status-badge delivered">Delivered</span></div>)}</div></section>;
  if (active === 'Impact Report') return <section className="impact-grid"><div className={`card impact-main ${focusedCard === 'impact-main' ? 'focused' : ''}`} onClick={() => setFocusedCard(focusedCard === 'impact-main' ? null : 'impact-main')}><p className="eyebrow">THIS WARI</p><h2>384 people served</h2><strong>12</strong><p>successful services completed by your team.</p><div className="bar-chart">{[42, 68, 55, 84, 72, 92, 66].map((height, i) => <i key={i} style={{ height: `${height}%` }}/>)}</div></div><div className={`card impact-list ${focusedCard === 'impact-list' ? 'focused' : ''}`} onClick={() => setFocusedCard(focusedCard === 'impact-list' ? null : 'impact-list')}><h2>Impact summary</h2><p><b>380</b> food packets distributed</p><p><b>116 L</b> drinking water supplied</p><p><b>32</b> ORS packets provided</p><p><b>8 min</b> average response time</p></div></section>;
  return <section className={`card feature-panel ${focusedCard === 'settings' ? 'focused' : ''}`} onClick={() => setFocusedCard(focusedCard === 'settings' ? null : 'settings')}><div className="section-heading"><div><h2>Organisation & service settings</h2><p>Update the information shown to the Control Room.</p></div></div><form className="form-grid" onSubmit={e => submit(e, 'Organisation profile saved.')}><label>Organisation name<input defaultValue="Seva Foundation" required/></label><label>Representative name<input defaultValue="Ananya More" required/></label><label>Service type<select defaultValue="Food centre"><option>Food centre</option><option>Water centre</option><option>Medical team</option><option>Ambulance team</option><option>Accommodation provider</option><option>Sanitation team</option><option>Volunteer</option><option>Transport provider</option><option>NGO</option></select></label><label>Phone number<input defaultValue="+91 98765 43210" required/></label><label>Service location<input defaultValue="Phaltan Road, Wakhari Chowk" required/></label><label>Working zone<select defaultValue="Wakhari – Zone 3"><option>Wakhari – Zone 3</option><option>Phaltan – Zone 2</option><option>Pandharpur – Zone 1</option></select></label><label>Operating from<input type="time" defaultValue="06:00"/></label><label>Operating until<input type="time" defaultValue="22:00"/></label><label className="wide">Team skills<textarea defaultValue="Food distribution, First aid, Crowd management"/></label><button className="accept" type="submit">Save changes</button></form></section>;
}
