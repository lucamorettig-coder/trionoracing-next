# Architettura del messaggio della home — trionoracing.it

**Data:** 6 agosto 2026 · **Stato:** approvata, pronta per il piano di implementazione
**Origine:** `docs/brainstorming-messaggio-home/` (brief, tre proposte concorrenti, verdetto in cieco, sintesi)

---

## 1 · Il problema

Una mamma voleva far provare il figlio alla scuola. Sul sito ha trovato solo *"Iscrivi tuo figlio"*
ripetuto quattro volte e ha aperto la procedura di iscrizione completa — registrazione account, dati
anagrafici del genitore, dati del bambino, pagamento — che è il percorso sbagliato per chi non ha
ancora visto il ciclodromo. La lezione di prova gratuita esiste, ma vive in fondo a `/la-scuola` come
link testuale.

Verificato nel codice il 6 agosto 2026:

| Superficie | File | Label | Destinazione |
|---|---|---|---|
| Hero | `src/components/home/HomeHero.tsx:70` | Iscrivi tuo figlio | `/portale/iscrizioni` |
| Sezione Scuola | `src/components/home/SezioneScuola.tsx:124` | Iscrivi tuo figlio | `/portale/iscrizioni` |
| CTA finale | `src/components/home/CtaFinale.tsx:43` | Iscrivi tuo figlio | `/portale/iscrizioni` |
| NavBar (desktop + mobile) | `src/components/apex/ApexNavBar.tsx:80,159` | Iscrivi tuo figlio | `/portale/iscrizioni` |

La parola *prova* non compare mai in `src/components/home/` né in `src/app/(public)/page.tsx`.

In parallelo la home deve iniziare a portare tre informazioni a scadenza di settembre senza diventare
una bacheca.

---

## 2 · La tesi

`PRODUCT.md` dichiara che non abbiamo prove — niente testimonianze, niente numeri, niente loghi
partner. **Ma una prova ce l'abbiamo, ed è la migliore possibile: novanta minuti al ciclodromo.**

Un genitore che porta il figlio a una lezione di prova sale tutti i gradini della belief ladder in un
pomeriggio: vede la pista chiusa al traffico e i caschi allacciati (*Sicurezza*), vede un maestro
federale che lavora sull'equilibrio in gruppo piccolo (*Metodo*), vede gli altri bambini e gli altri
genitori a bordo pista (*Community*). Nessuna quantità di copy fa quel lavoro.

E c'è un secondo fatto: **oggi le richieste di prova arrivano quasi solo dal passaparola**, non dal
sito. Il percorso che funziona nella realtà è *persona → prova → iscrizione*, e la home ne salta i
primi due terzi. Il sito compete con un funnel che non esiste invece di mettersi dentro quello che
già funziona.

---

## 3 · Principio guida — tre livelli, tre orologi

| Livello | Contiene | Chi lo scrive | Ogni quanto cambia |
|---|---|---|---|
| **Marca** (hero) | Chi siamo, per chi, dove, **le due porte** | Il codice | Mai |
| **Regia** (fascia sotto la hero) | La prova adesso, il prossimo appuntamento, gli orari | Codice + Airtable | Da sola, per data |
| **Racconto** (sezioni) | Scuola, ciclodromo, amatori, Marathon | Il codice | Mai |

Due regole che ne discendono, e che vanno rispettate anche fra un anno:

> **Il codice garantisce la presenza. Airtable modula l'enfasi.**

> **Il codice garantisce anche l'assenza.** Le porte sono un componente che **non ha la prop** per una
> terza CTA. Fra un anno non possono tornare quattro.

---

## 4 · Emendamento a `PRODUCT.md` — approvato

La riga *"Primary CTA: Iscriviti alla scuola"* confonde **obiettivo** e **CTA**. L'obiettivo di
business resta l'iscrizione; ma un funnel a due passi con un primo passo ad attrito quasi nullo
converte più iscrizioni di un funnel a un passo ad attrito alto, soprattutto quando il primo passo
*è* l'esperienza che vende il secondo.

Testo da sostituire nella sezione *Conversion & proof*:

