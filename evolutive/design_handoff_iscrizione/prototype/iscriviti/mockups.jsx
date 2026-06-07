/* =============================================================
   mockups.jsx — "mockup illustrati" della UI del portale
   Stile: frame finestra/telefono con UI SEMPLIFICATA (barre al posto
   dei campi), pulsanti pieni nei colori brand. Chiaramente un DISEGNO,
   nessun dato personale reale. Step 02–04 + dettaglio checkout.
   Esporta su window. (R18 + Babel; no `const styles` globale)
   ============================================================= */

const TR_ICONS = {
  bike: 'M5.5 17.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm13 0a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM12 17.5 9 7h6m-3 10 3-7m-7.5 0H6m9.5-3 1.5 3',
  userPlus: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm10-3v6m3-3h-6',
  clipboard: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 7h6m-6 4h4',
  card: 'M3 10h18M5 6h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm2 9h3',
  check: 'M20 6 9 17l-5-5',
  image: 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Zm3.5 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM21 15l-5-5L5 21',
  heartPulse: 'M3.5 12H7l2-5 3 9 2.5-6 1.5 2h4M20.8 5.6a5.5 5.5 0 0 0-8.8 1.4 5.5 5.5 0 0 0-8.8-1.4',
  shield: 'M12 3l8 3v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-3Zm-2.5 8.5 2 2 3.5-3.5',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  refresh: 'M21 12a9 9 0 1 1-3-6.7M21 4v4h-4',
};

function TrIcon({ name, size = 22, stroke = 1.9, color = 'currentColor', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={style} aria-hidden="true">
      <path d={TR_ICONS[name]} />
    </svg>
  );
}

/* ---- atomi del "disegno" UI ---- */
function Bar({ w = '100%', h = 9, c = 'var(--navy-100)', r = 5, mt = 0 }) {
  return <div style={{ width: w, height: h, background: c, borderRadius: r, marginTop: mt, flexShrink: 0 }} />;
}
function FieldRow({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={{ fontFamily: 'var(--f-sans)', fontSize: 11.5, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '.01em' }}>{label}</span>
      <div style={{ height: 34, borderRadius: 9, border: '1.5px solid var(--line)', background: 'var(--bg-soft)', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
        <Bar w={value || '55%'} h={7} c="var(--navy-100)" />
      </div>
    </div>
  );
}
function MockBtn({ children, full = true, icon }) {
  return (
    <div style={{
      height: 38, width: full ? '100%' : 'auto', padding: full ? 0 : '0 18px',
      background: 'var(--navy-700)', color: '#fff', borderRadius: 11,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      fontFamily: 'var(--f-sans)', fontSize: 13.5, fontWeight: 600,
    }}>
      {children}{icon && <TrIcon name={icon} size={15} stroke={2.1} />}
    </div>
  );
}
function UploadTile({ icon, label }) {
  return (
    <div style={{
      flex: 1, minWidth: 0, height: 78, borderRadius: 11,
      border: '1.5px dashed var(--navy-200)', background: 'var(--bg-soft)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7,
    }}>
      <TrIcon name={icon} size={20} stroke={1.8} color="var(--navy-500)" />
      <span style={{ fontFamily: 'var(--f-sans)', fontSize: 10.5, fontWeight: 600, color: 'var(--ink-muted)', textAlign: 'center' }}>{label}</span>
      <div className="tr-plus" style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--navy-700)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: -1 }}>
        <span style={{ fontSize: 11, lineHeight: 1, fontWeight: 700 }}>+</span>
      </div>
    </div>
  );
}

/* ---- shell: finestra del browser (chrome + url) ---- */
function BrowserFrame({ title, children, pad = 18 }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--r-lg)', border: '1.5px solid var(--navy-100)',
      boxShadow: '0 18px 40px -18px rgba(31,45,90,.30), 0 2px 6px -2px rgba(31,45,90,.08)',
      overflow: 'hidden', width: '100%',
    }}>
      <div style={{ height: 30, background: 'var(--bg-muted)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E0817E' }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E3B765' }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8FC07A' }} />
        <div style={{ marginLeft: 8, flex: 1, height: 16, background: '#fff', border: '1px solid var(--line)', borderRadius: 5, display: 'flex', alignItems: 'center', padding: '0 8px' }}>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--ink-muted)', letterSpacing: '.02em', whiteSpace: 'nowrap', overflow: 'hidden' }}>area-genitori.triono.it</span>
        </div>
      </div>
      <div style={{ padding: pad }}>
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
            <Bar w={6} h={18} c="var(--sun-500)" r={3} />
            <span style={{ fontFamily: 'var(--f-sans)', fontSize: 14, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-.01em' }}>{title}</span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/* ---- STEP 02 · Registrazione ---- */
function MockRegister() {
  return (
    <BrowserFrame title="Crea account">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        <FieldRow label="Email" value="62%" />
        <FieldRow label="Password" value="44%" />
        <div style={{ marginTop: 3 }}><MockBtn icon="arrowRight">Crea account</MockBtn></div>
      </div>
    </BrowserFrame>
  );
}

/* ---- STEP 03 · Iscrizione (dati bambino + upload) ---- */
function MockIscrizione() {
  return (
    <BrowserFrame title="Dati del bambino">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        <div style={{ display: 'flex', gap: 11 }}>
          <div style={{ flex: 1 }}><FieldRow label="Nome" value="70%" /></div>
          <div style={{ flex: 1 }}><FieldRow label="Nascita" value="60%" /></div>
        </div>
        <div style={{ display: 'flex', gap: 11, marginTop: 2 }}>
          <UploadTile icon="image" label="Foto" />
          <UploadTile icon="heartPulse" label="Certificato medico" />
        </div>
      </div>
    </BrowserFrame>
  );
}

/* ---- STEP 04 · Checkout ---- */
function CheckoutLine({ label, strong, amount }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
      <Bar w={label} h={strong ? 9 : 7} c={strong ? 'var(--navy-600)' : 'var(--navy-100)'} />
      <span style={{ fontFamily: 'var(--f-mono)', fontSize: strong ? 13 : 11.5, fontWeight: strong ? 700 : 500, color: strong ? 'var(--ink)' : 'var(--ink-muted)' }}>{amount}</span>
    </div>
  );
}
function MockCheckout({ pad = 18, gap = 13 }) {
  return (
    <BrowserFrame title="Riepilogo e pagamento" pad={pad}>
      <div style={{ display: 'flex', flexDirection: 'column', gap }}>
        <CheckoutLine label="46%" amount="€ —" />
        <CheckoutLine label="38%" amount="€ —" />
        <div style={{ height: 1, background: 'var(--line)', margin: '2px 0' }} />
        <CheckoutLine label="30%" strong amount="€ ——" />
        <div style={{ marginTop: 4 }}><MockBtn icon="check">Paga</MockBtn></div>
      </div>
    </BrowserFrame>
  );
}

Object.assign(window, {
  TrIcon, TR_ICONS, Bar, MockRegister, MockIscrizione, MockCheckout, BrowserFrame,
});
