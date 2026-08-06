# La porta bassa

### Architettura del messaggio della home di trionoracing.it

---

## 0 · Sintesi in mezza pagina

Oggi la home ha una sola porta, ed è la più alta che abbiamo: *Iscrivi tuo figlio*, ripetuta
quattro volte, verso un flusso che chiede account, anagrafica del genitore, dati del bambino,
foto, certificato medico e pagamento. Chi non ha mai visto il ciclodromo non è pronto per
quella porta. La mamma del brief non ha sbagliato: ha fatto l'unica cosa che il sito le
diceva di fare.

Questa proposta ribalta la gerarchia. **La lezione di prova diventa la CTA primaria assoluta
della home.** *Iscrivi tuo figlio* non sparisce: retrocede a porta secondaria, sempre a un
clic, presente in cinque punti della pagina, ma non è più il primo invito che un estraneo
riceve.

Tre mosse strutturali:

1. **La porta della prova è cablata in codice**, non su Airtable. Non può sparire per un flag
   dimenticato, non può invecchiare, non dipende da una tabella che qualcuno deve ricordarsi
   di aggiornare. Ha un indirizzo che si può dire a voce e stampare su un volantino:
   `trionoracing.it/prova`. Finisce su WhatsApp, che è il canale realmente presidiato.
2. **Le informazioni a scadenza escono dalla hero.** La hero è la superficie più costosa del
   sito: spenderla per contenuto che muore il 27 settembre è uno spreco. Le comunicazioni
   Airtable scendono in una bandella di regia sotto la hero e in una sezione dedicata a metà
   pagina, entrambe auto-scadenti per data, entrambe inesistenti quando vuote.
3. **Narni Sport Night non è un evento da annunciare: è un secondo ingresso della stessa
   porta.** È la lezione di prova portata in piazza, senza nemmeno la barriera della bici. La
   trattiamo come tale, con la stessa CTA gialla della hero.

Il costo che questa proposta introduce è dichiarato per intero nella sezione 13. Il punto in
cui è più fragile è dichiarato nella sezione 15, senza attenuanti.

---

## 1 · Tesi e principio guida

> **Tesi.** Per chi non ci conosce, il primo passo giusto non è iscriversi: è venire a
> provare. La home si riorganizza attorno a questo, e *Iscrivi tuo figlio* diventa la porta
> di chi ha già deciso.

> **Principio guida operativo.** *La porta permanente vive in codice. Tutto ciò che ha una
> data vive su Airtable e si spegne da solo.* Nessun contenuto della home deve dipendere dal
> fatto che una persona si ricordi di spegnerlo, e nessun contenuto strutturale deve
> dipendere dal fatto che una persona si ricordi di accenderlo.

Il principio non è negoziabile perché deriva da un fatto accertato: il sito lo aggiorna una
persona sola, quando serve. Un sistema che chiede attenzione periodica a una persona sola
produce, prevedibilmente, esattamente il bug che il sito ha oggi — un ticker che annuncia un
evento del 28 giugno 2026, data ampiamente passata, perché nessuno l'ha spento.

---

## 2 · Perché la prova batte l'iscrizione come CTA primaria

### 2.1 In assenza di prove sociali, l'esperienza è l'unica prova che possiamo dare

`PRODUCT.md` è esplicito e onesto: *"Proof on hand: nessuna prova (testimonianze, numeri,
loghi partner) disponibile al momento."* Non abbiamo un numero di iscritti da mostrare, non
abbiamo la mamma che dice che si trova bene, non abbiamo un logo federale che faccia da
scorciatoia cognitiva.

Questo cambia tutto. Un sito che non ha prove sociali e chiede comunque un'iscrizione
completa sta chiedendo un atto di fede. Ma noi **una prova ce l'abbiamo, ed è la migliore
possibile: novanta minuti al ciclodromo.** Un genitore che porta il figlio a una lezione di
prova sale tutti e tre i gradini della belief ladder in un pomeriggio: vede il ciclodromo
chiuso al traffico e i caschi allacciati (*Sicurezza*), vede un maestro federale che lavora
su equilibrio e frenata con un gruppo piccolo (*Metodo*), vede gli altri bambini e gli altri
genitori a bordo pista (*Community*). Nessuna quantità di copy fa quel lavoro.

Quindi: **la prova non è una concessione al genitore indeciso, è il nostro unico asset di
prova disponibile.** Metterla come CTA primaria non è un compromesso al ribasso: è l'unica
mossa coerente con il nostro stato di fatto dichiarato.

### 2.2 Il funnel che funziona già è quello che la home non replica

Fatto accertato: oggi le richieste di prova arrivano quasi solo da passaparola e incontri di
persona, non dal sito. Letto bene, questo dice due cose.

La prima è che **il sito non sta convertendo**: sta al massimo raccogliendo chi era già
convinto altrove e cercava il modulo. La seconda, più importante, è che **il percorso che
funziona nella realtà è persona → prova → iscrizione**, e la home ne salta i primi due terzi.
Il sito oggi compete con un funnel che non esiste (estraneo → iscrizione diretta) invece di
mettersi dentro quello che già funziona.

Rendere la prova la CTA primaria significa smettere di chiedere al sito di fare un lavoro che
non ha mai fatto, e chiedergli invece di fare la cosa che il passaparola fa già bene, su
scala più grande e ventiquattr'ore al giorno.

### 2.3 La belief ladder non è un'opinione: è nel documento di brand

`PRODUCT.md` dichiara la scala **Sicurezza → Metodo → Community → Azione**, e aggiunge:
*"solo allora l'iscrizione diventa un passo naturale"*. Fra i Design Principles scrive:
*"per il pubblico genitori, ogni pagina che precede una CTA deve prima rassicurare, mai
vendere a freddo."*

La home oggi mette l'azione più impegnativa nel primo viewport, prima di qualunque
rassicurazione. Non è un difetto di esecuzione: è una contraddizione fra due parti dello
stesso documento.

### 2.4 Contraddico `PRODUCT.md`, apertamente

`PRODUCT.md` dice, in *Conversion & proof*: **"Primary CTA: Iscriviti alla scuola."** Questa
proposta la contraddice. Lo dico apertamente e argomento perché il documento va emendato.

**Primo**, la riga è in tensione interna con il resto del documento, come mostrato sopra. Non
sto contraddicendo il brand: sto risolvendo una contraddizione del documento a favore della
parte che è argomentata (la belief ladder ha una motivazione scritta; la riga *Primary CTA*
no).

**Secondo**, quella riga descriveva lo stato del sito più che una scelta difesa. È
un'osservazione promossa a regola: la home aveva quattro CTA *Iscrivi tuo figlio*, quindi il
documento ha registrato che la CTA primaria era quella. La ricognizione che ha innescato
questo lavoro dimostra che quello stato produce il comportamento sbagliato.

**Terzo, e decisivo**: la riga confonde *obiettivo* e *CTA*. Su questo `PRODUCT.md` ha
perfettamente ragione e non lo tocco — *"Il sito pubblico esiste per far crescere le
iscrizioni"*, e l'obiettivo resta l'iscrizione. Ma **l'obiettivo primario non è
automaticamente la CTA primaria.** Un funnel a due passi con un primo passo ad attrito quasi
nullo converte più iscrizioni di un funnel a un passo ad attrito alto, soprattutto quando il
primo passo *è* l'esperienza che vende il secondo.

