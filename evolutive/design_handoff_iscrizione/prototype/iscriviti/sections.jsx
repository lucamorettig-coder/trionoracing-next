/* =============================================================
   sections.jsx — Sezione "Cosa occorre per iscriversi" (desktop)
   Direction A · Percorso chiaro   |   Direction B · Editoriale dinamico
   Layout richiesto: timeline orizzontale, 4 step in fila con connettore.
   Esporta su window.
   ============================================================= */

const TR_STEPS = [
  {
    n: '01', kind: 'invito', icon: 'bike',
    title: 'Vieni a provare',
    text: 'Fino a 2 lezioni di prova gratuite, per capire se la scuola fa per voi. Nessun impegno.',
    alt: 'Foto di bambini in bici al ciclodromo durante una lezione di prova della scuola di ciclismo Triono.',
  },
  {
    n: '02', kind: 'mock', icon: 'userPlus', mock: 'register',
    title: 'Registrati',
    text: 'Crea il tuo account nell’area riservata genitori, bastano pochi minuti.',
    alt: 'Mockup illustrato della schermata di registrazione dell’area riservata genitori.',
  },
  {
    n: '03', kind: 'mock', icon: 'clipboard', mock: 'iscrizione',
    title: 'Crea l’iscrizione',
    text: 'Inserisci i dati di tuo figlio, carica una foto e il certificato medico valido.',
    alt: 'Mockup illustrato del form di iscrizione con i dati del bambino e gli upload di foto e certificato medico.',
  },
  {
    n: '04', kind: 'mock', icon: 'card', mock: 'checkout',
    title: 'Conferma e paga',
    text: 'Leggi il regolamento, salda la quota d’iscrizione e la prima rata. Sei dentro!',
    alt: 'Mockup illustrato della schermata di pagamento con riepilogo voci, importo e pulsante Paga.',
  },
];

function renderMock(which, key) {
  if (which === 'register') return <MockRegister />;
  if (which === 'iscrizione') return <MockIscrizione />;
  if (which === 'checkout') return <MockCheckout />;
  return null;
}

/* ---------- pezzi condivisi ---------- */
function SectionHead({ onLight = true, maxTitle = 760 }) {
  return (
    <div style={{ maxWidth: maxTitle }}>
      <span className="tr-eyebrow a-item" style={{ '--d': '.02s' }}>Iscrizione</span>
      <h2 className="a-item" style={{
        '--d': '.10s',
        margin: '20px 0 0', fontFamily: 'var(--f-sans)', fontSize: 48, fontWeight: 700,
        letterSpacing: '-.02em', lineHeight: 1.05, color: 'var(--ink)', textWrap: 'balance',
      }}>
        Iscrivere tuo figlio è semplice. <span style={{ color: 'var(--navy-500)' }}>Ecco come.</span>
      </h2>
      <p className="a-item" style={{
        '--d': '.18s',
        margin: '20px 0 0', fontFamily: 'var(--f-sans)', fontSize: 18, lineHeight: 1.55,
        color: 'var(--ink-muted)', maxWidth: 540, textWrap: 'pretty',
      }}>
        Quattro passi, dal primo “proviamo” fino al via. Tutto online, dall’area riservata genitori.
      </p>
    </div>
  );
}

function CtaBand({ slotId, animDelay = '0s' }) {
  return (
    <div className="a-item" style={{
      '--d': animDelay,
      position: 'relative', overflow: 'hidden', borderRadius: 'var(--r-2xl)',
      background: 'var(--navy-900)', marginTop: 64, padding: '44px 56px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap',
    }}>
      <div className="tr-pattern tr-drift" />
      <div style={{ position: 'relative', maxWidth: 560 }}>
        <span className="tr-eyebrow on-navy">Pronti a partire</span>
        <h3 style={{ margin: '14px 0 0', fontFamily: 'var(--f-sans)', fontSize: 30, fontWeight: 700, letterSpacing: '-.015em', lineHeight: 1.12, color: '#fff' }}>
          Bastano una foto e il certificato medico.
        </h3>
        <p style={{ margin: '12px 0 0', fontFamily: 'var(--f-sans)', fontSize: 14.5, lineHeight: 1.55, color: 'rgba(255,255,255,.72)', maxWidth: 470 }}>
          Tieni pronti una foto di tuo figlio e il certificato medico di idoneità sportiva non agonistica.
        </p>
      </div>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
        <a href="#" className="tr-btn tr-btn-lg tr-btn-sun tr-cta" style={{ boxShadow: '0 12px 28px rgba(5,14,63,.4)' }}>
          Inizia l’iscrizione <span className="tr-nudge" style={{ display: 'inline-flex' }}><TrIcon name="arrowRight" size={18} stroke={2.2} /></span>
        </a>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '.04em', color: 'rgba(255,255,255,.55)', paddingLeft: 2 }}>
          → area riservata genitori
        </span>
      </div>
    </div>
  );
}

