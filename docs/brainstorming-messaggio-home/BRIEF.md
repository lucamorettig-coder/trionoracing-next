# Brief: il messaggio della home rispetto ai casi d'uso

Ricognizione fatta il 6 agosto 2026 su `main`. Questo documento è il punto di partenza del
brainstorming, **non una verità**: ogni fatto qui elencato va riverificato nel codice prima
di costruirci sopra una decisione.

---

## 1. Il fatto che ha innescato tutto

Una mamma ha contattato la Scuola. Il figlio non era iscritto, voleva **fargli fare la prova**
prima di decidere. Sul sito non ha capito cosa dovesse fare, quindi ha aperto la procedura di
**iscrizione completa**, che è il percorso sbagliato: per la prova basta contattarci.

Non è un caso isolato di distrazione. È il sito che le ha detto di fare così.

---

## 2. Stato verificato del sito pubblico

### Le porte d'ingresso in home sono tutte la stessa porta

| Componente | File | Label | Destinazione |
|---|---|---|---|
| Hero | `src/components/home/HomeHero.tsx` | Iscrivi tuo figlio | `/portale/iscrizioni` |
| Sezione Scuola, card Quando/Dove | `src/components/home/SezioneScuola.tsx` | Iscrivi tuo figlio | `/portale/iscrizioni` |
| CTA finale | `src/components/home/CtaFinale.tsx` | Iscrivi tuo figlio | `/portale/iscrizioni` |
| NavBar, bottone fisso | `src/components/apex/ApexNavBar.tsx` (link da `src/app/(public)/layout.tsx`) | Iscrivi tuo figlio | `/portale/iscrizioni` |

La CTA secondaria in hero è `Scopri la Scuola` verso `/la-scuola`. Il ticker sotto la hero
(`src/components/home/HomeTicker.tsx`) ripete **ISCRIZIONI APERTE**.

**La parola "prova" non compare mai nella home.** Verificato con grep su
`src/app/(public)` e `src/components/home`.

### Dove vive oggi il messaggio della prova

Solo su `/la-scuola`, in due punti entrambi in fondo alla pagina:

1. `src/components/scuola/SezioneComeIscriversi.tsx`, step 01 "Vieni a provare": *"Fino a 2
   lezioni di prova gratuite, per capire se la scuola fa per voi. Nessun impegno."* La CTA è
   un link testuale soft (`LinkProva`, riga ~253): "Contattaci e prenota subito una prova".
   Non un bottone, per scelta esplicita di gerarchia.
2. `src/components/scuola/CtaScuola.tsx`: *"Ci si iscrive tutto l'anno, e prima si può provare
   senza impegno con un paio di lezioni gratuite. Scrivici per fissare una prova o chiedere
   informazioni."* I bottoni però sono `Iscrivi tuo figlio`, `Scrivici` (mailto), `Chiama`.

### Il form contatti non ha il binario prova

`src/components/contatti/ContactForm.tsx`, costante `MOTIVI`:
`Scuola di Ciclismo`, `Tesseramento Amatori`, `Marathon 209`, `Altro`.
Esiste il deep link `?motivo=scuola|tesseramento|marathon` (funzione `motivoFromKey`).
Nessun valore dedicato alla lezione di prova.

### Conseguenza

Esiste un solo ingresso ed è quello con lo scalino più alto: registrazione account, dati
anagrafici del genitore obbligatori (EVO-030), dati del bambino, pagamento. Chi non ha ancora
visto il ciclodromo non è pronto per quello scalino. O lo sale a fatica, o rimbalza.

`PRODUCT.md` dichiara la belief ladder **Sicurezza, Metodo, Community, Azione**. La home oggi
salta dritta all'azione più impegnativa.

---

## 3. Cosa vogliamo ottenere

### Obiettivo A, il messaggio della prova

Far capire, prima e sopra tutto il resto, che **si può provare gratis senza iscriversi**.
Due lezioni, nessun impegno, basta contattarci. Serve una porta bassa accanto alla porta alta,
non al posto suo.

Da decidere: dove vive la prenotazione della prova (pagina dedicata `/prova` con form minimo,
form contatti con motivo precompilato, WhatsApp diretto, o combinazione), e con che peso
compare nella gerarchia delle CTA di ogni pagina.

### Obiettivo B, la hero

La hero deve restare **alta e di alto livello**, ma deve portare con sé più messaggi:
l'iscrizione alla scuola, la prova, e tre informazioni a scadenza di settembre. È una tensione
reale: quattro messaggi in un viewport rischiano di trasformare la hero in una bacheca.

### Le tre informazioni di settembre

1. **12 settembre 2026**, gara su strada per Giovanissimi organizzata da noi, Ciclodromo
   Renato Perona, Terni.
