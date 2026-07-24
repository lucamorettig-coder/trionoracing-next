/* =============================================================================
   Componenti email — tutti table-based, radius 0, nessuna immagine remota.
   Gli "angoli tagliati" (targa, CTA, card) sono scalini di celle: niente
   clip-path/SVG, funzionano anche in Outlook.
   ============================================================================= */
import { C, F } from './tokens.mjs';

export const tone = (s) => C[s] || C.info;

/** spaziatore verticale email-safe */
export const sp = (h) =>
  `<div style="height:${h}px;line-height:${h}px;font-size:0;">&nbsp;</div>`;

/** riga piena di colore (barra/filetto) */
const bar = (h, bg, extra = '') =>
  `<td height="${h}" bgcolor="${bg}" style="height:${h}px;line-height:${h}px;font-size:0;background:${bg};${extra}">&nbsp;</td>`;

const gap = (w, h) =>
  `<td width="${w}" height="${h}" style="width:${w}px;height:${h}px;line-height:${h}px;font-size:0;">&nbsp;</td>`;

/* -----------------------------------------------------------------------------
   REGIA — lockup + ticker (sul palco navy)
   -------------------------------------------------------------------------- */
export const lockup = () => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
    <td valign="middle" width="44" style="width:44px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
        <td width="44" height="44" align="center" valign="middle" bgcolor="${C.yellow}" class="display" style="width:44px;height:44px;background:${C.yellow};font-family:${F.display};font-size:24px;font-weight:800;letter-spacing:-.02em;color:${C.palco};">T</td>
      </tr></table>
    </td>
    <td valign="middle" style="padding-left:12px;">
      <div class="display" style="font-family:${F.display};font-size:16px;font-weight:800;text-transform:uppercase;letter-spacing:-.01em;color:${C.inkOn};line-height:1.05;">Triono Racing</div>
      <div class="mono" style="font-family:${F.mono};font-size:10px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:${C.muted};padding-top:3px;">Scuola di ciclismo</div>
    </td>
    <td valign="middle" align="right" class="mono" style="font-family:${F.mono};font-size:10px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:${C.muted};">Area riservata</td>
  </tr></table>`;

export const ticker = (segments) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid ${C.line};border-bottom:1px solid ${C.line};"><tr>
    <td class="mono" style="padding:7px 0;font-family:${F.mono};font-size:9px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:${C.muted};">
      ${segments.join(` <span style="color:${C.yellow};">&middot;</span> `)}
    </td>
  </tr></table>`;

/* -----------------------------------------------------------------------------
   TARGA EYEBROW — angolo inferiore destro tagliato a gradini
   -------------------------------------------------------------------------- */
const plateStairs = (bg) =>
  [6, 12, 18, 24]
    .map(
      (w) => `<tr><td style="font-size:0;line-height:0;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>${bar(3, bg)}${gap(w, 3)}</tr></table>
    </td></tr>`,
    )
    .join('');

