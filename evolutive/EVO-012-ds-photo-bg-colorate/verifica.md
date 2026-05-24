# Verifica EVO-012 — DS card colorate con photo-bg

**Data**: 2026-05-24
**PR**: #15 (squash-merged, commit `cde0230`)
**Branch**: `evo-012-ds-photo-bg-colorate` (eliminato post-merge)
**Skill `verify-implementation`**: non disponibile in sessione → report manuale (pattern EVO-010).

---

## Verdetto per dimensione

| Dimensione | Verdetto | Note |
|---|---|---|
| Design system | ✅ APPROVATA | 5 nuove utility + 8 card uniformate, nessun nuovo token |
| Localizzazione (i18n) | n/a | Nessuna stringa user-facing |
| SEO | n/a | Solo CSS + classi DOM, nessun cambio metadata/JSON-LD |
| Architettura | ✅ APPROVATA | Modifiche minimali, zero nuovi componenti, zero dipendenze |
| Fedeltà visual | ✅ APPROVATA | Tutte le card navy migrate al pattern Kit Scuola manifesto |
| Criteri accettazione | ✅ APPROVATA | 13/13 criteri soddisfatti |
| Qualità deploy | ✅ APPROVATA | Lint/tsc/build clean, deploy Vercel live |

**Verdetto complessivo**: ✅ **APPROVATA**

---

## Criteri di accettazione — dettaglio

- [x] `globals.css` contiene 5 nuove utility `.photo-bg-{sun,sky,grass,flag,ember}` con formula coerente a `.photo-bg-navy`
- [x] 8 file di componenti migrati a `.photo-bg-navy` con rimozione di `bg-navy-{700,900}` / `pattern-navy` precedenti
- [x] Sezione manifesto di Kit Scuola (`SezioneKitScuola.tsx`) **NON è stata toccata** (era già su `photo-bg-navy`)
- [x] Footer (`ui/footer.tsx`) **NON è stato toccato**
- [x] `.pattern-navy` e `.pattern-light` originali in `globals.css` **non sono state modificate**
- [x] Override `.theme-209 .photo-bg-navy` **non è stata modificata**
- [x] `AGENTS.md` ha una nuova sezione "Pattern appresi in EVO-012 (2026-05-23)"
- [x] `npm run lint` pulito (0 errori, 8 warning preesistenti)
- [x] `npx tsc --noEmit` pulito
- [x] `npm run build` pulito (33 pagine generate)
- [x] Smoke test dev: 4 URL pubbliche verificate via curl, `photo-bg-navy` presente, `pattern-navy` rimosso dalle card migrate
- [x] Smoke test produzione: `photo-bg-navy` presente su `/`, `/la-scuola`, `/contatti`, `/marathon-209`
- [x] Smoke test produzione tema 209: `/marathon-209` ha 5 occorrenze `photo-bg-navy` sotto `.theme-209` → override CSS le rende rosse

---

## File modificati (10)

### Aggiunti
- `evolutive/EVO-012-ds-photo-bg-colorate.md` (file evolutiva)
- `evolutive/EVO-012-ds-photo-bg-colorate/prompt-claude-code.md`
- `evolutive/EVO-012-ds-photo-bg-colorate/verifica.md` (questo file)

### Modificati
- `src/app/globals.css` — +84 righe, 5 nuove utility
- `src/components/home/CtaFinale.tsx`
- `src/components/scuola/CtaScuola.tsx`
- `src/components/marathon-209/CtaMarathon.tsx`
- `src/components/marathon-209/MarathonHero.tsx`
- `src/app/(public)/marathon-209/page.tsx` (fallback section)
- `src/components/portale/iscrizioni/StepperWizard.tsx`
- `src/components/portale/dashboard/DashboardGenitore.tsx`
- `src/app/(public)/contatti/page.tsx`
- `AGENTS.md` — nuova sezione EVO-012
- `memory.md` — entry EVO-012 + completamento EVO-010
- `evolutive/EVO-011-kit-scuola-tab-taglie.md` — stato aggiornato

---

## Quality gates

```
npm run lint        → 0 errors, 8 warnings (tutti preesistenti)
npx tsc --noEmit    → clean
npm run build       → clean, 33 pages generated (Next.js 16.2.6 Turbopack)
```

---

## Smoke test produzione

```
GET https://trionoracing-next.vercel.app/                 → HTTP 200, 1× photo-bg-navy (CtaFinale)
GET https://trionoracing-next.vercel.app/la-scuola        → HTTP 200, 3× photo-bg-navy (CtaScuola + KitScuola manifesto + InfoTeam)
GET https://trionoracing-next.vercel.app/contatti         → HTTP 200, 1× photo-bg-navy (sidebar info)
GET https://trionoracing-next.vercel.app/marathon-209     → HTTP 200, 5× photo-bg-navy (MarathonHero + intro + CtaMarathon + InfoPratiche)
```

Sotto `.theme-209` la regola CSS `.theme-209 .photo-bg-navy { background-color: #7F1D1D; }` converte automaticamente l'overlay in rosso. Override invariato da EVO-precedente — confermato presente in `globals.css`.

---

## Note / follow-up

- **TabTaglie (EVO-011) sbloccato**: la utility `.photo-bg-navy` ora è il pattern standard per card navy decorative. EVO-011 può adottarlo se serve uniformare anche la sezione tagliebmbino del portale.
- **Scaffold utility colorate non-navy**: zero card del sito le usa al momento. Saranno disponibili quando arriverà la prima istanza (eventuale card "success" con `.photo-bg-grass`, "warning" con `.photo-bg-ember`, ecc.). Documentato in AGENTS.md sezione EVO-012.
- **Override theme-209 solo per navy**: le 5 nuove utility colorate (sun/sky/grass/flag/ember) non hanno override theme. Se in futuro servirà una card colorata in `/marathon-209`, valutare caso per caso (probabile: usare direttamente il colore "ospite" del theme).
- **DashboardGenitore nota R1**: cambio `bg-navy-700` (#1F2D5A) → `bg-navy-900` (#050E3F) accettato senza pushback. Contrasto coi children testuali del header (white, white/70) resta accettabile su navy più scuro.

---

## Cronologia commit

```
cde0230 EVO-012: DS card colorate con photo-bg (uniformazione + scaffold) (#15) [merge]
1545d81 docs(agents): documenta utility .photo-bg-{color} (EVO-012)
ea96e6f refactor(ds): migra 8 card navy a .photo-bg-navy
4790414 feat(ds): utility .photo-bg-{sun,sky,grass,flag,ember}
```
