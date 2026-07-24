/* =============================================================================
   DS email — APEX "avorio hard" (livrea Scuola)
   Riferimento canonico: emails/proto/A-avorio-hard.html (approvato).

   Regole del linguaggio:
   • palco navy, card avorio, RADIUS 0 ovunque, hairline al posto delle ombre;
   • giallo #F4E718 = SOLO fill (con ink navy sopra) o accento su navy —
     MAI testo su avorio (contrasto 1.1:1);
   • arancio #FF8A3D = SOLO barre/tick decorativi — MAI testo (2.1:1 su avorio);
   • ogni colore usato come testo passa WCAG AA (verificato in build.test.mjs).
   ============================================================================= */

export const C = {
  /* ---- palco (fuori dalla card) ---- */
  palco: '#050E3F', // navy deep — fondo email + cella "IMPORTO" invertita
  line: '#1B2650', // hairline su navy (ticker, footer)
  inkOn: '#EAF0FF', // testo primario su navy
  muted: '#8A94B8', // testo secondario su navy — 6.1:1 su palco
  faint: '#4A5480', // SOLO decorativo (2.5:1): mai testo

  /* ---- card avorio ---- */
  card: '#F7F4EC',
  ink: '#04091C', // testo forte su avorio
  ink2: '#4C5566', // corpo — 6.8:1 su avorio
  ink3: '#5B6472', // note/minuscoli — 5.4:1 su avorio
  hair: '#E0D9C6', // filetto su avorio
  grid: '#DCD4BF', // fondo del reticolo dati (le fughe da 1px)
  cell: '#FFFFFF', // fondo cella dati
  label: '#6A7386', // label mono nelle celle — 4.8:1 su bianco

  /* ---- livrea Scuola (= --accent / --accent-2 di apex-tokens.css) ---- */
  yellow: '#F4E718',
  orange: '#FF8A3D',

  /* ---- toni di stato -------------------------------------------------------
     solid  → targa eyebrow (testo bianco) + barra del banner
     accent → parola-chiave del titolo + valori "critici" nel reticolo
     bg/fg  → banner (fg su bg)
     `info`: il navy non può fare da accento (è l'inchiostro). Uso il ciano del
     telaio APEX (--accent #37C8FF) portato a L≈27% → #00688C, che passa AA
     sia su avorio (5.7:1) sia sotto testo bianco (6.3:1).                    */
  info: { solid: '#00688C', accent: '#00688C', bg: '#E7F2F7', fg: '#0A4E68' },
  success: { solid: '#137333', accent: '#137333', bg: '#EAF6EE', fg: '#0E5A28' },
  warning: { solid: '#8F5600', accent: '#8F5600', bg: '#FFF4E5', fg: '#6E4300' },
  danger: { solid: '#C0161C', accent: '#C0161C', bg: '#FBEAEA', fg: '#7A1116' },
  critical: { solid: '#8F1014', accent: '#8F1014', bg: '#FBEAEA', fg: '#7A1116' },
};

export const F = {
  // Archivo Expanded con fallback condensati: senza web-font il titolo resta
  // imponente (Arial Narrow / Helvetica Neue Condensed / Impact).
  display:
    "'Archivo Expanded','Archivo','Arial Narrow','Helvetica Neue Condensed',Impact,Arial,sans-serif",
  mono: "'JetBrains Mono',ui-monospace,'Courier New',monospace",
  body: "'Inter',-apple-system,'Segoe UI',Arial,sans-serif",
};

export const PORTAL_URL = 'https://trionoracing.it/portale';
export const SUPPORT_EMAIL = 'segreteria.scuola@trionoracing.it';
