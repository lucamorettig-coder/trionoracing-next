# Decisioni — messaggio della home

Registro delle decisioni prese con Luca il **6 agosto 2026**, durante la sessione di brainstorming
avviata da `AIM-PROMPT.md`. Il disegno completo che ne deriva sta in
**`docs/superpowers/specs/2026-08-06-messaggio-home-triono-design.md`**.

Questo file registra *cosa è stato deciso e perché*. La specifica registra *cosa si costruisce*.

---

## 1 · Fatti accertati che il brief non aveva

Nessuno di questi era nel brief. Tutti cambiano il disegno.

| # | Fatto | Conseguenza |
|---|---|---|
| 1 | La prova **va concordata prima**: presentarsi senza avvisare non funziona | La porta bassa è un contatto, non un'informazione statica |
| 2 | Oggi le richieste di prova arrivano **quasi solo dal passaparola**, non dal sito | Stiamo aprendo un canale nuovo, non portando alla luce uno esistente |
| 3 | Il canale presidiato è **WhatsApp**, stesso numero di `scuola-telefono`, risponde Luca | Nessun dato nuovo da gestire: il link si deriva da una chiave già su Airtable |
| 4 | La promessa reale è **2 lezioni gratuite su entrambi i corsi** | La formulazione di `/la-scuola` è corretta, va solo portata in superficie |
| 5 | Serve **una bici qualsiasi + casco**, nient'altro | Abbatte l'obiezione silenziosa numero uno del genitore |
| 6 | Le due gare del ciclodromo vanno **solo annunciate** (iscrizioni via canali FCI) | Nessun flusso, nessuna pagina evento, nessuna dipendenza dalle date lato codice |
| 7 | Alla **Narni Sport Night** il club allestisce un percorso di agilità e **presta le bici** | Non è il terzo evento: è la prova portata in città. Si sovrappone allo slot della prova invece di aggiungersi |
| 8 | Picco a settembre ma **flusso tutto l'anno** | La porta della prova è permanente, con enfasi variabile |
| 9 | Ad Airtable ci mette mano **solo Luca, quando serve** | Ogni contenuto a scadenza deve auto-scadere per data |
| 10 | Nessuna scadenza rigida di rilascio | Si può fare bene invece che in fretta |

---

## 2 · Decisioni

### 2.1 `PRODUCT.md` si emenda — **approvato**

La CTA primaria dichiarata passa da *"Iscriviti alla scuola"* a *"Prenota una prova"*, con nota
esplicita che **l'obiettivo di business resta l'iscrizione**. La riga originale confondeva obiettivo e
CTA. Testo dell'emendamento in §4 della specifica.

È la precondizione dell'intero disegno: senza, il sito avrebbe una CTA primaria che contraddice il
documento di brand, che è peggio di entrambe le opzioni pure.

### 2.2 La riga di cornice perde la seconda frase — **deciso da Luca**

Da *"Due modi per cominciare. Il primo è gratis."* a **"Due modi per cominciare."**

Motivo: *"il primo è gratis"* in italiano evoca la formula del piazzista, in contrasto con il
principio *"mai vendere a freddo"* di `PRODUCT.md`. Argomento di sistema che lo rinforza: *gratis*
compare già dentro la porta A come **prezzo d'ingresso**, cioè come fatto che serve a decidere;
ripeterlo nella cornice lo trasforma da fatto in **esca**.

Presidio conseguente: *gratis* deve comparire **una sola volta** nel primo viewport.

### 2.3 La fotografia è reale, fornita da Luca — **deciso**

Scartata l'ipotesi di generarla con fal.ai. Motivo dirimente: il disegno si regge sulla tesi che, non
avendo prove sociali, l'unica prova che possiamo dare è l'esperienza reale. Una fotografia di bambini
che non esistono, presentata come la nostra scuola, lavora contro quella tesi.

