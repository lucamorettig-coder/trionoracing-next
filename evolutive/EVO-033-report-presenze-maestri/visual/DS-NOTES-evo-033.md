# DS-NOTES — EVO-033 Report Presenze Maestri (nuovo pattern)

## Problem

Serve un template "stampabile" (immagine PNG generata server-side via `next/og` `ImageResponse`/satori) che riepiloghi per maestro i rimborsi dovuti nel mese/anno filtrato: Lez. MTB / Lez. Strada / Gare / Totale / Importo. Non è una pagina UI interattiva — è un artefatto di export, come i PDF branded già prodotti altrove nel progetto (pattern noto: HTML self-contained con token del design system, reso via headless renderer).

Vincolo tecnico non negoziabile: il markup dev'essere **satori-compatible** — solo `<div>` in flexbox (niente `<table>`, niente CSS Grid, niente `box-shadow` complesso, niente font custom non embeddato).

## Existing patterns

| Componente correlato | Similarità | Perché non basta |
|---|---|---|
| `ExportCSVButton` | Stesso concetto "esporta i dati filtrati della pagina" | Produce testo CSV, non un layout visivo branded |
| `TariffaCard` (header gradient + pattern.svg, EVO-018) | Stesso uso di gradiente/palette navy per un blocco "editoriale" admin | È un componente UI interattivo (card cliccabile), non un layout satori standalone da renderizzare fuori dal DOM applicativo |
| PNG di riferimento (skill locale standalone, Python+Playwright) | Design già definito e approvato dall'utente, stessa struttura (header/tabella/footer) | Usa HTML reale con `<table>`, non è satori-compatible: va riportato in flexbox |

## Decisione cromatica (scostamento dal PNG di riferimento)

Il PNG di esempio usa hex "a mano" (`#1c1f52` navy, `#7DD3FC` sky) leggermente diversi dai token ufficiali del DS in `src/app/globals.css`:

| Uso | Hex nel PNG di esempio | Token DS ufficiale più vicino | Scelta |
|---|---|---|---|
| Sfondo report | `#1c1f52` | `--color-navy-900` = `#050E3F` (più scuro/profondo) | **Uso `navy-900` ufficiale** — coerenza col resto del progetto (badge/hero "deep" già usano questo token), scostamento minore, non percepibile come "brand diverso" |
| Accento (badge periodo, importo, riga totale) | `#7DD3FC` (ciano brillante) | `--color-sky-500` = `#3A82C8` (più tenue) o `--color-sky-300` = `#7FB8EC` (più chiaro ma non ciano) | **Uso `sky-300` (`#7FB8EC`)** — è il tono più vicino in luminosità/leggibilità su sfondo navy scuro tra quelli disponibili; nessuno dei toni DS è ciano saturo come l'esempio, ma `sky-300` mantiene il ruolo di "accento chiaro leggibile su navy" senza introdurre un nuovo colore fuori scala |

Nota per l'executor: se in fase di implementazione il risultato con `sky-300` risultasse visivamente "spento" rispetto all'aspettativa, è un'opzione di fallback **non bloccante** usare l'hex letterale `#7DD3FC` solo in questo template (mai come nuovo token globale) — da segnalare esplicitamente in PR se scelto, non silenziosamente.

## Proposed Design

### Struttura (satori-friendly, flexbox)