```
- Primary CTA: Prenota una prova (gratuita, fino a 2 lezioni)
- Secondary CTA: Iscrivi tuo figlio — per chi ha già deciso. Sempre a un clic,
  sempre presente nel chrome e accanto alla porta bassa, mai la prima cosa che
  vede un estraneo.
- Tertiary: Scopri la Scuola / Chi siamo.
- Nota: l'obiettivo di business resta l'iscrizione. La prova è il primo passo del
  percorso verso l'iscrizione, non un obiettivo alternativo.
- Proof on hand: la lezione di prova È la nostra prova. In assenza di
  testimonianze, numeri e loghi, l'esperienza diretta è l'unica evidenza che
  possiamo offrire, e va trattata come tale.
- La riga che un visitatore deve ricordare dopo 10 secondi: "Qui i bambini
  iniziano in sicurezza e chi cresce diventa atleta della squadra — e si può
  venire a provare prima di decidere."
```

Questo emendamento è la **precondizione** dell'intera specifica: senza, il sito avrebbe una CTA
primaria che contraddice il documento di brand, che è peggio di entrambe le opzioni pure.

---

## 5 · Il primo viewport

### 5.1 Composizione — desktop

Due campi affiancati, nessuna sovrapposizione fra testo e fotografia:

```
┌────────────────────────────────────┬──────────────────────────────┐
│ CAMPO TIPOGRAFICO (~52%)           │ CAMPO FOTOGRAFICO (~46%)     │
│ fondale vivo trattato (Airtable)   │ fotografia, full-bleed       │
│                                    │                              │
│ eyebrow                            │   [Vittoria]      [Nino]     │
│ <h1>                               │    props bottom-anchored      │
│ sottotitolo                        │    ai bordi del campo         │
│                                    │                              │
│ «Due modi per cominciare.»         │                              │
│ ┌ porta A ┐  ┌ porta B ┐           │                              │
└────────────────────────────────────┴──────────────────────────────┘
```

**Il fondale vivo resta.** Il video da Airtable (slot `home-hero`, `src/lib/sfondi-video.ts`) vive nel
campo tipografico di sinistra, con il trattamento obbligatorio già implementato in `FondaleVivo`
(grayscale + duotone + opacity ≤ .4 + vignetta). Lì è texture, non deve essere leggibile, non compete
con niente. Si tengono insieme: la regola APEX del fondale unico per viewport, la manopola Airtable
introdotta in EVO-021, il movimento richiesto da *"energici mai aggressivi"*, e un'immagine leggibile
nel campo destro.

**Le mascotte sono props di palco, non adesivi.** Nino e Vittoria ai bordi del campo fotografico,
**agganciati al bordo inferiore** (regola `NINO.md` §6/§12: il taglio del cutout coincide col bordo,
mai figure che fluttuano), rivolti verso la scena — a bordo pista, come il genitore. Non coprono il
bambino reale. Asset: `public/nino/nino-figura-poster.png` e `public/vittoria/vittoria-figura-poster.png`,
oppure le pose `nino-strada.webp` / `vittoria-mtb.webp` se in fase di implementazione risultano più
leggibili al taglio richiesto.

### 5.2 Composizione — mobile 375px

Ordine di priorità dichiarato: **claim → promessa → due porte**. Nel primo viewport ci stanno quelli.

```
┌──────────────────────────────┐
│ fondale vivo trattato        │
│ eyebrow                      │
│ <h1>                         │
│ sottotitolo (corto)          │
│ «Due modi per cominciare.»   │
│ ┌────── porta A ──────┐      │
│ ┌────── porta B ──────┐      │
├ ─ ─ ─ ─ piega ─ ─ ─ ─ ─ ─ ─ ┤
│ fotografia + 1 mascotte      │
│ fascia di regia              │
└──────────────────────────────┘
```

**Trade-off dichiarato:** su mobile la fotografia **non è nel primo viewport**. A 375×553 utili le due
porte complete valgono più dell'immagine, e il test che deve passare è quello della mamma. La foto è
la prima cosa che si vede al primo scroll, subito sotto le porte. Una sola mascotte, come impone il
budget prop di APEX su mobile.