**Emendamento proposto a `PRODUCT.md`, sezione *Conversion & proof*:**

```
- Primary CTA: Prenota una lezione di prova gratuita
- Secondary CTA: Iscrivi tuo figlio (per chi ha già deciso — sempre a un clic,
  mai la prima cosa che vede un estraneo)
- Tertiary CTA: Scopri la scuola / Chi siamo
- Nota: l'obiettivo di business resta l'iscrizione. La prova è il primo passo
  del percorso verso l'iscrizione, non un obiettivo alternativo.
- La riga che un visitatore deve ricordare dopo 10 secondi: "Qui i bambini
  iniziano in sicurezza, e chi cresce può diventare atleta della squadra —
  e si può venire a provare prima di decidere."
```

Se il committente non accetta l'emendamento, questa proposta non va implementata a metà: il
disallineamento fra documento di brand e prodotto è peggio di entrambe le opzioni pure.

---

## 3 · Cosa ho riverificato nel codice, e cosa ho trovato

Il brief chiede di non fidarsi del brief. Ecco cosa è confermato e cosa è emerso in più.

**Confermato**

- Le quattro CTA *Iscrivi tuo figlio* → `/portale/iscrizioni` esistono esattamente dove
  indicato: `HomeHero.tsx:70`, `SezioneScuola.tsx:124`, `CtaFinale.tsx:43`,
  `ApexNavBar.tsx:79` (+ drawer mobile, riga 156). La parola "prova" non compare mai in
  `src/components/home/`.
- La prova vive solo in fondo a `/la-scuola`: `SezioneComeIscriversi.tsx` step 01 con link
  testuale soft (`LinkProva`, riga 253 → `/contatti?motivo=scuola`) e `CtaScuola.tsx` riga 42
  nel paragrafo, non nei bottoni.
- `ContactForm.tsx` ha quattro `MOTIVI`, nessuno dedicato alla prova; lo stesso enum è
  ripetuto nello `z.enum` di `src/app/api/contatti/route.ts`.
- **Non esiste alcun `wa.me` nel sorgente.** Grep su tutto `src/`: zero occorrenze.
- Il numero è su Airtable (`Impostazioni Sito`, chiave `scuola-telefono`) letto da
  `getSiteSettings()`, già usato da `CtaScuola` e `/contatti`.
- Orari e sede: martedì strada 17:00–18:30, giovedì MTB 17:00–18:30, Ciclodromo Renato
  Perona, Terni. Scuola dai 4 anni. Coerenti in `SezioneScuola.tsx`, `/contatti` e hero.

**Quattro cose emerse che il brief non diceva, e che contano**

1. **`/contatti` dice al genitore una cosa falsa.** La card *"Vieni a trovarci"*
   (`src/app/(public)/contatti/page.tsx`, riga 97) chiude con: *"Sei il benvenuto in
   qualsiasi lezione per conoscere maestri, bambini e ambiente. **Niente prenotazione, basta
   presentarsi.**"* Questo contraddice frontalmente il fatto accertato che la prova va
   concordata prima. È il tipo di errore che non si vede in un audit di design e che
   distrugge una prova reale: il genitore si presenta, il maestro non lo aspetta, la prima
   impressione è pessima. **Va corretto a prescindere da quale proposta si sceglie.**

2. **L'`<h1>` della home non è il claim brand, quando ci sono campagne attive.** Il vincolo
   del brief dice *"un solo `<h1>` in home, il claim brand"*. Il codice fa altro:
   `HeroCampagne.tsx:253` assegna il tag `h1` al titolo della **prima comunicazione
   Airtable**, e il claim *"In bici, sicuri, insieme."* scende a `<p>` (riga 240–243). Questo
   significa che oggi **l'`<h1>` della homepage è editabile da Airtable e cambia in base a
   cosa è attivo.** Se domani la prima slide è "Gara Giovanissimi 12 settembre", quello
   diventa il titolo semantico della home. È fragile per la SEO e semanticamente sbagliato.
   Questa proposta lo corregge riportando l'`<h1>` in codice, stabile.

3. **Il ticker della home contiene una data passata.** `HomeTicker.tsx:11`:
   `Marathon MTB 209 · 28 GIU 2026`. Hardcoded, quindi invecchia e richiede un deploy per
   cambiare. È la dimostrazione empirica del principio guida della sezione 1.

4. **Dettagli minori, ma da sistemare toccando quei file**:
   `HeroCampagne` usa `<a href>` (righe 284 e 289) invece di `next/link` per CTA che puntano
   a route interne → ricaricamento completo della pagina invece di navigazione client;
   il sottotitolo delle slide ha `line-clamp-2` (riga 277) → un testo Airtable di tre righe
   viene troncato in silenzio senza che l'admin lo sappia;
   `SezioneScuola.tsx:78` marca `priority` su una foto che sta sotto la piega, sprecando
   priorità di caricamento a scapito della hero.

---

## 4 · Mappa dei quattro pubblici

### A · Genitore curioso — il pubblico primario

| | |
|---|---|
| **Cosa cerca** | "Posso far provare mio figlio senza impegnarmi in nulla?" |
| **Dove atterra** | Home (organico, passaparola, QR/volantino di Narni) |
| **La sua porta** | CTA gialla piena in hero, primo viewport |
| **Come la riconosce** | È l'unico elemento giallo pieno del viewport, dice *Prenota una prova*, e sotto ha una riga che dice cosa serve e come rispondiamo |
| **Clic all'obiettivo** | **1 clic** → `/prova`; **2 clic** → WhatsApp con messaggio già scritto. Oppure **1 clic** diretto su WhatsApp dalla sezione Prova (secondo schermo) |
| **Momenti di dubbio** | Nessuno prima del clic: le tre obiezioni (costa? serve una bici da corsa? devo iscrivermi?) sono disinnescate nel sottotitolo e nel microcopy della hero |
| **Oggi** | Zero porte. Deve intuire che *Contattaci* sia la strada, e se ci arriva legge "rispondiamo entro 2–3 giorni" e "basta presentarsi" (falso) |

### B · Genitore già deciso

| | |
|---|---|
| **Cosa cerca** | "Come iscrivo mio figlio" |
| **Dove atterra** | Home o `/la-scuola`, con intento già formato |
| **La sua porta** | CTA ghost *Iscrivi tuo figlio* accanto alla primaria, in hero |
| **Come la riconosce** | Seconda CTA della hero, label identica a quella che conosce; poi la ritrova nella card *Quando/Dove* della sezione Scuola, nella CTA finale, nel drawer mobile e nel footer |
| **Clic all'obiettivo** | **1 clic** dalla hero → `/portale/iscrizioni`. Identico a oggi |
| **Cosa perde** | La CTA in navbar desktop. Trade-off dichiarato in 15.1 |

### C · Società o famiglia interessata alle gare di settembre