2. **19 settembre 2026**, Narni Sport Night, partecipiamo come ogni anno.
3. **26 settembre 2026**, gara di mountain bike per Giovanissimi organizzata da noi,
   Ciclodromo Renato Perona, Terni.

Da chiarire con Luca prima di scrivere copy: orari, chi può iscriversi alle due gare (solo
società FCI? famiglie del territorio?), come ci si iscrive, se esistono volantini o
locandine, se Narni Sport Night prevede uno stand o una prova bici.

Nota strategica da validare: tutti e tre sono eventi di **acquisizione**, non comunicazioni
agli iscritti. Le gare portano al ciclodromo famiglie e società esterne, Narni Sport Night è
il momento in cui si incontrano fisicamente i genitori del territorio. Il messaggio giusto
dentro quegli eventi potrebbe essere "vieni a provare" più che "iscriviti".

---

## 4. Meccaniche già disponibili nel progetto

Da riusare o da superare consapevolmente, non da reinventare.

- **Hero campagne dinamica (EVO-035).** `src/components/home/HeroCampagne.tsx` +
  `src/lib/comunicazioni-hero.ts`. Legge la tabella Airtable `Comunicazioni Hero` con campi
  `ATTIVA`, `VALIDO_DA`, `VALIDO_A`, `PRIORITA`, `TITOLO` (supporta `**parola**` per
  l'accento), `SOTTOTITOLO`, `CTA_LABEL/URL`, `CTA2_LABEL/URL`, `IMMAGINE_URL`.
  Rotazione client ogni 7 secondi, tutte le slide nel markup per SEO, controlli
  play/pausa/frecce/dot, rispetto di `prefers-reduced-motion`. Admin CRUD su
  `/portale/admin/comunicazioni` con `revalidatePath('/')`. Fallback all'hero statica se non
  ci sono comunicazioni attive. **Limite noto:** con tre eventi ravvicinati ogni slide resta
  visibile 7 secondi su 21, e la slide sostituisce il messaggio di iscrizione.
- **Sfondi video da Airtable.** `src/lib/sfondi-video.ts`, slot `home-hero`, `home-cta`,
  `scuola-hero`, `scuola-cta`. Pattern SAFE, non lancia mai.
- **Site settings da Airtable.** `src/lib/site-settings.ts`, chiavi `scuola-telefono` e
  `scuola-referente`, già usate da `CtaScuola` e `/contatti`.
- **ISR.** Home `revalidate = 600`, comunicazioni hero `revalidate = 300`.
- **Nessuna route pubblica per eventi o gare.** Le route pubbliche sono: `/`, `/la-scuola`,
  `/gli-amatori-triono`, `/chi-siamo`, `/marathon-209`, `/diventa-maestro`, `/contatti`,
  più le legali. Le gare esistono solo dentro il portale (`/portale/admin/gare`), per gli
  iscritti.

---

## 5. Vincoli non negoziabili

- **`PRODUCT.md`** è la fonte: due pubblici senza gerarchia (genitori e atleti), belief
  ladder Sicurezza, Metodo, Community, Azione, principio "il percorso prima della pagina",
  cinque principi di personalità, anti reference "club sportivo generico o dozzinale".
- **Nessuna prova sociale inventata.** `PRODUCT.md` dice esplicitamente che non ci sono
  testimonianze, numeri o loghi partner disponibili. Non inventarli.
- **Design system APEX v2.** Un telaio, quattro livree (`data-livery`). Massimo un fondale
  vivo per viewport, budget di un prop su mobile, il contenuto della pista è sacro.
  Riferimento completo in `AGENTS.md`.
- **Un solo `<h1>` in home**, il claim brand. Deciso in EVO-035, non rimetterlo in
  discussione senza motivo forte.
- **WCAG 2.1 AA**, navigazione da tastiera, `prefers-reduced-motion`, alt text.
- **Contenuti a scadenza gestibili da Airtable senza deploy**, coerentemente con il pattern
  già in uso. Se una proposta richiede un deploy per aggiornare una data, deve dichiararlo
  come costo.

---

## 6. Domande aperte da portare in sessione

1. La prova gratuita è davvero "fino a 2 lezioni"? Vale per entrambi i corsi (strada il
   martedì, MTB il giovedì)? Serve prenotare o ci si può presentare?
2. Cosa serve davvero per prenotare: nome del genitore, telefono, età del bambino, quale
   giorno? Il bambino deve avere una bici propria e un casco?
3. Le due gare del ciclodromo hanno iscrizioni online, o passano dai canali federali?
4. A Narni Sport Night cosa facciamo esattamente? Stand, prove bici, dimostrazione?
5. Quanto pesa oggi la stagionalità? Settembre è il mese di picco delle iscrizioni, o si
   iscrive davvero tutto l'anno come dice `CtaScuola`?
6. Esiste già un numero WhatsApp usato di fatto per questi contatti?
