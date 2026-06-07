/* =============================================================
   detail.jsx — Dettaglio "stile mockup illustrato" (visual #3)
   Checkout ingrandito + annotazioni che fissano lo stile:
   barre al posto dei campi, pulsante pieno brand, nessun dato reale.
   ============================================================= */

function SpecNote({ n, title, body }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ width: 22, height: 22, flexShrink: 0, borderRadius: '50%', background: 'var(--sun-500)', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700, marginTop: 1 }}>{n}</div>
      <div>
        <div style={{ fontFamily: 'var(--f-sans)', fontSize: 15, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-.005em' }}>{title}</div>
        <div style={{ fontFamily: 'var(--f-sans)', fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink-muted)', marginTop: 3 }}>{body}</div>
      </div>
    </div>
  );
}

function MockupDetail() {
  return (
    <div style={{ width: 1160, background: 'var(--bg-soft)', fontFamily: 'var(--f-sans)', color: 'var(--ink)', padding: '64px 72px', boxSizing: 'border-box' }}>
      <span className="tr-eyebrow">Stile mockup</span>
      <h2 style={{ margin: '18px 0 0', fontFamily: 'var(--f-sans)', fontSize: 38, fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.08, color: 'var(--ink)' }}>
        Disegni della UI, <span style={{ color: 'var(--navy-500)' }}>non screenshot.</span>
      </h2>
      <p style={{ margin: '14px 0 0', fontFamily: 'var(--f-sans)', fontSize: 17, lineHeight: 1.55, color: 'var(--ink-muted)', maxWidth: 620 }}>
        I mockup degli step 02–04 sono frame astratti delle schermate del portale: UI semplificata, riconoscibile ma chiaramente illustrata.
      </p>

      <div style={{ marginTop: 44, display: 'grid', gridTemplateColumns: '420px 1fr', gap: 64, alignItems: 'center' }}>
        {/* checkout ingrandito */}
        <div style={{ transform: 'scale(1.18)', transformOrigin: 'left center' }}>
          <MockCheckout pad={26} gap={18} />
        </div>

        {/* spec note */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingLeft: 20 }}>
          <SpecNote n="1" title="Frame finestra" body="Chrome del browser con i tre pallini e una barra URL fittizia — comunica “schermata del portale” a colpo d’occhio." />
          <SpecNote n="2" title="Barre al posto dei campi" body="Ogni voce/campo è una barra neutra (navy-100). Nessun testo o dato personale reale: resta un disegno." />
          <SpecNote n="3" title="Pulsante pieno brand" body="L’unico elemento “pieno” è la CTA in navy-700: guida l’occhio all’azione, coerente coi bottoni del sito." />
          <SpecNote n="4" title="Accento sun" body="Una barretta gialla marca il titolo della schermata — il tocco Scuola, usato con parsimonia." />
          <div style={{ marginTop: 6, paddingTop: 18, borderTop: '1px solid var(--line)', fontFamily: 'var(--f-mono)', fontSize: 11.5, lineHeight: 1.6, color: 'var(--ink-muted)', letterSpacing: '.02em' }}>
            radius 16 · shadow morbida · stroke 1.5px<br />
            palette: navy-100 · line · navy-700 · sun-500
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MockupDetail });