| | |
|---|---|
| **Cosa cerca** | Date, luogo, categorie, come si iscrive |
| **Dove atterra** | Home (da Facebook, canali FCI, passaparola fra società) |
| **La sua porta** | Bandella avvisi al secondo schermo → sezione *Settembre al ciclodromo* |
| **Come la riconosce** | Pastiglie mono con la data in accento — il linguaggio APEX della telemetria, che l'occhio legge come "dato", non come "pubblicità" |
| **Clic all'obiettivo** | **0 clic** se scrolla, **1 clic** dalla bandella all'ancora `#settembre`. L'informazione che gli serve (data, luogo, categoria, *"le iscrizioni passano dalle società tramite i canali federali FCI"*) è **da leggere, non da cliccare** — nessun flusso da costruire, com'è giusto |
| **Se ha dubbi** | CTA ghost → `/contatti` con motivo dedicato |

### D · Amatore o agonista

| | |
|---|---|
| **Cosa cerca** | Livello della squadra, gare, come entrare |
| **Dove atterra** | Home o direttamente `/gli-amatori-triono` |
| **La sua porta** | Voce *Amatori* in navbar (invariata) + sezione Amatori + sezione Marathon |
| **Clic all'obiettivo** | **1 clic** dalla navbar. Invariato |
| **Cosa cambia per lui** | Nulla. Questa proposta non tocca una riga del suo percorso |

**Sul principio "due pubblici senza gerarchia".** La mia tesi mette una CTA della Scuola come
primaria della home, e questo sembra creare una gerarchia fra i pubblici. Non è così: la
gerarchia riguarda **le CTA della home**, non i pubblici. La home ha oggi quattro CTA di
scuola e zero di squadra, e le sezioni sono già ordinate Scuola → Amatori → Marathon. La
gerarchia esiste già: io la rendo solo efficace. L'atleta non ha mai avuto una CTA in home
perché non ne ha bisogno — il suo percorso è navbar → pagina → contatti, ed è intatto.

---

## 5 · Wireframe desktop, schermo per schermo

Viewport di riferimento 1440×900.

### Schermo 1 — la porta *(0 → 100vh)*

```
┌──────────────────────────────────────────────────────────────────────┐
│ [logo]  Scuola Amatori Chi siamo Marathon Maestro Contatti           │  L+2 regia
│                                    [Area genitori] [PRENOTA UNA PROVA]│  sticky
├──────────────────────────────────────────────────────────────────────┤
│ ░░ fondale vivo (video Airtable slot home-hero, duotone racing) ░░    │  L−2
│                                                                       │
│    54 KM/H  (telemetria ghost, opacity .9)              ┌────────┐   │  L−1
│                                                          │  duo   │   │  L+1
│    In bici, sicuri, insieme. ───                        │mascotte│   │  (1 prop)
│    ▸ SCUOLA DI CICLISMO · TERNI · DAI 4 ANNI            │ancorato│   │
│                                                          │al bordo│   │
│    PRIMA DI ISCRIVERTI,                                 │inferiore│   │
│    VIENI A ᴘʀᴏᴠᴀʀᴇ.                    ← h1, "provare"  │        │   │  L0
│                                           in giallo      └────────┘   │  PISTA
│    Scuola di Ciclismo Triono, al Ciclodromo Perona di                │
│    Terni, dai 4 anni in su. Fino a due lezioni gratuite:             │
│    martedì su strada, giovedì in mountain bike.                      │
│                                                                       │
│    ▰▰ PRENOTA UNA PROVA →      ▱▱ ISCRIVI TUO FIGLIO                │
│       (giallo pieno)              (ghost)                            │
│                                                                       │
│    Serve solo una bici qualsiasi e il casco · Ti rispondiamo          │
│    su WhatsApp                                                        │
│    ╌╌╌ waveform (L−1, min(420px,38vw)) ╌╌╌                           │
└──────────────────────────────────────────────────────────────────────┘
```

Rispetto a oggi: **spariscono dal primo viewport** le quattro celle HUD (11 anni di squadra,
5 maestri, 4 anni di scuola, 6 edizioni 209) e — quando ci sono campagne attive — la barra
dei controlli del carosello e la striscia "altre slide in rotazione". Le stats non aiutano il
genitore a decidere se venire a provare; scendono nel ticker e nella pagina *Chi siamo*, dove
sono già a casa loro.

### Schermo 1.5 — la regia *(~100 → 118vh)*

```
├──────────────────────────────────────────────────────────────────────┤
│ SCUOLA · DAI 4 ANNI / PROVA GRATUITA · FINO A 2 LEZIONI / MARTEDÌ    │  ticker
│ STRADA · GIOVEDÌ MTB / DALLA SCUOLA ALLA SQUADRA · UN SOLO PERCORSO  │  (nessuna data)
├──────────────────────────────────────────────────────────────────────┤
│ IN PROGRAMMA  │ [12 SET] Gara strada Giovanissimi →  │ [19 SET] Narni│  bandella
│               │ Sport Night → │ [26 SET] Gara MTB Giovanissimi →     │  (Airtable)
└──────────────────────────────────────────────────────────────────────┘
```

La bandella è **condizionale**: se `getComunicazioniHeroAttive()` ritorna un array vuoto, il
componente non renderizza — niente contenitore, niente bordo, niente titolo orfano.

### Schermo 2 — la prova *(livrea Scuola, giallo/arancio, card calde avorio)*

```
├──────────────────────────────────────────────────────────────────────┤
│  ▸ Prima di decidere                                                  │
│  VENITE A ᴘʀᴏᴠᴀʀᴇ. POI DECIDETE CON CALMA.                          │
│  Fino a due lezioni gratuite, su entrambi i corsi. Si concorda        │
│  prima, così il maestro vi aspetta.                                   │
│                                                                        │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐    ┌────────┐ │
│  │ COSA SERVE    │ │ QUANDO        │ │ COME SI FA    │    │ Nino   │ │
│  │ Una bici      │ │ Martedì su    │ │ Ci scrivi su  │    │ (1 prop│ │
│  │ qualsiasi e   │ │ strada,       │ │ WhatsApp,     │    │  L+1)  │ │
│  │ il casco...   │ │ giovedì MTB.. │ │ concordiamo.. │    └────────┘ │
│  └───────────────┘ └───────────────┘ └───────────────┘               │
│                                                                        │
│  ▰▰ SCRIVICI SU WHATSAPP →     ▱▱ COME FUNZIONA LA PROVA             │
│                                                                        │
│  Chi poi resta, cresce con noi: dalla scuola alla squadra.            │
└──────────────────────────────────────────────────────────────────────┘
```

Il salto cromatico da palco freddo (racing, ciano) a card calde avorio su giallo è
volutamente netto: **è la cosa che l'occhio trova per prima scrollando.**

### Schermi 3 → 8

| # | Sezione | Stato | Cambia |
|---|---|---|---|
| 3 | **Sezione Scuola** (`SezioneScuola`) | esistente | Solo le CTA in fondo: *Iscrivi tuo figlio* resta primaria qui — è il punto giusto, il genitore ha appena letto sicurezza/tecnica/spirito di squadra |
| 4 | **Come raggiungerci** (`ComeRaggiungerci`) | esistente | Invariata |
| 5 | **Settembre al ciclodromo** | **nuova, condizionale** | Tre card da Airtable, quella di Narni in evidenza. Sparisce da sola (§10, §12) |
| 6 | **Amatori** (`SezioneAmatori`) | esistente | Invariata |
| 7 | **Marathon 209** (`SezioneMarathon`) | esistente | Invariata |
| 8 | **CTA finale** (`CtaFinale`) | esistente | Ricablata: primaria = prova, ghost = iscrizione. Esce *Accedi all'area genitori* (già in navbar auth-aware e nel footer) |

