# Visual per EVO-022 — Sezione "Cosa occorre per iscriversi" su /la-scuola

Sto lavorando a un'evolutiva per la mia webapp (sito della Scuola di Ciclismo Triono). Ho bisogno che tu produca i visual ad alta definizione di **una nuova sezione informativa** della pagina pubblica `/la-scuola`.

## Contesto progetto

- **Nome**: Triono Racing — Scuola di Ciclismo per bambini (ASD CIEMME, Terni)
- **Tipo**: landing / sito pubblico editoriale
- **Stack**: Next.js 16 + React 19 + Tailwind v4 (design system custom a token CSS)
- **Repo collegato a Claude Design**: **sì — collega il repo** così applichi il design system reale del progetto. Le indicazioni di stile sotto sono un backup.
- **Lingua dei contenuti nel visual**: italiano

## Cosa devo realizzare

Una sezione **"Cosa occorre per iscriversi"** che spiega ai genitori, in modo semplice e rassicurante, il percorso per iscrivere il figlio alla scuola. È un **funnel in 4 step ordinati** (prova → registrati → iscrivi → paga), ciascuno illustrato con un **mockup stilizzato** (frame astratto della schermata del portale, NON uno screenshot reale), e si chiude con una **CTA che porta all'area riservata genitori**. Tono: accogliente per famiglie, pulito, sportivo, premium ma caldo.

## Visual richiesti

### 1. Sezione "Cosa occorre per iscriversi" — desktop
- **Scopo**: comunicare in un colpo d'occhio che iscriversi è semplice e in pochi passi; spingere all'azione.
- **Elementi chiave**:
  - Eyebrow "Iscrizione" + titolo di sezione (H2) + sottotitolo breve.
  - **4 step numerati 01 → 04**, con un senso di progressione/percorso tra loro (es. linea/connettore, oppure layout a timeline orizzontale o griglia ordinata).
  - Ogni step: numero progressivo, icona, **mockup illustrato** della relativa schermata, titolo (H3) e 1 frase.
  - **CTA finale** ben visibile + micro-rassicurazione sui documenti da preparare.
- **Contenuto** (usa questo copy, non lorem ipsum):
  - Eyebrow: `Iscrizione`
  - Titolo: `Iscrivere tuo figlio è semplice. Ecco come.`
  - Sottotitolo: `Quattro passi, dal primo "proviamo" fino al via. Tutto online, dall'area riservata genitori.`
  - **Step 01 — "Vieni a provare"**: `Fino a 2 lezioni di prova gratuite, per capire se la scuola fa per voi. Nessun impegno.` → *visual invitante dedicato: una foto/illustrazione di bambini in bici al ciclodromo (NON un frame del portale). Questo step è un invito, visivamente diverso dagli altri tre.*
  - **Step 02 — "Registrati"**: `Crea il tuo account nell'area riservata genitori, bastano pochi minuti.` → *mockup schermata di registrazione (campi email/password, pulsante "Crea account").*
  - **Step 03 — "Crea l'iscrizione"**: `Inserisci i dati di tuo figlio, carica una foto e il certificato medico valido.` → *mockup form di iscrizione (campi dati bambino + due aree upload: foto e certificato).*
  - **Step 04 — "Conferma e paga"**: `Leggi il regolamento, salda la quota d'iscrizione e la prima rata. Sei dentro!` → *mockup checkout (riepilogo voci + importo + pulsante "Paga").*
  - CTA primaria: `Inizia l'iscrizione`
  - Micro-rassicurazione sotto la CTA: `Tieni pronti una foto di tuo figlio e il certificato medico di idoneità sportiva non agonistica.`
- **Note**: la CTA primaria porta all'area riservata genitori. Lo step 01 NON ha un pulsante proprio (la prenotazione della prova è gestita altrove nella pagina). Un solo H2 nella sezione, titoli step come H3.

### 2. Sezione "Cosa occorre per iscriversi" — mobile
- **Scopo**: stessa sezione, impaginata in verticale per smartphone.
- **Elementi chiave**: i 4 step impilati in colonna con la numerazione 01–04 e i mockup ridotti ma leggibili; la progressione resta chiara (connettore verticale); CTA a piena larghezza in fondo, ben visibile.
- **Contenuto**: identico al desktop.

### 3. (opzionale) Dettaglio dello stile "mockup illustrato"
- **Scopo**: fissare lo stile dei frame stilizzati delle schermate (step 02–04).
- **Elementi chiave**: un singolo mockup ingrandito (es. il checkout) in stile **astratto/illustrativo** — un frame tipo finestra/telefono con UI semplificata (barre al posto dei campi, un pulsante pieno nei colori brand), **senza dati personali reali**, chiaramente "disegno" e non screenshot.

## Vincoli di design system (backup se il repo non è collegato)

- **Palette brand**: navy `#1F2D5A` (primario) e navy profondo `#050E3F` (premium/CTA scure); accenti: sky `#3A82C8`, sun `#EFE63A`, grass `#5FAC36`, ember `#E09618`, flag `#C01818`. Sfondi: bianco e un grigio-azzurro tenue (`bg-soft`).
- **Radius**: generosi (16–20px). **Ombre**: morbide e leggere.
- **Tono visivo**: editoriale, pulito, sportivo, accogliente per famiglie. Numerazioni in **font monospace** per il tocco "tecnico" (come nelle altre sezioni).
- **Componenti da riusare**: ispirati ai pattern già presenti nella pagina `/la-scuola` — la sezione "Le lezioni" (griglia di card con icona + titolo + testo + badge) e la sezione "Kit del team" (card editoriali con pill numerate in monospace e immagini su sfondo tenue).

## Vincoli SEO/contenuto rilevanti per il visual

- Gerarchia heading: la pagina ha già un H1; **questa sezione usa un solo H2**, e i titoli dei 4 step sono H3.
- CTA primaria chiaramente visibile (questa sezione sta a fondo pagina, prima della CTA conclusiva del sito).
- Per ogni mockup/immagine, annota nel canvas una **descrizione alt** suggerita (es. "Mockup illustrato della schermata di registrazione dell'area riservata").
- Contenuti in italiano (sito monolingua, nessun hreflang).

## Riferimenti as-is utili

- Pagina `/la-scuola` del sito (sezioni "Le lezioni" e "Kit del team" come riferimento di stile e ritmo).
- La sezione va inserita **dopo la galleria foto e prima della CTA finale** della pagina — pensa a uno **stacco di sfondo** che la distingua dalla galleria sopra e dalla CTA navy sotto.

## Cosa fare alla fine

Quando il risultato ti convince:
1. **Esporta il bundle per Claude Code** (menu Export → Claude Code) così posso passare gli artefatti all'implementazione.
2. Salva anche gli **screenshot dei visual finali** (desktop, mobile, ed eventuale dettaglio mockup) — li userò come riferimento visivo per l'implementazione.

## Iterazione

Inizia con una prima versione di tutti i visual (desktop + mobile, ed eventuale dettaglio mockup), poi iteriamo via chat e commenti inline sul canvas. Se qualcosa è ambiguo, chiedimi prima di generare — in particolare sullo **stile dei mockup illustrati**, che devono sembrare "disegni" della UI e non screenshot reali.