Scartata anche `public/photos/scuola/inizio-lezione.jpg`, che la sintesi aveva scelto: è uno scatto da
telefono in giornata coperta, su un prato con nastro da ciclocross, **non al ciclodromo** — la
didascalia proposta avrebbe asserito un luogo falso.

La foto scelta è molto più forte: bambino fermo di spalle prima di partire, casco allacciato, kit
Triono leggibile, bici gialla (che è `--accent-2` della livrea racing), luce bassa coerente con
l'orario reale delle lezioni, un secondo ciclista sfocato in secondo piano.

### 2.4 Nino e Vittoria ai lati della fotografia — **deciso da Luca**

Le mascotte affiancano il campo fotografico, agganciate al bordo inferiore, rivolte verso la scena —
a bordo pista, come il genitore. Non coprono il bambino reale, e il campo tipografico resta pulito.

Motivo: la foto da sola, dentro una livrea scura da racing, rischia di essere fredda per un pubblico
di genitori; le mascotte sono il registro caldo del brand e non generano ambiguità su cosa sia reale.

Rischio dichiarato: registro misto. Funziona se leggono come props di palco, fallisce se leggono come
adesivi. Verifica da fare sullo schermo reale.

### 2.5 Il fondale vivo **non** si spegne — deciso in sede di specifica

La sintesi proponeva di togliere il video dalla home. Il critico ha osservato che sceglieva fra "video
ovunque" e "niente video" senza valutare la terza opzione: la composizione è già a due campi, quindi
il **fondale trattato può vivere nel campo tipografico di sinistra** — dove è texture e non deve
essere leggibile — e la fotografia occupa il destro.

Si tengono insieme la regola APEX del fondale unico, la manopola Airtable introdotta in EVO-021, il
movimento richiesto da *"energici mai aggressivi"*, e un'immagine leggibile.

### 2.6 Densità del primo viewport desktop — risolta in sede di specifica

Il critico aveva rilevato che la sintesi peggiorava rispetto alla proposta vincente: quattro CTA con
due sole etichette ripetute sopra la piega. Risolto togliendo il bottone pieno dallo slot ① della
fascia, che diventa link testuale — l'azione piena la porta già la porta A.

### 2.7 La chiusa del sottotitolo passa all'impersonale — **deciso da Luca**

Da *"chi cresce continua con la squadra"* a **"e poi si continua con la squadra"**.

Motivo: la prima versione suonava come il rinnovo di un abbonamento, e metteva addosso al bambino un
obbligo. L'impersonale descrive il percorso senza promettere nulla a nessuno in particolare, e fa
coppia con l'attacco della frase — **si comincia … e poi si continua** — legando i due tempi in una
sola respirazione.

### 2.8 Su mobile la fotografia non è nel primo viewport — trade-off accettato

A 375×553 utili la priorità è claim → promessa → due porte. La foto è la prima cosa al primo scroll.
Una sola mascotte, come impone il budget prop di APEX.

### 2.9 Blocco «Cosa mettiamo noi» — **richiesto da Luca**

Due servizi che il sito oggi non nomina da nessuna parte e che i genitori non possono immaginare:

- **La bici da corsa in comodato d'uso gratuito** per chi si iscrive al corso che comprende la strada.
  Toglie la domanda che un genitore si fa subito dopo aver detto sì: *"e adesso devo comprargli una
  bici da corsa?"*
- **L'area riservata** per iscrizione, rinnovo del certificato medico, quote e rate mensili. Non è una
  promessa: è già costruita.

**Perimetro accertato, e vincolante.** Alla **prova** il bambino viene **sempre con la propria bici**:
non prestiamo nulla in quella sede. Il comodato scatta **dopo l'iscrizione**, solo per il corso che
comprende la strada. La porta A resta quindi *"basta una bici qualsiasi e il casco"*, e né lì né su
`/prova` si può lasciar intendere che le bici si prestino alla prova.

Collocazione: sotto la piega, dentro `SezioneScuola`. È un argomento che convince chi ha già capito
cosa siamo, non chi deve ancora capirlo.