**Nota di degrado costruttiva:** la sezione *Settembre* è collocata **dopo** *Come
raggiungerci* proprio perché, quando sparisce, la sequenza che resta — Scuola → Dove →
Amatori → Marathon → CTA — è **identica a quella di oggi**. Il 27 settembre la home non
cambia forma: torna alla sua forma naturale.

---

## 6 · Wireframe mobile 375px

```
┌───────────────────────────┐
│ [logo]              [≡]   │  60px  chrome
├───────────────────────────┤
│░ fondale vivo (1, hero) ░ │
│                            │
│ In bici, sicuri, insieme.  │  ~18px
│ ▸ SCUOLA DI CICLISMO ·     │  ~16px  kicker mono (una riga: 38 char
│   TERNI · DAI 4 ANNI       │          × ~8px ≈ 304px su 327 utili)
│                            │
│ PRIMA DI                   │
│ ISCRIVERTI,                │  ~200px h1, 4 righe
│ VIENI A                    │
│ ᴘʀᴏᴠᴀʀᴇ.                   │
│                            │
│ Scuola di Ciclismo Triono, │  ~90px  sottotitolo, 4 righe
│ al Ciclodromo Perona di    │
│ Terni, dai 4 anni in su.   │
│ Fino a due lezioni…        │
│                            │
│ ▰ PRENOTA UNA PROVA →   ▰ │  52px  full-width
│ ▱ ISCRIVI TUO FIGLIO    ▱ │  52px  full-width
│                            │
│ Serve solo una bici        │  ~32px microcopy, 2 righe
│ qualsiasi e il casco       │
│                            │
│    ░ mascotte dietro al    │  L+1, unico prop, ancorata a bottom-0,
│    ░ testo, velo navy      │  velo navy solo-mobile (pattern esistente)
└───────────────────────────┘  totale ≈ 560px + padding ≈ 660px
```

**Verifica altezza.** Su iPhone X (812px) meno navbar (60) restano 752px utili: **entrambe le
CTA stanno sopra la piega.** Su iPhone SE (667px) restano 607px: la CTA primaria è
comodamente sopra la piega, la secondaria arriva a filo. Accettabile — la gerarchia impone
che sia la primaria a essere garantita.

Sotto: ticker (invariato, marquee), bandella avvisi in **scroll orizzontale con snap**
(stesso pattern della galleria di `/la-scuola`, `tabIndex` e `aria-label` inclusi), poi
sezione Prova con le tre card impilate.

**Budget APEX su mobile rispettato**: 1 solo prop L+1 per sezione (hero: mascotte; Prova:
Nino; Scuola: Nino già `mobileHide`), niente mouse-parallax, L−1 ridotto al dominante (la
waveform è già `mobileHide` in `HeroCampagne`), **un solo fondale vivo per viewport** (hero e
`CtaFinale` sono agli estremi opposti della pagina).

---

## 7 · Densità: il conteggio, fatto per davvero

**Primo viewport desktop — elementi che competono per l'attenzione**

| | oggi *(con campagne attive)* | oggi *(hero statica)* | proposta |
|---|---|---|---|
| Titolo | 1 | 1 | 1 |
| Eyebrow / kicker | 2 (brand + campagna) | 1 | 2 (riga brand + kicker) |
| Paragrafo | 1 | 1 | 1 |
| CTA cliccabili | 2 | 2 | **2** |
| Controlli carosello | **5** (prev, play, dot ×N, next) | 0 | **0** |
| Card "altre slide" | **2** | 0 | **0** |
| Celle HUD | 0 | **4** | **0** |
| Microcopy di supporto | 0 | 0 | 1 |
| **Totale** | **13** | **9** | **7** |
| **di cui cliccabili** | **9** | **2** | **2** |
| **Messaggio stabile?** | **no** — cambia ogni 7s | sì | **sì** |

Il numero che conta non è 13 contro 7: è **9 elementi cliccabili contro 2**, e soprattutto il
fatto che oggi il messaggio principale della home **cambia ogni sette secondi**. Un genitore
che apre la pagina, legge, e torna con lo sguardo, trova un'altra cosa. Il limite già
annotato nel brief ("ogni slide resta visibile 7 secondi su 21") non è un limite
d'implementazione: è la ragione per cui una rotazione non può ospitare un messaggio
strutturale.

**Dove si rompe la mia hero.** Si rompe se qualcuno ci aggiunge un terzo bottone, o se il
sottotitolo supera le tre righe su desktop. Il punto di rottura è a **8 elementi / 3 CTA**:
oltre quella soglia, la CTA gialla smette di essere l'unico fuoco visivo e il viewport
diventa una scelta invece che un invito. Questo va scritto nel commento del componente, non
lasciato all'intuito di chi lo toccherà fra un anno.

---

## 8 · Copy della hero, parola per parola

### Riga brand — `<p>`, 15px semibold, con hairline

> **In bici, sicuri, insieme.**

Il claim resta, e resta nella stessa forma che ha oggi in `HeroCampagne` (riga 240): firma la
pagina, non la intitola. Zero equity di brand persa.

### Kicker — mono uppercase, tick accento corto

> **SCUOLA DI CICLISMO · TERNI · DAI 4 ANNI**

Fa il lavoro identitario e geografico che l'`<h1>` non farà più. 38 caratteri: entra su una
riga anche a 375px.

### `<h1>` — Archivo display, uppercase, unico della pagina

> **PRIMA DI ISCRIVERTI, VIENI A \*\*PROVARE\*\*.**

*(`**PROVARE**` in `accent-word`; su livrea racing è il ciano, e questo è voluto: il giallo
resta riservato alla CTA, così l'accento cromatico dell'azione non si diluisce nel titolo.)*

