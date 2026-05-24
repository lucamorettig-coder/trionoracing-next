# Visual mockup EVO-005

Mockup HTML autoritativi per UI EVO-005 (calendario gare genitore + dettaglio).

- `gare-lista.html` — vetrina `/portale/gare`
- `gare-dettaglio.html` — `/portale/gare/[id]`

## Note di adattamento allo schema minimal (Opzione A)

I mockup sono stati disegnati su uno schema più ricco di quello che effettivamente abbiamo su Airtable. EVO-005 ha scelto di non estendere la tabella `Gare Giovanili Umbria 2026` (Opzione A), quindi alcuni elementi vanno omessi in produzione:

### Lista (`gare-lista.html`)
- ❌ Badge "Iscrizioni aperte fino al 10 giu" / "Iscrizioni apriranno il 20 giu" — non abbiamo campo `data_apertura_iscrizioni` / `data_chiusura_iscrizioni`. Sostituiti con un badge neutro "Iscrizioni aperte" implicito (tutte le gare future sono iscrivibili).
- ✅ Tutto il resto (filtri mese/regione/tipologia, toggle compatibili, hero spotlight, card per-mese, badge stato per-figlio, CTA dinamica) resta in scope.

### Dettaglio (`gare-dettaglio.html`)
- ❌ Le 4 hero-stat (Quando · Dove · Categorie · Iscrizioni chiudono) — sostituite da una meta-row compatta sotto il titolo (data, luogo, classe, tipo gara) coerente con altre hero del portale (EVO-014, EVO-015).
- ❌ Kv-row "Distanza", "Premi", "Scadenza iscrizioni" — non abbiamo questi campi.
- ❌ Card "Regolamento ufficiale PDF" con download — niente campo `regolamento_pdf` su Airtable.
- ❌ Sezione "Descrizione della gara" lunga (3 paragrafi mockup) — abbiamo solo `Note` (singolo campo). Resa come singolo paragrafo se presente, altrimenti omessa.
- ✅ Card iscrizione figli (multi-select, stati per-figlio, CTA dinamica) resta in scope.
- ✅ Card "Cosa succede dopo" (3-step timeline) resta — utile UX riduce ansia richiesta.
- ✅ Card "Maestri accompagnatori" se array non vuoto.

## Easter egg / meta-info

I mockup contengono il footer mountMockup con `crumb`, `annotations`, `route` — sono metadata Claude Design per il rendering wrapper e NON vanno portati in produzione (vedi pattern EVO-010 in `AGENTS.md`). Solo il template `#page-content` è la fonte UI da riprodurre.

Il footer "ASD CIEMME · © 2026" è il footer del wrapper mockup, non quello del portale Next.js (`PortaleNavBar` + layout esistente già hanno footer).
