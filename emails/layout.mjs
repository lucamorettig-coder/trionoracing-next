import { C, F } from './tokens.mjs';
import { lockup, eyebrow, paragraph, infoBlock, banner, stepsList, cta, footer } from './components.mjs';

export function renderEmail(m) {
  const preheader = (m.intro?.[m.intro.length - 1] || m.title).replace(/<[^>]+>/g, '');
  const body = [
    eyebrow(m.status, m.eyebrow),
    `<h1 style="margin:16px 0 12px 0;font-family:${F.display};font-size:24px;line-height:1.15;font-weight:800;letter-spacing:-.01em;text-transform:uppercase;color:${C.ink};">${m.title}</h1>`,
    ...(m.intro || []).map(paragraph),
    m.infoRows ? infoBlock(m.infoRows) : '',
    m.banner ? banner(m.banner) : '',
    m.steps ? stepsList(m.steps) : '',
    m.cta ? cta(m.cta) : '',
    m.note ? `<p style="margin:18px 0 0 0;font-family:${F.body};font-size:12px;line-height:1.6;color:${C.ink2};">${m.note}</p>` : '',
    footer(m.signature, m.footerContact),
  ].join('\n');

  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<link href="https://fonts.googleapis.com/css2?family=Archivo+Expanded:wght@700;800&family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet" />
<title>${m.title}</title>
</head>
<body style="margin:0;padding:0;background:${C.palco};font-family:${F.body};color:${C.ink};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${preheader}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${C.palco}" style="background:${C.palco};">
  <tr><td align="center" style="padding:30px 16px 40px 16px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;">
      <tr><td style="padding:0 2px 20px 2px;">${lockup()}</td></tr>
      <tr><td bgcolor="${C.card}" style="background:${C.card};border-radius:16px;padding:30px 26px;">${body}</td></tr>
      <tr><td align="center" style="padding:22px 12px 0 12px;">
        <p style="margin:0;font-family:${F.mono};font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:${C.muted};">© 2026 Triono Racing — Comunicazione automatica</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