/* =============================================================
   DIRECTION A — Percorso chiaro
   Connettore orizzontale con nodi numerati sopra le card.
   ============================================================= */
function StepCardA({ step, slotId, animDelay = '0s' }) {
  const invito = step.kind === 'invito';
  return (
    <div className="a-item tr-card" style={{
      '--d': animDelay,
      display: 'flex', flexDirection: 'column', height: '100%',
      background: invito ? 'var(--sun-50)' : '#fff',
      border: invito ? '1.5px solid #F2E89A' : '1px solid var(--line)',
      borderRadius: 'var(--r-xl)', boxShadow: 'var(--sh-sm)',
      padding: 22, gap: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="tr-card-ic" style={{
          width: 44, height: 44, borderRadius: 'var(--r-md)',
          background: invito ? 'var(--sun-500)' : 'var(--navy-50)',
          color: invito ? 'var(--navy-900)' : 'var(--navy-700)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <TrIcon name={step.icon} size={23} stroke={1.9} />
        </div>
        {invito && (
          <span className="tr-pulse" style={{
            fontFamily: 'var(--f-mono)', fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em',
            textTransform: 'uppercase', color: 'var(--sun-700)', background: 'var(--sun-100)',
            padding: '5px 10px', borderRadius: 999,
          }}>Gratis</span>
        )}
      </div>
      <h3 className="tr-card-title" style={{ margin: '16px 0 0', fontFamily: 'var(--f-sans)', fontSize: 21, fontWeight: 600, letterSpacing: '-.01em', color: 'var(--ink)', lineHeight: 1.2 }}>
        {step.title}
      </h3>
      <p style={{ margin: '9px 0 0', fontFamily: 'var(--f-sans)', fontSize: 14, lineHeight: 1.5, color: 'var(--ink-muted)', textWrap: 'pretty' }}>
        {step.text}
      </p>
      <div style={{ marginTop: 18, flex: 1, display: 'flex', alignItems: 'flex-end' }}>
        {invito ? (
          <div className="tr-card-mock" style={{ width: '100%', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--sh-sm)' }}>
            <image-slot id={slotId} shape="rounded" radius="14" fit="cover"
              placeholder="Trascina qui la foto · bambini in bici al ciclodromo"
              style={{ display: 'block', width: '100%', height: 188 }}></image-slot>
          </div>
        ) : (
          <div className="tr-card-mock" style={{ width: '100%', background: 'var(--bg-muted)', borderRadius: 'var(--r-lg)', padding: 16 }}>
            {renderMock(step.mock)}
          </div>
        )}
      </div>
    </div>
  );
}

function DirectionA() {
  const [runKey, setRunKey] = React.useState(0);
  const [play, setPlay] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    setPlay(false); setDone(false);
    let fired = false;
    const go = () => { if (!fired) { fired = true; requestAnimationFrame(() => setPlay(true)); } };
    const node = ref.current;
    let io;
    if (node && 'IntersectionObserver' in window) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) go(); });
      }, { threshold: 0.06 });
      io.observe(node);
    }
    const t = setTimeout(go, 500); // fallback: la canvas usa transform, IO può non scattare
    const d = setTimeout(() => setDone(true), 2600); // pin dello stato finale
    return () => { if (io) io.disconnect(); clearTimeout(t); clearTimeout(d); };
  }, [runKey]);
  return (
    <div style={{ position: 'relative', width: 1440, background: 'var(--bg-soft)', fontFamily: 'var(--f-sans)', color: 'var(--ink)', padding: '104px 80px 112px', boxSizing: 'border-box' }}>
      <button className="tr-replay" onClick={() => setRunKey(k => k + 1)} title="Rigioca l’animazione (solo anteprima)">
        <TrIcon name="refresh" size={13} stroke={2.2} /> Rigioca
      </button>
      <div ref={ref} key={runKey} className={'tr-anim ' + (done ? 'tr-done ' : '') + (play ? 'tr-playing' : 'tr-arm')} style={{ maxWidth: 1280, margin: '0 auto' }}>
        <SectionHead />
        {/* connettore con nodi numerati */}
        <div style={{ position: 'relative', marginTop: 56, marginBottom: 26 }}>
          <div className="a-line" style={{ '--d': '.30s', position: 'absolute', top: 22, left: '12.5%', right: '12.5%', height: 2, zIndex: 0, background: 'linear-gradient(90deg,var(--grass-500),var(--sky-500),var(--ember-500),var(--navy-700))', opacity: .5 }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
            {TR_STEPS.map((s, i) => (
              <div key={s.n} className="tr-node" style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="a-pop" style={{
                  '--d': (0.42 + i * 0.12) + 's',
                  position: 'relative', zIndex: 1,
                  width: 46, height: 46, borderRadius: '50%',
                  background: i === 0 ? 'var(--sun-500)' : 'var(--navy-700)',
                  color: i === 0 ? 'var(--navy-900)' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--f-mono)', fontSize: 15, fontWeight: 700, letterSpacing: '.04em',
                  boxShadow: '0 0 0 6px var(--bg-soft), var(--sh-sm)',
                }}>{s.n}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, alignItems: 'stretch' }}>
          {TR_STEPS.map((s, i) => (
            <StepCardA key={s.n} step={s} slotId={'slotA-01'} animDelay={(0.5 + i * 0.12) + 's'} />
          ))}
        </div>
        <CtaBand animDelay="1.05s" />
      </div>
    </div>
  );
}