export const eyebrow = (status, text) => {
  const t = tone(status);
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
      <tr><td bgcolor="${t.solid}" class="mono" style="background:${t.solid};padding:9px 15px 8px 15px;font-family:${F.mono};font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#FFFFFF;">${text}</td></tr>
      ${plateStairs(t.solid)}
    </table>
  </td></tr></table>`;
};

/* -----------------------------------------------------------------------------
   TITOLO DISPLAY + riga di partenza
   -------------------------------------------------------------------------- */
export const titleDisplay = (title, accentWord, status) => {
  let html = title;
  if (accentWord) {
    const i = title.indexOf(accentWord);
    if (i >= 0) {
      html =
        title.slice(0, i) +
        `<span style="color:${tone(status).accent};">${accentWord}</span>` +
        title.slice(i + accentWord.length);
    }
  }
  return `<h1 class="display h1" style="margin:0;font-family:${F.display};font-size:46px;line-height:0.94;font-weight:800;letter-spacing:-.03em;text-transform:uppercase;color:${C.ink};">${html}</h1>`;
};

/** filetto con segmento accento a sinistra */
export const rule = () => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
    <td width="64" height="4" bgcolor="${C.orange}" style="width:64px;height:4px;line-height:4px;font-size:0;background:${C.orange};">&nbsp;</td>
    ${bar(4, C.hair)}
  </tr></table>`;

/** micro-intestazione: tick accento + label mono */
export const kicker = (text) => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
    <td width="26" height="2" bgcolor="${C.orange}" style="width:26px;height:2px;line-height:2px;font-size:0;background:${C.orange};">&nbsp;</td>
    <td class="mono" style="padding-left:12px;font-family:${F.mono};font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${C.ink2};">${text}</td>
  </tr></table>`;

/* -----------------------------------------------------------------------------
   CORPO
   -------------------------------------------------------------------------- */
export const paragraph = (html, lead = false) =>
  lead
    ? `<p style="margin:0 0 12px 0;font-family:${F.body};font-size:15px;line-height:1.65;color:${C.ink};font-weight:600;">${html}</p>`
    : `<p style="margin:0 0 12px 0;font-family:${F.body};font-size:15px;line-height:1.7;color:${C.ink2};">${html}</p>`;

/* -----------------------------------------------------------------------------
   RETICOLO DATI (HUD) — cellspacing 1 su fondo hairline = fughe da 1px.
   Layout: le celle "larghe" (valore lungo) occupano la riga intera, le altre
   si appaiano a due a due. La cella IMPORTO è invertita (palco navy + giallo).
   -------------------------------------------------------------------------- */
const plain = (v) => String(v).replace(/<[^>]+>/g, '');
/** parola più lunga: i placeholder Make sono stringhe non spezzabili e, a 20px
 *  mono, farebbero sfondare i 600px della tabella (visto su 02-reminder). */
const longestWord = (v) => plain(v).split(/\s+/).reduce((n, w) => Math.max(n, w.length), 0);

const dataCell = (c, half) => {
  const invert = c.invert;
  const bg = invert ? C.palco : C.cell;
  const labelColor = invert ? C.muted : C.label;
  const valueColor = invert ? C.yellow : c.accent || C.ink;
  const size = c.wide ? 14 : 20;
  // break-all solo dove serve davvero: non tocca i valori reali (date, importi)
  const brk = longestWord(c.value) > 20 ? 'word-break:break-all;' : '';
  const attrs = half
    ? `class="stack" width="50%" style="width:50%;background:${bg};padding:13px 15px 14px 15px;"`
    : `style="background:${bg};padding:13px 15px 14px 15px;"`;
  return `<td bgcolor="${bg}" valign="top" ${attrs}>
    <div class="mono" style="font-family:${F.mono};font-size:10px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:${labelColor};">${c.label}</div>
    <div class="mono" style="font-family:${F.mono};font-size:${size}px;font-weight:700;letter-spacing:-.01em;color:${valueColor};padding-top:${c.wide ? 6 : 7}px;line-height:${c.wide ? 1.4 : 1.15};${brk}">${c.value}</div>
  </td>`;
};

export const infoBlock = (rows) => {
  const cells = rows.map((r) => ({
    label: r.label,
    value: r.value,
    invert: /^importo$/i.test(r.label),
    accent: r.tone ? tone(r.tone).accent : null,
    wide: r.wide ?? plain(r.value).length > 46,
  }));

  const lines = [];
  for (let i = 0; i < cells.length; i++) {
    const a = cells[i];
    const b = cells[i + 1];
    if (!a.wide && b && !b.wide) {
      lines.push([a, b]);
      i++;
    } else {
      lines.push([a]);
    }
  }

  const body = lines
    .map((l) =>
      l.length === 1
        ? `<tr>${dataCell(l[0], false)}</tr>`
        : `<tr><td style="padding:0;">
             <table role="presentation" width="100%" cellspacing="1" cellpadding="0" border="0" bgcolor="${C.grid}" style="background:${C.grid};table-layout:fixed;"><tr>${dataCell(l[0], true)}${dataCell(l[1], true)}</tr></table>
           </td></tr>`,
    )
    .join('');

  return `<table role="presentation" width="100%" cellspacing="1" cellpadding="0" border="0" bgcolor="${C.grid}" style="background:${C.grid};table-layout:fixed;">${body}</table>`;
};

/* -----------------------------------------------------------------------------
   BANNER — barra laterale piena, spigoli netti
   -------------------------------------------------------------------------- */
export const banner = (b) => {
  const t = tone(b.tone);
  const title = b.title
    ? `<div class="mono" style="font-family:${F.mono};font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${t.fg};padding-bottom:7px;">${b.title}</div>`
    : '';
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
    <td width="3" bgcolor="${t.solid}" style="width:3px;background:${t.solid};font-size:0;line-height:0;">&nbsp;</td>
    <td bgcolor="${t.bg}" style="background:${t.bg};padding:14px 16px;">
      ${title}<p style="margin:0;font-family:${F.body};font-size:14px;line-height:1.6;color:${t.fg};">${b.text}</p>
    </td>
  </tr></table>`;
};