### 5.3 La fotografia

Fotografia reale della scuola, fornita dal committente: **un bambino fermo di spalle, casco allacciato,
in kit Triono Scuola Ciclismo, che guarda la pista prima di partire**, bici gialla, luce bassa e calda,
un secondo ciclista sfocato in secondo piano.

Perché questa e non un'altra:

- È **l'istante prima di cominciare**, non un ricordo di qualcun altro. Chi guarda non vede il figlio
  di un altro: vede il proprio, fra due minuti. È esattamente ciò che vende la prova.
- **Nessun volto di minore.** Di spalle per costruzione, non per ritaglio.
- Il giallo della bici è `--accent-2` della livrea racing: **l'accento del design system è dentro la
  fotografia**, non applicato sopra.
- La luce bassa è coerente con l'orario reale delle lezioni (17:00–18:30).
- Il ciclista sfocato in secondo piano dice *"c'è un gruppo"* senza doverlo scrivere.

**Vincoli di pubblicazione, bloccanti:**

1. **Liberatoria della famiglia** del bambino ritratto, anche se di spalle. Da acquisire prima del
   rilascio.
2. **Verifica del luogo dello scatto.** Finché non è verificato, **nessuna didascalia nomina il
   Ciclodromo Renato Perona.** È l'unico punto in cui questa specifica rischierebbe il test di onestà.
3. Sorgente in HEIC verticale: va esportata, ridimensionata e ritagliata per i due campi (desktop
   verticale nel campo destro; mobile ritaglio dedicato). Destinazione `public/photos/scuola/`.

---

## 6 · Copy, parola per parola

### 6.1 Hero

```
eyebrow    SCUOLA DI CICLISMO E SQUADRA · TERNI

h1         In bici, sicuri, insieme.        ["insieme." in accento]

sub        Bambini dai 4 anni, maestri federali, al Ciclodromo Renato Perona
(desktop)  di Terni. Si comincia con due lezioni di prova gratuite, e poi si
           continua con la squadra.

sub        Bambini dai 4 anni, maestri federali, al Ciclodromo Renato Perona
(mobile)   di Terni.
```

**Eyebrow.** Tre informazioni in cinque parole: cosa siamo (*scuola*), cosa siamo anche (*squadra* —
è la porta semantica del pubblico amatori/agonisti), dove (*Terni*). Nessuna data, quindi non
invecchia. Sostituisce `TRIONO RACING · DAL 2015 · TERNI`, che ripete il nome già presente nel logo.

**`<h1>`.** Resta `In bici, sicuri, insieme.`, con l'accento su **insieme** — la sicurezza è il
prerequisito, l'appartenenza è la promessa. Il cambiamento vero non è il testo: è che **torna a essere
davvero un `<h1>`**. Oggi, con una campagna Airtable attiva, l'`<h1>` è il titolo della campagna
(`HeroCampagne.tsx:253`, `const TitleTag = i === 0 ? "h1" : "p"`) e il claim di marca è degradato a
`<p>` da 15px (riga 240). Il commento in testa al file, riga 31, dichiara l'opposto ed è **stale**: va
corretto.

*Alternativa considerata e scartata:* `Prima di iscriverti, vieni a provare.` come `<h1>`. È la frase
esatta di cui la mamma aveva bisogno, ma è un'istruzione di funnel messa nell'asset tipografico più
prezioso del sito, e riprodurrebbe la stessa degradazione che questa specifica corregge. Quella frase
non sparisce: **diventa la domanda della porta A**, che è il posto in cui un'istruzione ha diritto di
stare.

**Sottotitolo.** Cinque fatti verificati, zero aggettivi: *dai 4 anni* · *maestri federali* ·
*Ciclodromo Renato Perona di Terni* · **due lezioni di prova gratuite** · *e poi si continua con la
squadra*. È qui che si vince il test dei dieci secondi, perché porta entrambe le metà della riga di
`PRODUCT.md` nel primo viewport.