### 2.10 Lo slot ② entra nella prima evolutiva — deciso in sede di pianificazione

Buco trovato nella specifica mentre si scriveva il piano: rendendo la hero deterministica,
`HeroCampagne` smette di occupare il primo viewport, ma la specifica rimandava lo slot eventi alla
seconda evolutiva. Nel mezzo i record di `Comunicazioni Hero` sarebbero rimasti orfani e la campagna
oggi attiva sarebbe sparita dal sito.

Risolto anticipando lo slot ②, che legge **la tabella già esistente** con l'admin già costruito su
`/portale/admin/comunicazioni`. Nessuna tabella nuova, nessun concetto nuovo per chi aggiorna, e
niente resta per strada.

---

## 3 · Errori del brief e del codice emersi durante la sessione

Verificati direttamente, non riportati.

1. **`HeroCampagne.tsx:253`** — con una campagna attiva l'`<h1>` è il titolo della campagna e il claim
   di marca degrada a `<p>` da 15px (riga 240). Il commento a riga 31 dichiara l'opposto ed è stale.
   **Il vincolo "un solo `<h1>`, il claim brand" oggi non è rispettato in produzione.**
2. **`contatti/page.tsx:97`** — *"Niente prenotazione, basta presentarsi"* riguarda il venire a
   guardare, mentre la prova in sella va concordata. La distinzione non è dichiarata da nessuna parte.
3. **`HomeTicker.tsx:11`** — hardcoded, annuncia ancora `Marathon MTB 209 · 28 GIU 2026`, data passata
   da sei settimane. Dimostrazione pratica del perché i contenuti a scadenza non possono richiedere un
   deploy.
4. **`CtaFinale` è condivisa** da home, `/chi-siamo` e `/gli-amatori-triono`. Nessuna delle tre
   proposte se ne era accorta. Qualsiasi copy sulla prova messo lì comparirebbe in fondo alla pagina
   Amatori.
5. **`scripts/dev-shot.mjs` non ha** il controllo `innerWidth`/`innerHeight` né il ritentativo che la
   sintesi gli attribuisce. Le misure restano probabilmente valide, ma non sono blindate come
   dichiarato.
6. **Non esistono test su `src/`**: gli unici test del repo stanno in `emails/`.

---

## 4 · Metodo, e dove si è fermato

Tre sub-agent hanno prodotto proposte concorrenti e indipendenti con tesi diverse. Un critico separato
le ha valutate **in cieco** sugli otto test dell'aim prompt e ha scelto un vincitore. La sintesi ha
innestato sul vincitore gli elementi migliori delle altre due, corretto gli errori verificati e
rimisurato la piega sul dev server. Il critico ha rigiudicato la sintesi.

**Verdetto finale:** la parte strategica, architetturale e operativa è **chiusa**. Il confronto con il
reference non è raggiunto su un solo asse, l'art direction — e la distanza era una fotografia che non
esisteva. Luca l'ha fornita, ed è migliore di quella che la sintesi aveva trovato in repo.

Il loop si ferma qui per un motivo esplicito: continuare a girare avrebbe prodotto documenti più
lunghi, non un'immagine.

---

## 5 · Aperto, e blocca il rilascio

1. **Liberatoria della famiglia** del bambino ritratto, anche se di spalle.
2. **Verifica del luogo dello scatto.** Finché non è verificato, nessuna didascalia nomina il
   Ciclodromo Renato Perona.
3. **Conferma che `scuola-telefono` sia raggiungibile su WhatsApp.**

## 6 · Aperto, e non blocca

- Orari e materiali delle due gare di settembre, se esistono locandine.
- Se il volume WhatsApp diventerà sostenibile da una persona sola. Da misurare, non da prevedere.
- Numerazione delle evolutive: l'ultima nel repo è EVO-044 ma EVO-045 risulta in corso nel vault. Da
  verificare su `evolutive/`, `git branch -a` e PR aperti prima di aprire i branch.
