/* =============================================================
   mobile.jsx — Sezione "Cosa occorre per iscriversi" · mobile 390
   MobileA (card + rail numerato)  |  MobileB (editoriale, route verticale)
   Stesso contenuto del desktop, impaginato in colonna.
   ============================================================= */

const PHOTO_ID = 'foto-prova';

function MobCta() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--r-xl)', background: 'var(--navy-900)', padding: '28px 22px', marginTop: 30 }}>
      <div className="tr-pattern" />
      <div style={{ position: 'relative' }}>
        <span className="tr-eyebrow on-navy">Pronti a partire</span>
        <h3 style={{ margin: '12px 0 0', fontFamily: 'var(--f-sans)', fontSize: 22, fontWeight: 700, letterSpacing: '-.01em', lineHeight: 1.15, color: '#fff' }}>
          Bastano una foto e il certificato medico.
        </h3>
        <p style={{ margin: '10px 0 18px', fontFamily: 'var(--f-sans)', fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,.72)' }}>
          Tieni pronti una foto di tuo figlio e il certificato medico di idoneità sportiva non agonistica.
        </p>
        <a href="#" className="tr-btn tr-btn-sun" style={{ width: '100%' }}>
          Inizia l’iscrizione <TrIcon name="arrowRight" size={17} stroke={2.2} />
        </a>
        <div style={{ textAlign: 'center', marginTop: 10, fontFamily: 'var(--f-mono)', fontSize: 10.5, letterSpacing: '.04em', color: 'rgba(255,255,255,.55)' }}>
          → area riservata genitori
        </div>
      </div>
    </div>
  );
}

function MobHead() {
  return (
    <div>
      <span className="tr-eyebrow">Iscrizione</span>
      <h2 style={{ margin: '16px 0 0', fontFamily: 'var(--f-sans)', fontSize: 30, fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.1, color: 'var(--ink)' }}>
        Iscrivere tuo figlio è semplice. <span style={{ color: 'var(--navy-500)' }}>Ecco come.</span>
      </h2>
      <p style={{ margin: '14px 0 0', fontFamily: 'var(--f-sans)', fontSize: 15.5, lineHeight: 1.55, color: 'var(--ink-muted)' }}>
        Quattro passi, dal primo “proviamo” fino al via. Tutto online, dall’area riservata genitori.
      </p>
    </div>
  );
}

/* ---------- Mobile A · card + rail numerato ---------- */
function MobRowA({ step, idx, last }) {
  const invito = step.kind === 'invito';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '46px 1fr', gap: 14 }}>
      {/* rail */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
          background: invito ? 'var(--sun-500)' : 'var(--navy-700)',
          color: invito ? 'var(--navy-900)' : '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--f-mono)', fontSize: 15, fontWeight: 700, letterSpacing: '.04em',
        }}>{step.n}</div>
        {!last && <div style={{ flex: 1, width: 2, background: 'var(--line)', marginTop: 4, minHeight: 24 }} />}
      </div>
      {/* card */}
      <div style={{
        background: invito ? 'var(--sun-50)' : '#fff',
        border: invito ? '1.5px solid #F2E89A' : '1px solid var(--line)',
        borderRadius: 'var(--r-xl)', boxShadow: 'var(--sh-sm)', padding: 18, marginBottom: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: invito ? 'var(--sun-500)' : 'var(--navy-50)', color: invito ? 'var(--navy-900)' : 'var(--navy-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TrIcon name={step.icon} size={20} stroke={1.9} />
          </div>
          <h3 style={{ margin: 0, fontFamily: 'var(--f-sans)', fontSize: 18, fontWeight: 600, letterSpacing: '-.01em', color: 'var(--ink)' }}>{step.title}</h3>
        </div>
        <p style={{ margin: '11px 0 0', fontFamily: 'var(--f-sans)', fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink-muted)' }}>{step.text}</p>
        <div style={{ marginTop: 14 }}>
          {invito ? (
            <image-slot id={PHOTO_ID} shape="rounded" radius="13" fit="cover"
              placeholder="Trascina qui la foto · bambini in bici"
              style={{ display: 'block', width: '100%', height: 150, boxShadow: 'var(--sh-xs)' }}></image-slot>
          ) : (
            <div style={{ background: 'var(--bg-muted)', borderRadius: 'var(--r-lg)', padding: 13 }}>{renderMock(step.mock)}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function MobileA() {
  return (
    <div style={{ width: 390, background: 'var(--bg-soft)', fontFamily: 'var(--f-sans)', color: 'var(--ink)', padding: '40px 20px 44px', boxSizing: 'border-box' }}>
      <MobHead />
      <div style={{ marginTop: 30 }}>
        {TR_STEPS.map((s, i) => <MobRowA key={s.n} step={s} idx={i} last={i === TR_STEPS.length - 1} />)}
      </div>
      <MobCta />
    </div>
  );
}

/* ---------- Mobile B · editoriale, route verticale dashed ---------- */
function MobRowB({ step, idx, last }) {
  const invito = step.kind === 'invito';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '34px 1fr', gap: 16, paddingBottom: 26 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 700, letterSpacing: '.06em', color: invito ? 'var(--sun-700)' : 'var(--navy-500)' }}>{step.n}</span>
        <div style={{ width: 34, height: 34, marginTop: 8, borderRadius: 'var(--r-md)', background: invito ? 'var(--sun-500)' : '#fff', border: invito ? 'none' : '1px solid var(--line)', color: invito ? 'var(--navy-900)' : 'var(--navy-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--sh-xs)' }}>
          <TrIcon name={step.icon} size={18} stroke={1.9} />
        </div>
        {!last && <div style={{ flex: 1, width: 0, borderLeft: '2px dashed var(--navy-200)', marginTop: 8, minHeight: 30 }} />}
      </div>
      <div>
        <h3 style={{ margin: 0, fontFamily: 'var(--f-sans)', fontSize: 18, fontWeight: 600, letterSpacing: '-.01em', color: 'var(--ink)' }}>{step.title}</h3>
        <p style={{ margin: '7px 0 14px', fontFamily: 'var(--f-sans)', fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink-muted)' }}>{step.text}</p>
        {invito ? (
          <div style={{ position: 'relative' }}>
            <image-slot id={PHOTO_ID} shape="rounded" radius="16" fit="cover"
              placeholder="Trascina qui la foto"
              style={{ display: 'block', width: '100%', height: 168, boxShadow: 'var(--sh-md)' }}></image-slot>
            <span style={{ position: 'absolute', top: 10, left: 10, fontFamily: 'var(--f-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--navy-900)', background: 'var(--sun-500)', padding: '4px 9px', borderRadius: 999 }}>2 prove gratis</span>
          </div>
        ) : (
          <div style={{ filter: 'drop-shadow(0 16px 24px rgba(31,45,90,.13))' }}>{renderMock(step.mock)}</div>
        )}
      </div>
    </div>
  );
}

function MobileB() {
  return (
    <div style={{ width: 390, background: '#fff', fontFamily: 'var(--f-sans)', color: 'var(--ink)', padding: '40px 20px 44px', boxSizing: 'border-box' }}>
      <MobHead />
      <div style={{ marginTop: 30 }}>
        {TR_STEPS.map((s, i) => <MobRowB key={s.n} step={s} idx={i} last={i === TR_STEPS.length - 1} />)}
      </div>
      <MobCta />
    </div>
  );
}

Object.assign(window, { MobileA, MobileB });
