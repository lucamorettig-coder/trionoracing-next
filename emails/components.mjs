import { C, F } from './tokens.mjs';
const tone = (s) => C[s] || C.info;

export const lockup = () => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
    <td valign="middle" style="width:44px;height:44px;background:${C.yellow};border-radius:10px;text-align:center;font-family:${F.display};font-weight:800;font-size:22px;color:${C.palco};">T</td>
    <td valign="middle" style="padding-left:12px;font-family:${F.body};">
      <div style="font-weight:700;font-size:15px;color:${C.inkOn};letter-spacing:.01em;">TRIONO RACING</div>
      <div style="font-family:${F.mono};font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:${C.muted};">Scuola · Area Riservata</div>
    </td>
  </tr></table>`;

export const eyebrow = (status, text) => {
  const t = tone(status);
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
    <td style="background:${t.bg};border-radius:999px;padding:6px 13px;font-family:${F.mono};font-weight:600;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:${t.fg};">${text}</td>
  </tr></table>`;
};

export const paragraph = (html) =>
  `<p style="margin:0 0 14px 0;font-family:${F.body};font-size:15px;line-height:1.65;color:${C.ink2};">${html}</p>`;

export const infoBlock = (rows) => {
  const body = rows.map((r, i) => {
    const last = i === rows.length - 1;
    const bb = last ? '' : `border-bottom:1px solid ${C.hair};`;
    const vcol = r.tone ? tone(r.tone).fg : C.ink;
    const big = last ? 'font-size:19px;font-weight:800;' : 'font-size:14px;font-weight:600;';
    return `<tr>
      <td style="padding:12px 0;${bb}font-family:${F.body};font-size:13px;color:${C.ink2};">${r.label}</td>
      <td align="right" style="padding:12px 0;${bb}font-family:${F.body};${big}color:${vcol};">${r.value}</td>
    </tr>`;
  }).join('');
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:4px 0 6px 0;background:#FFFFFF;border:1px solid ${C.hair};border-radius:12px;">
    <tr><td style="padding:2px 16px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${body}</table></td></tr>
  </table>`;
};

export const banner = (b) => {
  const t = tone(b.tone);
  const title = b.title ? `<p style="margin:0 0 6px 0;font-family:${F.body};font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:.02em;color:${t.fg};">${b.title}</p>` : '';
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:16px 0 4px 0;background:${t.bg};border-left:4px solid ${t.fg};border-radius:10px;">
    <tr><td style="padding:14px 16px;">${title}<p style="margin:0;font-family:${F.body};font-size:14px;line-height:1.6;color:${t.fg};">${b.text}</p></td></tr>
  </table>`;
};

export const stepsList = (steps) => `
  <p style="margin:18px 0 8px 0;font-family:${F.mono};font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:${C.ink};font-weight:600;">Cosa fare ora</p>
  <ol style="margin:0 0 6px 20px;padding:0;font-family:${F.body};font-size:14px;line-height:1.7;color:${C.ink2};">
    ${steps.map((s) => `<li style="margin:0 0 4px 0;">${s}</li>`).join('')}
  </ol>`;

export const cta = (c) => {
  const fill = c.tone === 'danger' ? C.danger.fg : C.yellow;
  const fg = c.tone === 'danger' ? '#FFFFFF' : C.palco;
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0 2px 0;"><tr>
    <td style="background:${fill};border-radius:10px;">
      <a href="${c.href}" target="_blank" style="display:inline-block;padding:14px 26px;font-family:${F.body};font-size:15px;font-weight:700;color:${fg};text-decoration:none;border-radius:10px;">${c.label} &nbsp;&rarr;</a>
    </td></tr></table>`;
};

export const footer = (signature, footerContact) => `
  <div style="height:18px;line-height:18px;font-size:0;">&nbsp;</div>
  <div style="border-top:1px solid ${C.hair};height:1px;line-height:1px;font-size:0;">&nbsp;</div>
  <div style="height:14px;line-height:14px;font-size:0;">&nbsp;</div>
  <p style="margin:0;font-family:${F.body};font-size:12px;line-height:1.6;color:${C.ink2};">Per qualsiasi dubbio puoi rispondere direttamente a questa email.</p>
  ${footerContact ? `<div style="height:8px;font-size:0;">&nbsp;</div>${footerContact}` : ''}
  <p style="margin:12px 0 0 0;font-family:${F.body};font-size:14px;font-weight:700;color:${C.ink};">${signature}</p>`;