/* -----------------------------------------------------------------------------
   STEPS — indice mono 01/02/03, niente <ol> (rendering instabile in email)
   -------------------------------------------------------------------------- */
export const stepsList = (steps, status = 'info') => {
  const t = tone(status);
  const rows = steps
    .map(
      (s, i) => `<tr>
      <td width="34" valign="top" class="mono" style="width:34px;font-family:${F.mono};font-size:12px;font-weight:700;letter-spacing:.06em;color:${t.accent};padding:0 0 10px 0;line-height:1.55;">${String(i + 1).padStart(2, '0')}</td>
      <td valign="top" style="font-family:${F.body};font-size:14px;line-height:1.55;color:${C.ink2};padding:0 0 10px 0;">${s}</td>
    </tr>`,
    )
    .join('');
  return `${kicker('Cosa fare ora')}${sp(12)}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${rows}</table>`;
};

/* -----------------------------------------------------------------------------
   CTA — lato destro tagliato in diagonale (scalini da 6px)
   -------------------------------------------------------------------------- */
const ctaStairs = (bg) =>
  [0, 3, 6, 9, 12, 15, 18, 21]
    .map(
      (w) =>
        `<table role="presentation" width="24" cellspacing="0" cellpadding="0" border="0"><tr>${bar(6, bg)}${w ? `<td width="${w}" style="width:${w}px;font-size:0;">&nbsp;</td>` : ''}</tr></table>`,
    )
    .join('');

export const cta = (c) => {
  const danger = c.tone === 'danger' || c.tone === 'critical';
  const fill = danger ? C.danger.solid : C.yellow;
  const fg = danger ? '#FFFFFF' : C.palco;
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
    <td bgcolor="${fill}" valign="top" style="background:${fill};">
      <a href="${c.href}" target="_blank" class="mono" style="display:block;padding:16px 26px 16px 30px;font-family:${F.mono};font-size:12px;line-height:16px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${fg};text-decoration:none;white-space:nowrap;">${c.label} &nbsp;&rarr;</a>
    </td>
    <td width="24" valign="top" style="width:24px;font-size:0;line-height:0;">${ctaStairs(fill)}</td>
  </tr></table>`;
};

/* -----------------------------------------------------------------------------
   FIRMA (dentro la card)
   -------------------------------------------------------------------------- */
export const footer = (signature, footerContact) => `
  ${sp(22)}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>${bar(1, C.hair)}</tr></table>
  ${sp(16)}
  <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
    <td width="18" height="2" bgcolor="${C.ink}" style="width:18px;height:2px;line-height:2px;font-size:0;background:${C.ink};">&nbsp;</td>
    <td class="display" style="padding-left:10px;font-family:${F.display};font-size:15px;font-weight:800;text-transform:uppercase;letter-spacing:-.01em;color:${C.ink};">${signature}</td>
  </tr></table>
  ${footerContact ? `${sp(12)}${footerContact}` : ''}`;

/* -----------------------------------------------------------------------------
   ANGOLO INFERIORE DESTRO DELLA CARD — il palco entra nella card
   -------------------------------------------------------------------------- */
export const cardCut = () =>
  [12, 24, 36, 48]
    .map(
      (w) => `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>${bar(6, C.card)}${gap(w, 6)}</tr></table>`,
    )
    .join('');