```
<div navy-900 bg, padding 36 40 32, width 820px (variante amministrazione) / 720px (variante maestri)>
  <div header: flex row, gap 18, border-bottom 1px rgba(255,255,255,.10), padding-bottom 24, margin-bottom 28>
    <img logo-scuola.png 64x64 rounded-lg>
    <div flex column flex:1>
      <div eyebrow: "TRIONO SCUOLA CICLISMO" — 9.5px bold uppercase letterspacing .13em rgba(255,255,255,.38)>
      <div title: "Presenze Maestri" — 20px bold bianco>
      <div meta: flex row gap 10 margin-top 7>
        <div badge periodo: bg sky-300/13% bordo sky-300/28% color sky-300, pill, "{Mese} {Anno}">
        <div gen-date: 10px rgba(255,255,255,.30) "Generato il {DD/MM/YYYY}">
      </div>
    </div>
  </div>

  <div "tabella" flex column>
    <div header-row: flex row, bg rgba(255,255,255,.055), padding 9 12>
      <div class="col-maestro" flex:2.2 text-left>MAESTRO</div>
      <div class="col-num" flex:1 text-center>LEZ. MTB</div>
      <div class="col-num" flex:1 text-center>LEZ. STRADA</div>
      <div class="col-num" flex:1 text-center>GARE</div>
      <div class="col-num" flex:1 text-center>TOTALE</div>
      {includeImporto && <div class="col-num" flex:1.2 text-center>IMPORTO</div>}
    </div>
    {righe.map((riga, i) => (
      <div class="row" flex row, bg={i%2===0 ? 'rgba(255,255,255,.022)' : 'transparent'}, border-bottom 1px rgba(255,255,255,.045)>
        <div class="col-maestro" bold bianco>{cognome} {nome}</div>
        <div class="col-num">{lezMTB}</div>
        <div class="col-num">{lezStrada}</div>
        <div class="col-num">{gare}</div>
        <div class="col-num" bold bianco>{totale}</div>
        {includeImporto && <div class="col-num" bold color=sky-300 tabular-nums>{fmtEuro(importo)}</div>}
      </div>
    ))}
    <div class="row totale" flex row, bg sky-300/7%, border-top 1.5px sky-300/22%, padding-top/bottom 12>
      <div class="col-maestro" uppercase 10px letterspacing .07em rgba(255,255,255,.50)>TOTALE</div>
      <div class="col-num" bold>{totMTB}</div>
      <div class="col-num" bold>{totStrada}</div>
      <div class="col-num" bold>{totGare}</div>
      <div class="col-num" bold>{totTotale}</div>
      {includeImporto && <div class="col-num" bold font-size 14.5 color=sky-300>{fmtEuro(totImporto)}</div>}
    </div>
  </div>

  <div footer: flex row justify-between margin-top 18, font-size 10, color rgba(255,255,255,.25)>
    <span>Triono Racing S.C. Centro Bici · trionoracing.it</span>
    <span>Stagione 2025/2026</span>
  </div>
</div>
```

### Props del componente

| Prop | Tipo | Descrizione |
|---|---|---|
| `periodo` | `string` | Es. "Maggio 2026" |
| `generatedAt` | `string` | `DD/MM/YYYY` |
| `righe` | `ReportPresenzeMaestroRow[]` | Vedi tipo WBS §4.1.2 |
| `includeImporto` | `boolean` | `true` → variante Amministrazione, `false` → variante Maestri |

### Varianti

| Variante | Use When | Visivo |
|---|---|---|
| Amministrazione | Uso interno contabilità/pagamenti | Colonna + riga Importo presenti, larghezza 820px |
| Maestri | Da condividere con l'istruttore per conferma presenze | Colonna/riga Importo omesse, larghezza 720px |

### Token usati

- Colori: `--color-navy-900` (sfondo), `--color-sky-300` (accenti/badge/importo), bianco a opacità variabili (non tokenizzate nel DS, replicano l'approccio già usato nel PNG di riferimento — accettabile per un output "stampabile" fuori dal flusso applicativo, stesso principio delle pagine PDF branded)
- Spacing: valori px hardcoded nel template (non è un componente Tailwind-driven essendo satori puro — nessuna classe Tailwind disponibile in `ImageResponse`, solo style inline)
- Font: system sans-serif di default (nessun font custom da embeddare)

## Accessibilità

n/a per il contenuto dell'immagine stessa (output grafico non navigabile, come un PDF/foto). L'accessibilità rilevante è sul **bottone che lo genera** in UI (v. Fase 5: `DropdownMenu` Radix con label testuali esplicite, non icon-only).

## Open Questions

- Conferma scelta `sky-300` come accento (vs. hex letterale `#7DD3FC` del PNG originale) — vedi tabella cromatica sopra. Decisione presa: usare il token DS, con fallback esplicito documentato se il risultato risultasse troppo tenue.

## Esito design-critique (2026-07-09)

Nessun blocco. 1 correzione applicata, nessuna azione ulteriore richiesta:

- **Opacità testi minori alzata**: `gen-date` 30%→**40%**, `footer` 25%→**38%** (leggibilità su PNG ricompresso/stampa b/n, scenario realistico per un documento contabile). `eyebrow` invariato a 38% (già sopra soglia). Bianco 80%/40%/10% (testo principale, header colonna, bordi decorativi) invariati.
- Confermato: contrasto `sky-300` (#7FB8EC) su `navy-900` (#050E3F) molto alto, nessuna azione.
- Confermato: nessun nuovo token DS globale da queste opacità bianco — restano hardcoded nel template, come i PDF branded già in uso nel progetto.