La chiusa è in forma impersonale, in coppia con l'attacco: **si comincia … e poi si continua**. La
prima stesura diceva *"chi cresce continua con la squadra"* e suonava come il rinnovo di un
abbonamento — un obbligo messo addosso al bambino. L'impersonale descrive il percorso senza promettere
nulla a nessuno in particolare, e il parallelismo lega i due tempi in una frase sola. Su mobile si ferma al primo punto: la seconda metà è ridondante con
il prezzo della porta A cento pixel più sotto, e l'eyebrow porta già la parola *squadra*.

### 6.2 La riga di cornice

Sopra le due porte, **desktop e mobile**:

> **Due modi per cominciare.**

Quattro parole che fanno due cose: dichiarano il **numero** — insieme chiuso, niente opzioni nascoste
da cercare — e **incorniciano** la coppia come un unico oggetto da leggere. Non è una domanda:
chiedere *"da dove vuoi cominciare?"* inviterebbe a deliberare, e la domanda sta già *dentro* le porte,
dove ha risposta ovvia.

**Decisione del committente, 6 agosto 2026:** la versione originale era *"Due modi per cominciare. Il
primo è gratis."* La seconda frase è stata rimossa perché in italiano evoca la formula del piazzista,
in contrasto con il principio di `PRODUCT.md` *"mai vendere a freddo"*. C'è anche un argomento di
sistema: la parola *gratis* compare già dentro la porta A come **prezzo d'ingresso**, cioè come fatto
che serve a decidere; ripeterla nella cornice la trasformerebbe da fatto in **esca**.

**Conseguenza da presidiare:** *gratis* deve comparire **una sola volta** nel primo viewport, nel
prezzo della porta A. Se si moltiplica in tre punti torna a suonare come un'insegna.

La riga resta anche su mobile: è l'unica del fascicolo con il registro giusto, ed è dove sta la
maggioranza dei genitori. I pixel necessari si recuperano nascondendo, **sotto i 553px di altezza
utile di viewport** (iPhone SE), il prezzo della porta B — una riga mono da 11px rivolta a chi ha già
deciso.

### 6.3 Le due porte

| | **Porta A** | **Porta B** |
|---|---|---|
| **Domanda** (mono, accento) | `Tuo figlio non ha mai provato?` | `Hai già deciso?` |
| **Azione** | `Prenota una prova` → `/prova` | `Iscrivi tuo figlio` → `/portale/iscrizioni` |
| **Prezzo** (mono, muted) | `Fino a 2 lezioni, gratis · basta una bici qualsiasi e il casco` | `Tutto online · foto e certificato medico` *(nascosto sotto i 553px di altezza utile)* |

**Perché due domande e non due bottoni.** Due bottoni che sono due intensità dello stesso atto
costringono a valutare un **grado**, e valutare un grado richiede informazioni che il genitore freddo
non ha. Due domande con risposta ovvia no. È la differenza fra un bivio stradale, che richiede
giudizio, e le due file *UE / non UE* al controllo passaporti, dove il criterio è un fatto.

**Perché il prezzo dichiarato.** È il secondo criterio di auto-selezione, onesto in entrambe le
direzioni: chi non ha il certificato medico scopre in due secondi che oggi la sua porta è la A, invece
di scoprirlo a metà wizard; e chi teme di non avere *"la bici giusta"* viene disinnescato in tre
parole. *"Una bici qualsiasi"* è la frase che abbatte la barriera vera.

**Porta B non è nascosta.** È una superficie piena, non un link debole, in `--accent-2` — il giallo
con il contrasto migliore della palette sul palco. Chi ha già deciso non va convinto: va servito, e lo
si serve dandogli la stessa dimensione, non lo stesso rumore.

**Isomorfismo.** Stessa grammatica — domanda → azione → prezzo — e stessa geometria. Il lettore
decodifica la prima porta in pochi secondi e la seconda in meno di uno, perché ne conosce già la
forma.

### 6.4 «Cosa mettiamo noi» — il blocco servizi

Blocco compatto dentro `SezioneScuola`, sotto la piega. Risponde alle domande che il genitore si fa
**dopo** aver detto sì, e che oggi il sito non affronta da nessuna parte.