/* =============================================================
   DIRECTION B — Editoriale dinamico
   Numeri mono oversize, mockup "fluttuanti" con stagger, route dashed.
   ============================================================= */
function StepColB({ step, idx, slotId }) {
  const invito = step.kind === 'invito';
  const lift = [0, 26, 12, 30][idx];
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* numero watermark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 700, color: invito ? 'var(--sun-700)' : 'var(--navy-500)', letterSpacing: '.08em' }}>{step.n}</span>
        <div style={{
          width: 38, height: 38, borderRadius: 'var(--r-md)',
          background: invito ? 'var(--sun-500)' : '#fff',
          border: invito ? 'none' : '1px solid var(--line)',
          color: invito ? 'var(--navy-900)' : 'var(--navy-700)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--sh-xs)',
        }}>
          <TrIcon name={step.icon} size={20} stroke={1.9} />
        </div>
      </div>
      {/* mockup / foto fluttuante */}
      <div style={{ marginTop: lift }}>
        {invito ? (
          <div style={{ position: 'relative' }}>
            <image-slot id={slotId} shape="rounded" radius="18" fit="cover"
              placeholder="Trascina qui la foto · bambini in bici"
              style={{ display: 'block', width: '100%', height: 230, boxShadow: 'var(--sh-md)' }}></image-slot>
            <span style={{ position: 'absolute', top: 12, left: 12, fontFamily: 'var(--f-mono)', fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--navy-900)', background: 'var(--sun-500)', padding: '5px 11px', borderRadius: 999, boxShadow: 'var(--sh-sm)' }}>2 prove gratis</span>
          </div>
        ) : (
          <div style={{ filter: 'drop-shadow(0 22px 30px rgba(31,45,90,.14))' }}>{renderMock(step.mock)}</div>
        )}
      </div>
      <h3 style={{ margin: '20px 0 0', fontFamily: 'var(--f-sans)', fontSize: 20, fontWeight: 600, letterSpacing: '-.01em', color: 'var(--ink)', lineHeight: 1.2 }}>
        {step.title}
      </h3>
      <p style={{ margin: '8px 0 0', fontFamily: 'var(--f-sans)', fontSize: 14, lineHeight: 1.5, color: 'var(--ink-muted)', textWrap: 'pretty', maxWidth: '30ch' }}>
        {step.text}
      </p>
    </div>
  );
}

function DirectionB() {
  return (
    <div style={{ width: 1440, background: '#fff', fontFamily: 'var(--f-sans)', color: 'var(--ink)', padding: '104px 80px 112px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 48, flexWrap: 'wrap' }}>
          <SectionHead />
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11.5, lineHeight: 1.7, color: 'var(--ink-muted)', letterSpacing: '.04em', textAlign: 'right' }}>
            <strong style={{ display: 'block', color: 'var(--navy-700)', fontSize: 12.5, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>4 passi</strong>
            prova → registrati<br />iscrivi → paga
          </div>
        </div>
        {/* route dashed */}
        <div style={{ position: 'relative', marginTop: 52, height: 1 }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, borderTop: '2px dashed var(--navy-200)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 28, marginTop: 30, alignItems: 'start' }}>
          {TR_STEPS.map((s, i) => (
            <StepColB key={s.n} step={s} idx={i} slotId={'slotB-01'} />
          ))}
        </div>
        <CtaBand />
      </div>
    </div>
  );
}

Object.assign(window, { TR_STEPS, renderMock, SectionHead, CtaBand, DirectionA, DirectionB, StepCardA, StepColB });