Trentasei caratteri, tre righe a `--fs-hero` su desktop, quattro su mobile: esattamente la
misura del display monumentale APEX (l'h1 attuale è su tre righe).

Perché questa frase e non il claim: è **rassicurante**, che è il tono che `PRODUCT.md` chiede
per i genitori (*"caldo, rassicurante, mai distaccato, quando ci si rivolge a chi decide per
un bambino"*). Toglie pressione invece di metterne. E dice la sola cosa che la mamma del
brief aveva bisogno di sentire, prima di aprire una procedura che non le serviva.

### Sottotitolo — `--fs-body-lg`, `max-w-[52ch]`

> **Scuola di Ciclismo Triono, al Ciclodromo Perona di Terni, dai 4 anni in su. Fino a due
> lezioni gratuite: martedì su strada, giovedì in mountain bike.**

Centoquarantanove caratteri, tre righe. Porta cinque informazioni verificate (chi, dove, età
minima, quante prove, quali giorni e discipline) senza un aggettivo di troppo. È il "denso di
informazione utile" del brief, e recupera in parte le keyword che l'`<h1>` non porta più.

### CTA primaria — variante `support` (giallo pieno)

> **`Prenota una prova`** → `/prova`

Diciassette caratteri: in mono uppercase con tracking APEX resta su una riga anche a 375px
full-width, quindi **nessun rischio di troncamento** (regola DS: truncation mai sulle CTA).
La parola *gratuita* non sta nel bottone perché lo allungherebbe oltre la soglia sicura su
mobile: sta nel sottotitolo, nel ticker e nella sezione Prova, tre volte nel primo schermo e
mezzo.

**Perché giallo, e perché è una scelta di sistema.** In livrea racing `--accent-2` è il giallo
`#F4E718`, cioè **lo stesso giallo che è `--accent` nella livrea Scuola**. Usando
`apex-cta--support` in hero, la CTA della prova è gialla dentro il palco racing e resta
gialla dentro la sezione Scuola (dove sarà `--primary`) e su `/prova` e su `/la-scuola`.
Risultato: **il giallo diventa il colore della porta della prova in tutto il sito**, a costo
zero di CSS e senza rompere la regola "un accento più un supporto per livrea". Contrasto sul
palco: **15.5 : 1**, il migliore di tutte le livree, AA e AAA con ampio margine.

### CTA secondaria — `ghost`

> **`Iscrivi tuo figlio`** → `/portale/iscrizioni`

Label identica a quella di oggi: chi la cerca la riconosce senza rileggere.

### Microcopy sotto le CTA — `apex-data`, `text-stage-muted`

> **Serve solo una bici qualsiasi e il casco · Ti rispondiamo su WhatsApp**

Disinnesca la barriera più concreta (*"non abbiamo una bici da corsa"*) e dichiara il canale,
il che imposta l'aspettativa giusta sul tempo di risposta — l'opposto del "rispondiamo entro
2–3 giorni" che `/contatti` promette oggi a chi vuole prenotare una lezione di martedì.

**Nota di accessibilità, non pignoleria:** `text-stage-muted` (#8A94B8, ~6.7:1) e **non**
`text-stage-faint` (#4A5480, ~2.7:1, che fallisce AA su testo piccolo). E attenzione: se
questa riga finisse dentro un elemento `.apex-data` con lo span figlio colorato, la regola
CSS unlayered non protegge il figlio. Colore esplicito sull'elemento che porta il testo.

### Variante di sottotitolo se si vuole difendere la SEO più a fondo

> **La Scuola di Ciclismo di Triono Racing, a Terni, per bambini dai 4 anni. Fino a due
> lezioni di prova gratuite al Ciclodromo Renato Perona: martedì su strada, giovedì in
> mountain bike.**

Più lunga (quattro righe su mobile), più keyword-densa. Da usare solo se dopo il rilascio si
vede un calo di posizionamento sulle query locali.

---

## 9 · La porta: `/prova`, WhatsApp, e il form come rete

### 9.1 Perché una pagina e non solo un link WhatsApp

Un bottone che apre direttamente WhatsApp da un sito che non conosci è un salto di intimità
troppo grande: stai dando il tuo numero prima di sapere cosa succederà. Serve uno schermo che
risponda alle cinque domande che bloccano un genitore — *quanto costa, quante volte, quale
giorno, cosa devo portare, cosa succede quando arrivo* — e che finisca su WhatsApp.

E serve un indirizzo. **`trionoracing.it/prova` si dice a voce, si stampa su un volantino, si
mette in un QR.** Per Narni Sport Night questo non è un dettaglio: è l'infrastruttura.

### 9.2 Struttura di `/prova`

Route `src/app/(public)/prova/page.tsx`, livrea **Scuola**, `revalidate = 300`.

1. **Hero corta** — `<h1>` "Vieni a provare. Poi decidete." *(l'`<h1>` unico è un vincolo per
   pagina, non per sito)*
2. **Cosa serve** — due tessere: *una bici qualsiasi* · *il casco*. Niente altro, perché
   niente altro è verificato. Chiusura: *"Hai un dubbio? Scrivicelo."*
3. **Come funziona** — tre passi: 1) ci scrivi su WhatsApp · 2) concordiamo insieme il giorno
   · 3) vieni e provi. Con: *fino a due lezioni, valide su entrambi i corsi.*
4. **Quando e dove** — martedì strada, giovedì MTB, 17:00–18:30, Ciclodromo Renato Perona,
   Terni. Link alla mappa già esistente (`/#come-raggiungerci`).
5. **Blocco condizionale Narni** *(auto-scadente, §10)*
6. **Chiusura** — WhatsApp primario, form `/contatti?motivo=prova` come alternativa
   **visibile** (non nascosta in un accordion), telefono da Airtable.
7. **Riga bassa** — *"Hai già deciso? Vai direttamente all'iscrizione →"*

Costi: `sitemap.ts`, `metadata` con canonical, immagine OG. Tutti in codice, tutti una volta
sola.

### 9.3 WhatsApp: come derivo il numero

Il numero **non viene hardcoded da nessuna parte**. È già su Airtable, tabella
`Impostazioni Sito`, chiave `scuola-telefono`, letto da `getSiteSettings()`. Aggiungo a
`src/lib/site-settings.ts` un helper gemello di `phoneHref`:

```ts
/** wa.me vuole E.164 senza "+": "3292040821" → "393292040821". */
whatsappHref(raw: string, text?: string): string
```

Se il titolare cambia numero su Airtable, cambia anche WhatsApp, in cinque minuti, senza
deploy. **Zero manutenzione aggiuntiva rispetto a oggi.**

**Degrado.** Se `scuola-telefono` manca (env assente in preview, Airtable giù), `getSiteSettings()`
ritorna `{}` — è già SAFE — e il bottone WhatsApp **semplicemente non renderizza**: al suo
posto resta la CTA verso il form. Mai un `wa.me/undefined`. Su desktop senza app installata,
`wa.me` apre WhatsApp Web: non è un vicolo cieco, ma il form resta comunque visibile accanto.

### 9.4 Il messaggio precompilato

Corto, perché un testo lungo si legge come un modulo e la gente lo cancella:

- **Da hero, `/prova`, CTA finale:**
  `Ciao! Vorrei prenotare una lezione di prova per mio figlio/a alla Scuola di Ciclismo Triono.`
- **Dalla card Narni:**
  `Ciao! Ho visto Narni Sport Night, vorrei sapere come funziona la lezione di prova.`
- **Da `/la-scuola`:**
  `Ciao! Ho letto la pagina della Scuola e vorrei prenotare una lezione di prova.`

Il resto (età del bambino, giorno preferito) lo chiede il titolare in chat, che è più veloce
e più umano di un form.

**Beneficio nascosto ma reale:** i tre testi diversi danno **attribuzione di canale a costo
zero**. Per un club senza analytics configurate, contare quanti messaggi arrivano con ciascun
testo è l'unico modo onesto di sapere se il sito ha davvero aperto il canale che oggi, per
ammissione, non porta nulla. Vedi §16.

### 9.5 Il form contatti

Nuovo motivo **`Lezione di prova`** (e, opzionale, **`Gare Giovanissimi`**), con deep link
`?motivo=prova`. **Costo dichiarato:** il valore va aggiunto in tre punti — `MOTIVI` in
`ContactForm.tsx`, `z.enum` in `api/contatti/route.ts`, e la singleSelect `CONTATTI.MOTIVO`
su Airtable **PROD e DEV** — altrimenti Airtable risponde 422
`INVALID_MULTIPLE_CHOICE_OPTIONS`, errore già visto su questo repo.

Il form **non è la porta primaria** proprio perché `/contatti` promette risposta in 2–3
giorni: è un tempo corretto per una richiesta generica e letale per prenotare una lezione che
si tiene fra due giorni.

---

## 10 · I tre eventi di settembre

### 10.1 Perché non stanno in hero

Tre ragioni, in ordine di forza.

1. **Costo opportunità.** La hero è la superficie più costosa del sito. Metterci contenuto che
   muore fra sette settimane significa spendere un asset permanente per un contenuto
   temporaneo — e riprendersi quello spazio a fine settembre richiede un intervento umano che
   il principio guida vieta di presupporre.
2. **Non sono call to action.** Due dei tre eventi non hanno un flusso: le iscrizioni alle
   gare passano dai canali federali FCI fra società. Per il pubblico primario (genitori) non
   sono un invito ad agire, sono **prova di serietà organizzativa**. Una prova di serietà non
   va in hero, va dove serve a sostenere una decisione.
3. **La rotazione è il posto sbagliato per un messaggio importante.** Con tre slide ognuna è
   visibile un terzo del tempo, e chi non era già lì non la legge mai. Peggio: mescolare la
   porta della prova con tre eventi in rotazione significa che due volte su tre chi apre la
   home non vede la porta.

### 10.2 Dove stanno, e con che peso

**Livello 1 — Bandella avvisi** *(secondo schermo, sotto il ticker)*
Tre pastiglie mono orizzontali: `[12 SET] Gara strada Giovanissimi →`. Fascia di ~90px, non
una sezione. È il **linguaggio della regia broadcast**, che è precisamente il posto in cui una
bacheca ha diritto di esistere nel sistema APEX: nel chrome, non sulla pista. Le pastiglie
puntano all'ancora `#settembre`. Su mobile: scroll orizzontale con snap.

**Livello 2 — Sezione *Settembre al ciclodromo*** *(dopo Come raggiungerci)*

```
▸ Settembre
A SETTEMBRE CI VEDIAMO.

┌──────────────────┐  ┏━━━━━━━━━━━━━━━━━━┓  ┌──────────────────┐
│ 12 SETTEMBRE     │  ┃ 19 SETTEMBRE     ┃  │ 26 SETTEMBRE     │
│ Gara su strada   │  ┃ Narni Sport Night┃  │ Gara di mountain │
│ Giovanissimi     │  ┃                  ┃  │ bike Giovanissimi│
│                  │  ┃ Portiamo la      ┃  │                  │
│ La organizziamo  │  ┃ scuola in centro:┃  │ La organizziamo  │
│ noi, al Ciclo-   │  ┃ percorso di      ┃  │ noi, al Ciclo-   │
│ dromo Renato     │  ┃ agilità e le     ┃  │ dromo Renato     │
│ Perona. Le       │  ┃ nostre bici. Tuo ┃  │ Perona. Le       │
│ iscrizioni       │  ┃ figlio prova     ┃  │ iscrizioni       │
│ passano dalle    │  ┃ senza portare    ┃  │ passano dalle    │
│ società tramite  │  ┃ niente. È la     ┃  │ società tramite  │
│ i canali FCI.    │  ┃ stessa lezione   ┃  │ i canali FCI.    │
│                  │  ┃ di prova, in     ┃  │                  │
│ ▱ Informazioni   │  ┃ piazza.          ┃  │ ▱ Informazioni   │
└──────────────────┘  ┃                  ┃  └──────────────────┘
   sobria, ghost      ┃ ▰ PRENOTA UNA    ┃     sobria, ghost
                      ┃   PROVA →        ┃
                      ┗━━━━━━━━━━━━━━━━━━┛
                         gialla, in evidenza
```

Le due gare stanno ai lati, sobrie, bordo hairline, nessun bottone pieno: sono **credibilità**.
Narni sta al centro, gialla, con l'unica CTA piena: è **conversione**. Il peso relativo è la
risposta al "come si annunciano senza diventare bacheca".

### 10.3 Narni è la prova, portata in piazza

Questa è la mossa che tiene insieme la tesi e il calendario.

A Narni Sport Night allestiamo un percorso di agilità e **mettiamo a disposizione le bici**. Un
bambino ci sale senza portare niente, e il genitore vede una parte reale della didattica. È
**la lezione di prova, senza nemmeno la barriera dell'attrezzatura.** Non è un evento
collaterale da annunciare: è la stessa cosa che la home sta vendendo, in versione ancora più
facile.

Quindi:

- La card di Narni **usa la stessa CTA gialla della hero**, verso `/prova`. Chi è interessato
  ma il 19 non può, cade nella porta permanente invece di perdersi. Chi viene il 19 e poi
  vuole continuare ritrova al ciclodromo lo stesso bottone giallo che ha già visto sul sito.
- Su `/prova` compare, fino al 19 settembre, un blocco **"Oppure incontraci a Narni"**,
  alimentato dallo stesso record Airtable e quindi auto-scadente.
- A Narni si distribuisce **un solo indirizzo**: `trionoracing.it/prova`. Il volantino non
  deve spiegare niente, perché la pagina lo fa.

Il risultato è che i tre eventi smettono di competere con la porta della prova: **due la
sostengono come prova di serietà, e uno la moltiplica.**

### 10.4 Da dove vengono i dati

Tutti e tre i record vivono nella tabella **`Comunicazioni Hero` già esistente**, senza
inventare una tabella Eventi. La mappatura dei campi attuali basta:

| campo | contenuto |
|---|---|
| `EYEBROW` | `12 SETTEMBRE 2026` |
| `TITOLO` | `Gara su strada Giovanissimi` |
| `SOTTOTITOLO` | il paragrafo della card |
| `CTA_LABEL` / `CTA_URL` | `Informazioni` → `/contatti?motivo=gare` |
| `VALIDO_DA` / `VALIDO_A` | `2026-08-20` / `2026-09-12` |
| `PRIORITA` | ordine nella bandella e nella sezione |
| `IMMAGINE_URL` | opzionale |

Bandella e sezione leggono **lo stesso array**, recuperato una volta sola nella page e passato
per props: nessun fetch aggiuntivo. La duplicazione è quella funzionale "indice → contenuto",
non ridondanza.

---

## 11 · Destinazione di ogni CTA, superficie per superficie

### Home

| Superficie | Label esatta | URL esatto | Variante |
|---|---|---|---|
| NavBar desktop | `Prenota una prova` | `/prova` | primary (giallo) |
| NavBar desktop | `Area genitori` | `/portale` se loggato, `/portale/login` altrimenti *(auth-aware già implementato)* | ghost sm |
| Drawer mobile (fondo) | `Prenota una prova` | `/prova` | primary |
| Drawer mobile | `Iscrivi tuo figlio` | `/portale/iscrizioni` | ghost |
| Drawer mobile | `Area genitori` | come sopra | ghost |
| Hero | `Prenota una prova` | `/prova` | **support (giallo)** |
| Hero | `Iscrivi tuo figlio` | `/portale/iscrizioni` | ghost |
| Bandella avvisi | *titolo dell'avviso* | `/#settembre` | pastiglia mono |
| Sezione Prova | `Scrivici su WhatsApp` | `wa.me/…?text=…` *(§9.3–9.4)* | primary |
| Sezione Prova | `Come funziona la prova` | `/prova` | ghost |
| Sezione Scuola | `Iscrivi tuo figlio` | `/portale/iscrizioni` | primary |
| Sezione Scuola | `Scopri di più sulla Scuola` | `/la-scuola` | ghost |
| Settembre · card gare ×2 | `Informazioni` | `/contatti?motivo=gare` | ghost |
| Settembre · card Narni | `Prenota una prova` | `/prova` | support |
| CTA finale | `Prenota una prova` | `/prova` | primary |
| CTA finale | `Iscrivi tuo figlio` | `/portale/iscrizioni` | ghost |
| Footer | `Prova gratuita` · `Iscrizioni` · `Area genitori` | `/prova` · `/portale/iscrizioni` · `/portale` | link |

### `/la-scuola`

| Superficie | Oggi | Proposta |
|---|---|---|
| `SezioneComeIscriversi`, step 01 | link testuale soft → `/contatti?motivo=scuola` | **CTA gialla piccola** (`apex-cta--support apex-cta--sm`) `Prenota una prova` → **`/prova`** |
| `CtaScuola`, eyebrow | `ISCRIZIONI APERTE` | `PRIMA DI DECIDERE` |
| `CtaScuola`, bottoni | `Iscrivi tuo figlio` / `Scrivici` (mailto) / `Chiama` | `Prenota una prova` (support) / `Iscrivi tuo figlio` (ghost) / `Chiama NNN NNN NNNN` (ghost, da Airtable). *Scrivici* scende a link testuale sotto |

### `/contatti`

| Cosa | Proposta |
|---|---|
| `MOTIVI` | + `Lezione di prova`, + `Gare Giovanissimi` *(secondo opzionale)*, con `?motivo=prova` / `?motivo=gare` |
| Card *Vieni a trovarci* | **Correzione di verità obbligatoria.** Da *"Niente prenotazione, basta presentarsi"* a: *"Scrivici prima: concordiamo insieme il giorno, così il maestro sa che arrivate e vi accoglie."* |
| Blocco WhatsApp | Nuovo, accanto al telefono, stesso numero da `scuola-telefono` |

---

## 12 · Cosa succede il 27 settembre

| Elemento | Meccanismo | Risultato al 27/09 |
|---|---|---|
| Bandella avvisi | `isComunicazioneInCorso()` confronta `oggi` con `VALIDO_A` (già implementato, estremi inclusi) → array vuoto | **Il componente non renderizza.** Porta il proprio contenitore: niente bordo orfano, niente titolo senza contenuto |
| Sezione *Settembre* | Stesso array vuoto | **Non renderizza.** Le due sezioni adiacenti si toccano normalmente: in APEX ogni sezione porta il proprio `padding-block`, quindi non resta spazio vuoto |
| Blocco Narni su `/prova` | `VALIDO_A = 2026-09-19` | Sparisce |
| Ticker | **Nessuna data, per regola** | Invariato — non può invecchiare |
| Hero | Cablata in codice | Invariata |
| Sezione Prova | Cablata in codice | Invariata |
| CTA finale | Cablata in codice | Invariata |

**La forma della home al 27 settembre è: Hero → Ticker → Prova → Scuola → Dove → Amatori →
Marathon → CTA finale.** Cioè esattamente la sequenza di oggi con una sezione in più (la
Prova) e nessuna in meno. Non degrada con eleganza: **degrada nella sua forma naturale**, ed è
per questo che la sezione Settembre è collocata dopo *Come raggiungerci* e non altrove.

**Zero intervento umano richiesto.** Se il titolare non tocca Airtable per sei mesi, la home
resta corretta.

---

## 13 · Operatività e costi, dichiarati per intero

### Chi aggiorna cosa

| Contenuto | Dove vive | Chi | Frequenza | Serve deploy? |
|---|---|---|---|---|
| Messaggio della prova (h1, sottotitolo, CTA) | codice | dev | mai | sì, una volta |
| Numero WhatsApp e telefono | Airtable `Impostazioni Sito` → `scuola-telefono` | titolare | rarissima | **no** |
| Eventi e comunicazioni | Airtable `Comunicazioni Hero` | titolare | stagionale | **no** |
| Sfondi video hero/CTA | Airtable `Sfondi Video` | titolare | rara | **no** |
| Orari e sede | codice, in 3 punti | dev | ~annuale | **sì** ⚠ |
| Ticker | codice, senza date | dev | mai | non serve, per costruzione |

### Costi che questa proposta introduce, senza sconti

1. **Un campo nuovo su Airtable: `POSIZIONE`** (singleSelect `hero` | `avvisi`) sulla tabella
   `Comunicazioni Hero`, PROD **e** DEV, più l'opzione nel CRUD admin. Additivo e
   retro-compatibile: vuoto significa `avvisi`, quindi i record esistenti continuano a
   funzionare. Serve per lasciare al titolare la possibilità di promuovere una comunicazione
   **eccezionale** in hero — vedi il vincolo di sicurezza in §15.3.
2. **Due nuovi valori di `MOTIVO`**, da allineare in tre punti (form, `z.enum`, singleSelect
   Airtable PROD+DEV), pena 422 silenzioso.
3. **Una route nuova** `/prova` + voce in `sitemap.ts` + immagine OG.
4. **Orari e sede restano hardcoded in più punti** (hero, sezione Prova, `/prova`,
   `SezioneScuola`, `/contatti`). Cambiarli richiede un deploy.
   *Mitigazione raccomandata ma tagliabile:* portarli su `Impostazioni Sito` con le chiavi
   `scuola-orario-strada` e `scuola-orario-mtb`, riusando esattamente il pattern di
   `scuola-telefono`. Costo basso, beneficio reale se gli orari cambiano a stagione. Non è
   necessario alla tesi.
5. **Il sistema di rotazione della hero perde il palcoscenico.** `HeroCampagne` è una feature
   recente. Questa proposta **ne conserva integralmente la meccanica** — fetch SAFE,
   date-range, priorità, admin CRUD, `revalidatePath('/')`, rotazione accessibile con pausa,
   roving tabindex, `inert`, `prefers-reduced-motion` — e la ricolloca. Il lavoro su `lib/` e
   sull'admin non si butta: cambia il componente di presentazione. Va detto comunque, perché
   è una retrocessione di una scelta presa da poco.

### Costi che questa proposta elimina

- **Il ticker non può più invecchiare.** Regola dichiarata: *nessuna data nel ticker, mai.*
  Se una data deve stare lì, il ticker deve leggere Airtable — costo che scelgo di non pagare.
- **La hero non dipende più da Airtable per il suo messaggio principale.** Se Airtable è giù, o
  se qualcuno lascia attiva una comunicazione con una CTA sbagliata, la porta della prova c'è
  comunque. Oggi non è così.
- **L'`<h1>` della home smette di essere editabile per sbaglio** (§3.2).

---

## 14 · Coerenza con APEX e accessibilità

| Vincolo | Come è rispettato |
|---|---|
| Un solo fondale vivo per viewport | Hero e `CtaFinale` sono agli estremi opposti della pagina. La sezione Prova usa il fondale statico `apex-fondale--tessuto`, come `SezioneScuola` |
| Budget di un prop L+1 su mobile | Hero: mascotte. Prova: Nino. Scuola: Nino (già `mobileHide`). Settembre: nessuno. Mai due nello stesso viewport |
| Contenuto della pista sacro | Nessun prop tocca `<h1>`, sottotitolo o CTA: la mascotte in hero è ancorata a `bottom-0` a destra del contenitore centrato, con velo navy solo-mobile quando il testo le passa sopra (pattern già in uso). Zona di rispetto di almeno una riga attorno alla headline |
| Un accento + un supporto per livrea | La CTA gialla in hero usa `apex-cta--support`, che è `--accent-2` della livrea racing. Nessun colore nuovo, nessun CSS per-livrea nei componenti |
| Un solo `<h1>` in home | Riportato in codice sul titolo di pagina; le comunicazioni Airtable diventano `<h3>` nelle card. **Corregge il comportamento attuale**, che lo assegnava a un contenuto editabile |
| WCAG 2.1 AA | Giallo su palco 15.5:1, ciano 10.3:1. Microcopy in `text-stage-muted` (6.7:1), **mai** `text-stage-faint` (2.7:1, fallisce). Bandella con `aria-label`, `tabIndex` sul carosello orizzontale mobile, focus-visible ad anello accento |
| Navigazione da tastiera | Ordine di focus = ordine DOM (L0). La bandella è una lista di link reali, non un carosello: niente trappole di focus, niente rotazione da mettere in pausa |
| `prefers-reduced-motion` | **Migliora**: eliminando la rotazione della hero sparisce il caso d'uso più problematico (SC 2.2.2). Restano solo float dei prop e ticker, entrambi già fermi sotto reduced-motion |
| Alt text | La mascotte in hero è decorativa (`alt=""`, `aria-hidden`); le foto di sezione mantengono gli alt descrittivi esistenti |
| Nessuna prova sociale inventata | Zero numeri di iscritti, zero testimonianze, zero loghi. Le uniche cifre in pagina sono orari, età minima, numero di lezioni di prova e date degli eventi: tutte verificate |
| Nessun claim di scarsità | Nessun "posti limitati", nessun "affrettati". La leva è l'assenza di impegno, non la pressione |

---

## 15 · Rischi e trade-off, senza attenuanti

**15.1 — La navbar desktop perde `Iscrivi tuo figlio`.**
È il costo più concreto. Un genitore già deciso che arriva da mobile deve aprire il drawer o
scorrere. Non nascondo che è una perdita: due CTA in navbar sono il massimo prima che
diventino rumore, e ho scelto quale sacrificare. *Mitigazione:* cinque punti di atterraggio
per l'iscrizione (hero, sezione Scuola, CTA finale, drawer, footer) più tutta `/la-scuola`.
*Reversibilità:* reintrodurla come terza CTA compatta `apex-cta--sm` ghost è una riga di
codice, se dopo due mesi i dati dicono che serve.

**15.2 — Contraddico `PRODUCT.md` e chiedo di emendarlo.**
Se il committente non accetta l'emendamento della §2.4, questa proposta non va implementata a
metà. Un sito la cui CTA primaria contraddice il documento di brand è peggio di entrambe le
opzioni pure.

**15.3 — La retrocessione di `HeroCampagne` è il punto più fragile.**
È una feature costruita da poco appositamente per la hero, e le sto togliendo il palcoscenico.
Se il committente ci tiene, il campo `POSIZIONE=hero` la rimette in cima — ma in quel periodo
la CTA della prova scenderebbe sotto la piega e la tesi si indebolirebbe.
*Requisito, non opzione:* quando una comunicazione è in `POSIZIONE=hero`, il componente deve
comunque mantenere la **CTA gialla della prova come CTA secondaria fissa**, non sostituibile
da Airtable. Così la porta non sparisce mai, nemmeno per una svista dell'admin. Se questo
requisito non viene implementato, la tesi ha un buco per cui si può passare.

**15.4 — Se funziona, arrivano più messaggi.**
Il canale è presidiato da una persona sola, il titolare. Aprire una porta a bassa frizione su
un canale sincrono significa più messaggi da gestire, potenzialmente in orari scomodi. Non ho
una mitigazione tecnica onesta oltre al fatto che il testo precompilato è breve e già
qualificato. **Va accettato prima, non scoperto dopo.**

**15.5 — L'`<h1>` non è keyword-ricco.**
*"Prima di iscriverti, vieni a provare."* non contiene né "ciclismo" né "Terni". Le portano il
`<title>`, la description, il kicker e il sottotitolo. Rischio stimato basso ma reale: è una
scelta a favore della conversione. La variante di sottotitolo in §8 esiste apposta per
mitigarlo se serve.

**15.6 — Due CTA in hero possono ancora far esitare.**
Un genitore che non conosce la differenza fra "provare" e "iscriversi" potrebbe fermarsi a
scegliere. La gerarchia visiva è netta (giallo pieno contro ghost) e il sottotitolo racconta
la sequenza invece di proporre un bivio. Se emergesse esitazione, la ghost può degradare a
link testuale (*"Hai già deciso? Iscrivi tuo figlio →"*), riducendo ulteriormente il peso.
Anche questa è reversibile in una riga.

**15.7 — Non ho prove che funzioni.**
Il canale è nuovo: non posso promettere numeri e non ne invento. Quello che posso dire è che
il percorso attuale ha **una prova documentata di fallimento** — la mamma del brief — e zero
prove documentate di successo dal sito. Non è una garanzia, è un'asimmetria.

**15.8 — Il percorso scuola → squadra non passa nei primi dieci secondi.**
La riga di `PRODUCT.md` ha due metà, e la mia hero ne porta bene una sola: *"qui i bambini
iniziano in sicurezza"* sì, *"e chi cresce può diventare atleta della squadra"* no. Lo
dichiaro come limite, non lo nascondo. Lo compenso a due livelli — un item permanente nel
ticker (`DALLA SCUOLA ALLA SQUADRA · UN SOLO PERCORSO`, a un centesimo di scroll) e la riga di
chiusura della sezione Prova (*"Chi poi resta, cresce con noi: dalla scuola alla squadra"*) —
ma è un compenso parziale. Stipare anche quello nella hero la farebbe diventare la bacheca
che stiamo cercando di evitare.

---

## 16 · Come si misura se ho ragione

Una tesi che non si può falsificare non è una tesi. Tre misure, tutte a costo zero e tutte
disponibili al titolare senza strumenti nuovi:

1. **Messaggi WhatsApp con il testo precompilato**, nei primi 60 giorni. È attribuzione
   diretta: quei messaggi non esistevano prima. **Se sono zero, la tesi è sbagliata e va
   rivista, non difesa.**
2. **Rapporto prove concordate → iscrizioni**, sui contatti arrivati dal sito. Serve a
   verificare la premessa vera della proposta: che la prova converta meglio di una richiesta
   fredda.
3. **Iscrizioni dirette senza prova.** Se crollano, il costo della §15.1 (navbar) è più alto
   del previsto e va reintrodotta la CTA.

Se dopo 60 giorni la misura 1 è zero e la misura 3 è calata, questa proposta ha torto e il
modo corretto di procedere è tornare indietro, non aggiustare.

---

## 17 · La riga da ricordare

> **Il sito non deve convincere un genitore a iscrivere il figlio. Deve convincerlo a venire
> una volta. Al resto pensa il ciclodromo.**