```
COSA METTIAMO NOI

La bici da corsa      Chi si iscrive al corso che comprende la strada riceve la
                      bici da corsa in comodato d'uso gratuito. Non serve
                      comprarla per capire se piace.

L'area riservata      Iscrizione, rinnovo del certificato medico, quote e rate
                      mensili: tutto online, in un'unica area riservata.

I maestri             Maestri federali, gruppi piccoli per età.
```

**Attenzione al perimetro del comodato, che è un impegno vincolante.** Vale **dopo l'iscrizione**, per
chi sceglie il corso che comprende la strada (`MTB-BDC`), **non durante la prova**: alla prova il
bambino viene sempre con la propria bici. Il copy non deve lasciar intendere il contrario, né sulla
porta A né su `/prova`.

Perché sta sotto la piega e non in hero: è un argomento che convince chi ha già capito cosa siamo, non
chi deve ancora capirlo. Nel primo viewport competerebbe con le due porte.

### 6.5 La fascia di regia

```
slot ①   LA PROVA · SUBITO
         Due lezioni gratuite, senza iscriversi.
         Scrivi su WhatsApp →                     [link testuale, non bottone pieno]

slot ②   IN PROGRAMMA                                        ← da Airtable, un evento alla volta
         12 set · Giovanissimi su strada
         Ciclodromo Renato Perona, Terni · iscrizioni tramite le società, sui canali FCI
         POI: 3 OTT · GIOVANISSIMI IN MTB                     ← generata, max 1 riga

slot ③   ALLENAMENTI
         Martedì strada · Giovedì MTB
         17:00–18:30, Ciclodromo Renato Perona, Terni
         Come funziona la Scuola →                → /la-scuola
```

*"Senza iscriversi"* nello slot ① è la frase che chiude il malinteso all'origine di tutto: la mamma
aveva aperto la procedura di iscrizione perché nessuno le aveva mai detto che si poteva fare l'una
senza l'altra.

Gli **orari nello slot ③** sono lì per un motivo preciso: un genitore decide *"possiamo farcela?"*
prima di decidere *"ci proviamo?"*. Martedì alle 17:00 è una domanda di logistica familiare, e oggi la
risposta vive due schermi più in basso.

**Lo slot ① non ha un bottone pieno.** L'azione piena la porta già la porta A: ripeterla
produrrebbe quattro CTA con due sole etichette nel primo viewport desktop. Un link testuale mantiene
la porta raggiungibile senza duplicare il richiamo.

La fascia **sostituisce `HomeTicker`**, che è hardcoded e annuncia ancora `Marathon MTB 209 · 28 GIU
2026` — una data passata da sei settimane. È la dimostrazione pratica del perché ogni contenuto a
scadenza deve auto-scadere per data.

---

## 7 · La consegna a WhatsApp

Il canale è WhatsApp, sullo stesso numero già gestito su Airtable con chiave `scuola-telefono`
(`src/lib/site-settings.ts`), oggi usato come *"Chiama"* su `/la-scuola` e `/contatti`. Risponde il
titolare in persona. **Nel codice non esiste oggi nessun `wa.me`.**

**Il numero non va mai hardcoded:** il link si deriva a runtime dalla chiave Airtable, normalizzando
il numero in formato internazionale senza spazi né simboli. Se la chiave è assente, la pagina degrada
al form contatti invece di mostrare un link rotto.

`/prova` non è un rimbalzo: è una pagina che spiega cosa succede prima di far uscire l'utente dal
sito. Deve contenere, nell'ordine:

1. **Cosa serve davvero:** la bici del bambino, qualunque essa sia, e il casco. Niente altro. Alla
   prova non prestiamo bici: viene con la sua. *(Nota separata, più in basso nella pagina e non fra i
   requisiti: chi poi si iscrive al corso che comprende la strada riceve la bici da corsa in comodato
   d'uso gratuito.)*
2. **Quando:** martedì strada, giovedì MTB, 17:00–18:30.
3. **Cosa succede:** si scrive, si concorda il giorno, si viene. Fino a due lezioni, gratis, senza
   iscriversi.
4. **Chi risponde:** una persona, non un centralino.
5. Il pulsante WhatsApp, con **messaggio precompilato** che contiene già ciò che serve al titolare
   per rispondere una volta sola:
   > `Ciao! Vorrei far provare mio figlio/a alla Scuola di Ciclismo. Età: __ · Giorno preferito: martedì (strada) / giovedì (MTB)`
6. **Chi non usa WhatsApp:** alternativa esplicita e allo stesso livello — telefono e form contatti —
   non un ripiego in fondo alla pagina.

**Correzione obbligatoria su `/contatti`.** La pagina oggi dice, a riga 97: *"Sei il benvenuto in
qualsiasi lezione per conoscere maestri, bambini e ambiente. Niente prenotazione, basta presentarsi."*
Riguarda il **venire a guardare**, mentre la **prova in sella va concordata prima**: la distinzione
non è dichiarata da nessuna parte ed è una fonte di confusione diretta. Il copy va riscritto per
separare i due casi in modo esplicito.

Va inoltre aggiunto un valore dedicato in `MOTIVI` (`src/components/contatti/ContactForm.tsx:21`) e
la relativa chiave nel deep link `?motivo=` (`motivoFromKey`, riga 28), oggi limitati a *Scuola di
Ciclismo*, *Tesseramento Amatori*, *Marathon 209*, *Altro*.

---

## 8 · I tre eventi di settembre

**Due sono annunci, uno è una porta.**

| Evento | Data | Trattamento |
|---|---|---|
| Gara Giovanissimi su strada | 12 set 2026 | Annuncio nello slot ② |
| **Narni Sport Night** | 19 set 2026 | **Si sovrappone allo slot ①** |
| Gara Giovanissimi MTB | **3 ott 2026** | Annuncio nello slot ② |

> **La gara MTB è stata spostata dal 26 settembre al 3 ottobre** (comunicato il 6 agosto 2026, a
> disegno già approvato). **Nessuna modifica al codice**: le date vivono nei record Airtable dello
> slot ②, non nei componenti. È la prima verifica pratica del principio "il codice garantisce la
> presenza, Airtable modula l'enfasi" — ed è arrivata prima ancora che il codice esistesse.

Le due gare al Ciclodromo Renato Perona vanno **solo annunciate**: le iscrizioni passano dai canali
federali FCI tra società. **Nessun flusso di iscrizione da costruire**, nessuna pagina evento, nessuna
dipendenza dalle date lato codice.

**Narni non è il terzo evento.** Alla Sport Night il club allestisce un percorso di agilità per
bambini e **mette a disposizione le bici**: è la lezione di prova portata in centro città, senza
nemmeno la barriera dell'attrezzatura. Dall'1 al 19 settembre lo slot ① cambia contenuto — non si
aggiunge un quarto blocco — e il 20 rientra da solo:

```
slot ①   LA PROVA · IN CITTÀ                        (1 → 19 settembre)
         Il 19 settembre siamo alla Narni Sport Night con un percorso di
         agilità. Le bici le mettiamo noi.
```

Questa è la mossa che evita la bacheca: tre eventi ravvicinati non diventano tre blocchi, perché uno
dei tre **è** il messaggio permanente in una forma diversa.

---

## 9 · Destinazione di ogni CTA

| Superficie | Label | Destinazione | Nota |
|---|---|---|---|
| Hero, porta A | Prenota una prova | `/prova` | Nuova pagina |
| Hero, porta B | Iscrivi tuo figlio | `/portale/iscrizioni` | Invariata |
| Fascia, slot ① | Scrivi su WhatsApp | `wa.me` derivato | Link testuale |
| Fascia, slot ③ | Come funziona la Scuola | `/la-scuola` | Link testuale |
| NavBar | Iscrivi tuo figlio | `/portale/iscrizioni` | Invariata: è il chrome per chi ha già deciso e ha scrollato |
| `/la-scuola`, step 01 | Contattaci e prenota subito una prova | `/prova` | Oggi punta a `/contatti?motivo=scuola` |
| `/la-scuola`, `CtaScuola` | Prenota una prova + Iscrivi tuo figlio | `/prova`, `/portale/iscrizioni` | Allineare la gerarchia |
| `CtaFinale` | **invariata** | `/portale/iscrizioni` | **Vedi vincolo sotto** |

**Vincolo su `CtaFinale`.** Il componente è condiviso da tre pagine — `src/app/(public)/page.tsx`,
`/chi-siamo`, `/gli-amatori-triono` — quindi **non può parlare di bambini o di prova**: quel copy
comparirebbe in fondo alla pagina Amatori. Se in futuro si vuole differenziarlo, serve una prop
`variant` esplicita, non un'aggiunta al copy condiviso.

---

## 10 · Degrado

Il giorno dopo l'ultimo evento — qualunque sia la data, e le date si spostano — **nessuno deve
toccare niente**.

- Slot ② vuoto → la fascia torna a due slot, senza buchi visibili.
- Slot ① rientra da solo alla forma permanente il 20 settembre.
- Le porte, il claim e la fotografia non hanno date: non invecchiano.

Il meccanismo è quello già in uso in `src/lib/comunicazioni-hero.ts`: filtro per intervallo di date
(`VALIDO_DA` / `VALIDO_A`) valutato a ogni render, con ISR. Nessun contenuto a scadenza dipende dal
fatto che qualcuno si ricordi di spegnerlo — è il vincolo che deriva dal fatto che ad Airtable ci mette
mano solo il titolare, quando serve.

---

## 11 · Operatività

| Cosa | Dove vive | Perché |
|---|---|---|
| Le due porte, il claim, i prezzi d'ingresso | **Codice** | Devono essere permanenti e non poter sparire |
| Slot ① (la prova) | **Codice** | Idem: è la porta bassa, non può dipendere da un record |
| Slot ③ (allenamenti) | **Codice** | Cambia una volta l'anno, al cambio orario |
| Slot ② (eventi) | **Airtable**, auto-scadente per data | Contenuto a scadenza, gestibile senza deploy |
| Numero WhatsApp | **Airtable**, chiave `scuola-telefono` | Già gestito, riuso senza dati nuovi |
| Fondale vivo | **Airtable**, slot `home-hero` | Manopola già esistente (EVO-021), va preservata |
| Fotografia | **Codice**, `public/photos/scuola/` | Asset di marca, non contenuto editoriale |

**Costo di manutenzione introdotto:** un solo tipo di record nuovo, l'evento dello slot ②, con lo
stesso modello mentale (attivo + intervallo di date + priorità) di `Comunicazioni Hero`. Nessun
concetto nuovo da imparare per chi aggiorna.

---

## 12 · Conformità e criteri di accettazione

- **Un solo `<h1>`**, ed è il claim di marca. Da verificare in produzione, non solo in locale: oggi il
  vincolo non è rispettato.
- **Un solo fondale vivo per viewport**, trattato: soddisfatto dal video nel campo tipografico.
- **Budget prop su mobile:** una sola mascotte.
- **Zero prove sociali inventate.** Nessun numero, testimonianza, logo partner o claim di scarsità.
  Nessuna didascalia che asserisca un luogo non verificato.
- **WCAG 2.1 AA:** contrasti da misurare sui pixel del rendering reale, non stimati. Attenzione ai
  token `--stage-faint`, che falliscono AA su testo piccolo.
- **`prefers-reduced-motion`** rispettato su fondale e su qualsiasi transizione.
- **Alt text:** la fotografia veicola un messaggio, quindi `alt` descrittivo; le mascotte sono
  decorative, quindi `alt=""` + `aria-hidden`.
- **La piega va rimisurata** dopo l'aggiunta delle mascotte, con `scripts/dev-shot.mjs`, su 375×667,
  375×812, 390×844, 1280×720, 1440×900. Le misure della sintesi sono state prese **senza** le
  mascotte e senza il fondale nel campo sinistro.
- **Nota sullo strumento:** `scripts/dev-shot.mjs` **non ha** un controllo di `innerWidth`/`innerHeight`
  né un ritentativo — verificato. Chi misura non può assumere quella garanzia; se serve, va aggiunta.

---

## 13 · Cosa blocca l'implementazione

Tre punti, tutti fuori dal codice:

1. **Liberatoria della famiglia** del bambino ritratto nella fotografia.
2. **Verifica del luogo dello scatto.** Finché non è verificato, nessuna didascalia nomina il
   ciclodromo.
3. **Conferma che il numero `scuola-telefono` sia raggiungibile su WhatsApp.**

---

## 14 · Taglio in evolutive

**Prima evolutiva — sblocca il problema, non dipende da settembre.**
Pagina `/prova` con la consegna a WhatsApp · hero deterministica con le due porte, la fotografia e le
mascotte · fascia di regia che sostituisce `HomeTicker`, con **tutti e tre gli slot** · blocco «Cosa
mettiamo noi» in `SezioneScuola` · correzione del copy di `/contatti` e nuovo motivo nel form ·
emendamento a `PRODUCT.md` · correzione del commento stale in `HeroCampagne.tsx:31`.

**Perché lo slot ② è già qui.** Rendendo la hero deterministica, `HeroCampagne` smette di occupare il
primo viewport: se lo slot ② arrivasse dopo, i record di `Comunicazioni Hero` resterebbero orfani e la
campagna oggi attiva sparirebbe dal sito. Lo slot ② legge **la tabella che esiste già**, con l'admin
già costruito su `/portale/admin/comunicazioni` — nessuna tabella nuova, nessun concetto nuovo.

**Seconda evolutiva — lo strato stagionale.**
Sovrapposizione di Narni sullo slot ① nella finestra 1–19 settembre · eventuali affinamenti dei campi
evento se l'uso reale li richiede.

**Terza evolutiva — propagazione.**
Porta bassa su `/la-scuola` (step 01 e `CtaScuola`) · eventuale prop `variant` su `CtaFinale` ·
allineamento della gerarchia CTA sulle superfici rimanenti.

> **Numerazione da verificare prima di aprire i branch.** L'ultima nel repo è EVO-044, ma EVO-045
> risulta in corso nel vault. Controllare `evolutive/`, `git branch -a` e i PR aperti, perché un
> numero libero al branch può essere occupato da lavoro parallelo prima del merge.

---

## 15 · Rischi e trade-off accettati

**La piega è una promessa da difendere.** La garanzia che entrambe le porte stiano sopra la piega vale
finché la hero resta deterministica: basta reintrodurre lì dentro contenuto a lunghezza variabile
perché salti in silenzio. Va reso un controllo esplicito in checklist di merge. Rischio residuo reale.

**WhatsApp concentra il funnel su una persona sola**, senza coda né triage. Se funziona, il volume
aumenta la sera e nel weekend. Non esiste una mitigazione tecnica onesta a questo livello: va accettato
prima, non scoperto dopo. Se il volume diventa insostenibile, la risposta è organizzativa — un secondo
presidio — non un form che rialza l'attrito.

**Su mobile la fotografia non è nel primo viewport.** Trade-off scelto: a 375px le due porte valgono
più dell'immagine.

**Il registro misto va sorvegliato.** Fotografia documentaria e illustrazione 3D nello stesso viewport
funzionano se le mascotte leggono come props di palco agganciati al bordo inferiore, e falliscono se
leggono come adesivi. È una verifica da fare sullo schermo reale, non sulla carta.

**La porta bassa non porta iscrizioni immediate.** Allunga il funnel di un passo. La scommessa è che
un funnel a due passi con primo passo gratuito converta più del funnel a un passo che oggi respinge
chi non ha ancora visto il ciclodromo. È falsificabile: si misura il numero di richieste di prova
arrivate dal sito e la quota che diventa iscrizione.

---

## 16 · Riferimenti

- `docs/brainstorming-messaggio-home/BRIEF.md` — ricognizione iniziale
- `docs/brainstorming-messaggio-home/PROPOSTE.md` — le tre proposte concorrenti e la sintesi
- `docs/brainstorming-messaggio-home/VERDETTO.md` — valutazione in cieco, due giri
- `docs/brainstorming-messaggio-home/DECISIONI.md` — registro delle decisioni del committente
