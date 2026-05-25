# Visual EVO-017 — bundle riferimento per Claude Code

> Sostituto del bundle Claude Design (no crediti disponibili in sessione 2026-05-25). Prodotto in Cowork riusando mockup F3 UX redesign esistenti + 3 mockup HTML standalone nuovi + spec DS dei pattern introdotti.

## File del bundle

| File | Fonte | Copre |
|---|---|---|
| `iscrizioni-lista.html` | ✅ riusato da F3 UX redesign (`mokup portale/Mockup Portale/admin/`) | A-2 Iscrizioni list — DataTable + filtri + KPI + bulk action bar |
| `iscrizioni-dettaglio.html` | ✅ riusato da F3 UX redesign | A-3 Dettaglio iscrizione — 5 tab (Stato+override · Modulistica · Taglie · Pagamenti · Storia+log) + bottoni override (Forza completata · Annulla iscrizione · Sollecito · Carica regolamento per il genitore) |
| `bambini-lista.html` | ✅ riusato da F3 UX redesign | A-4 Bambini list — DataTable + filtri certificato + KPI scadenze |
| `bambini-dettaglio.html` | 🆕 prodotto in EVO-017 | Dettaglio bambino admin — header con pannello genitore read-only `mailto:`/`tel:` + 6 tab base + 2 tab nuovi minimal (Iscrizioni storiche · Storia lezioni complete) + Danger zone delete con guard 0-iscrizioni |
| `modal-aggiungi-titolo-manuale.html` | 🆕 prodotto in EVO-017 | Modal `AggiungiTitoloManuale` con pattern `AdminFormDialog` — context-card + 4 field (TIPO + IMPORTO + SCADENZA + DESCRIZIONE) + NOTE interne + helper warn su NUMERO_RATA |
| `modal-segna-titolo-pagato.html` | 🆕 prodotto in EVO-017 | Modal `SegnaTitoloPagato` con `AdminFormDialog` — context-card grass + form (METODO + DATA + PROVIDER + NOTE) + sync info su `PRIMA_RATA_PAGATA` |
| `DS-EXTEND-evo-017.md` | 🆕 prodotto in EVO-017 (skill `design:design-system extend`) | Spec dei 3 pattern DS introdotti: `AdminFormDialog`, `ModulisticaIcons`, Badge "Completata in deroga" |
| `shared/tokens.css` + `shared/page-shell.js` | ✅ copiati da `mokup portale/Mockup Portale/shared/` | Tokens CSS + shell mockup |

## Modal coperti da ConfirmDialog (EVO-016, no mockup dedicato necessario)

I 2 modal "conferma + motivo" usano il componente `ConfirmDialog` già esistente in EVO-016 (`motivoLabel="Motivo"` + `motivoRequired={true}` + variant). Il design è già rodato in dashboard, non serve mockup separato:

- **`AnnullaIscrizioneModal`** → `ConfirmDialog variant="destructive"` · title "Annulla iscrizione?" · description "Eventuali rimborsi vanno gestiti manualmente da SumUp Dashboard o bonifico." · motivoRequired · submitLabel "Annulla iscrizione"
- **`ForzaCompletaModal`** → `ConfirmDialog variant="warning"` · title "Forza completata iscrizione?" · description "Bypass dei requisiti modulistica. L'override sarà loggato in Tab Storia." · motivoRequired · submitLabel "Forza completata"

Microcopy modal `AnnullaIscrizioneModal` derivata dall'annotation #9 del mockup `iscrizioni-dettaglio.html` esistente.

## Note di lettura per Claude Code

1. **Stile**: tutti i mockup usano token CSS da `shared/tokens.css` (palette navy/grass/ember/flag/sky/sun già allineata a DS Triono v0.1). Claude Code deve mappare i token CSS sui token Tailwind v4 del progetto (`bg-navy-700`, `text-ember-700`, ecc.) — la corrispondenza è 1:1 perché DS Triono v0.1 deriva proprio da questi token.
2. **Icone**: tutte Lucide via CDN nei mockup. Implementazione Next.js userà `lucide-react` (già installato).
3. **Layout**: i mockup mostrano il viewport desktop a `desktopScale: 0.58` nello shell. Il design è responsive (mobile-first) e Claude Code deve garantire usabilità mobile sui filtri/DataTable/modal.
4. **Microcopy**: tutta in italiano, riusabile 1:1 nell'implementazione.
5. **Annotations** in fondo a ogni mockup: spiegano le scelte UX, riportano riferimenti ai numeri di decisione UX di EVO-017 e EVO-007. Lette in `mountMockup({annotations: [...]})`.

## ⚠️ IGNORA il footer mostrato nei mockup F3 (riusati)

I 3 mockup riusati da F3 UX redesign (`iscrizioni-lista.html`, `iscrizioni-dettaglio.html`, `bambini-lista.html`) mostrano un **footer admin** ("Triono Racing · Admin v2.0 · © 2026" con 2-3 colonne link). **Questo footer NON va implementato.**

Motivo: il layout `src/app/portale/(portal)/layout.tsx` (rodato in EVO-002 e EVO-016) include solo `<PortaleNavBar />` + `<main>`. Scelta consapevole per area autenticata (pattern standard SaaS dashboard: niente footer marketing nelle aree interne).

I 3 mockup nuovi prodotti in EVO-017 (`bambini-dettaglio.html`, `modal-aggiungi-titolo-manuale.html`, `modal-segna-titolo-pagato.html`) **non hanno footer** — sono allineati al layout reale.
