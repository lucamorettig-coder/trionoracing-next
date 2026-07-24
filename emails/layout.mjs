/* =============================================================================
   layout.mjs — unico export: renderEmail(content)

   Schema content:
   { status, eyebrow, title, titleAccent?, intro, infoRows?, banner?, steps?,
     cta?, note?, signature, footerContact? }

   `titleAccent` è la sottostringa del titolo colorata col tono dello stato.
   ============================================================================= */
import { C, F } from './tokens.mjs';
import {
  lockup,
  ticker,
  eyebrow,
  titleDisplay,
  rule,
  kicker,
  paragraph,
  infoBlock,
  banner,
  stepsList,
  cta,
  footer,
  cardCut,
  sp,
} from './components.mjs';

/* Terza voce del ticker, derivata dal titolo: nessun campo in più nei content. */
const TOPICS = [
  [/certificat/i, 'Certificato medico'],
  [/tesseramento|fci/i, 'Tesseramento FCI'],
  [/pagament|rata|scadut|quota|sospension/i, 'Pagamenti'],
  [/iscrizione/i, 'Iscrizioni'],
];
const topicOf = (title) => (TOPICS.find(([re]) => re.test(title)) || [, 'Area riservata'])[1];

export function renderEmail(m) {
  const preheader = (m.intro?.[m.intro.length - 1] || m.title).replace(/<[^>]+>/g, '');
  const intro = m.intro || [];

  const body = [
    eyebrow(m.status, m.eyebrow),
    sp(20),
    titleDisplay(m.title, m.titleAccent, m.status),
    sp(12),
    rule(),
    sp(24),
    intro.map((p, i) => paragraph(p, i === 0)).join('\n'),
    m.infoRows ? `${sp(14)}${kicker('Dettaglio pagamento')}${sp(10)}${infoBlock(m.infoRows)}` : '',
    m.banner ? `${sp(22)}${banner(m.banner)}` : '',
    m.steps ? `${sp(26)}${stepsList(m.steps, m.status)}` : '',
    m.cta ? `${sp(26)}${cta(m.cta)}` : '',
    m.note
      ? `${sp(20)}<p style="margin:0;font-family:${F.body};font-size:12.5px;line-height:1.6;color:${C.ink3};">${m.note}</p>`
      : '',
    footer(m.signature, m.footerContact),
  ]
    .filter(Boolean)
    .join('\n');

  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<link href="https://fonts.googleapis.com/css2?family=Archivo+Expanded:wght@700;800;900&family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet" />
<title>${m.title}</title>
<style>
  /* Solo progressive-enhancement: nessuno stile strutturale vive qui. */
  @media only screen and (max-width:620px) {
    .px   { padding-left:20px !important; padding-right:20px !important; }
    .h1   { font-size:32px !important; }
    .stack{ display:block !important; width:100% !important; }
  }
</style>
<!--[if mso]>
<style>
  .display { font-family:'Arial Narrow',Arial,sans-serif !important; }
  .mono    { font-family:'Courier New',Courier,monospace !important; }
</style>
<![endif]-->
</head>
<body style="margin:0;padding:0;background:${C.palco};-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${preheader}</div>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${C.palco}" style="background:${C.palco};">
<tr><td align="center" style="padding:26px 12px 40px 12px;">

<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:600px;max-width:600px;">

  <tr><td style="padding:0 2px 14px 2px;">${lockup()}</td></tr>
  <tr><td style="padding:0 2px;">${ticker(['Comunicazione automatica', 'Stato iscrizione', topicOf(m.title)])}</td></tr>
  <tr><td style="height:20px;line-height:20px;font-size:0;">&nbsp;</td></tr>

  <!-- CARD AVORIO — spigoli netti, niente ombra: il taglio a gradini fa da geometria "targa" -->
  <tr><td>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td width="72" height="4" bgcolor="${C.orange}" style="width:72px;height:4px;line-height:4px;font-size:0;background:${C.orange};">&nbsp;</td>
        <td height="4" bgcolor="${C.card}" style="height:4px;line-height:4px;font-size:0;background:${C.card};">&nbsp;</td>
      </tr>
      <tr><td colspan="2" bgcolor="${C.card}" class="px" style="background:${C.card};padding:28px 30px 18px 30px;">
${body}
      </td></tr>
      <tr><td colspan="2" style="font-size:0;line-height:0;">${cardCut()}</td></tr>
    </table>
  </td></tr>

  <tr><td style="height:18px;line-height:18px;font-size:0;">&nbsp;</td></tr>
  <tr><td style="padding:0 2px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid ${C.line};"><tr>
      <td class="mono" style="padding:12px 0 0 0;font-family:${F.mono};font-size:10px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:${C.muted};">&copy; ${new Date().getFullYear()} Triono Racing <span style="color:${C.yellow};">&middot;</span> Comunicazione automatica</td>
    </tr></table>
  </td></tr>

</table>

</td></tr>
</table>
</body>
</html>`;
}
