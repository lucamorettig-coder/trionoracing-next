# La porta si vede, e si vede cosa c'è dietro

Architettura definitiva del messaggio della home di trionoracing.it.
Sintesi di A (struttura), B (tesi), C (grammatica), più le tre correzioni chieste dal verdetto.

> **Nota di metodo.** Tutti i numeri di questo documento sono **misurati**, non calcolati: dev server
> locale, `scripts/dev-shot.mjs` (Chrome headless, CDP `Emulation.setDeviceMetricsOverride`), il primo
> viewport proposto costruito dentro la pagina viva con il CSS APEX reale, geometria letta da
> `getBoundingClientRect()`. I contrasti sono calcolati sui **pixel dello screenshot** (formula WCAG
> 2.1, pixel di sfondo peggiore sotto ogni blocco di testo), non stimati a occhio. Dove un numero è
> stimato, lo scrivo. Le condizioni di misura sono in §4.0.

---

## 1 · Tesi in una frase, e principio guida

> **Tesi.** `PRODUCT.md` dichiara che non abbiamo prove — niente testimonianze, niente numeri, niente
> loghi partner. **Ma una prova ce l'abbiamo, ed è la migliore possibile: novanta minuti al
> ciclodromo.** La home smette di chiedere un atto di fede e comincia a offrire l'unica prova che ha:
> due porte dichiarate a parole, e dietro la porta bassa una fotografia di quello che succede
> davvero.

Il paragrafo sopra è di B (§2.1) e lo prendo per intero, perché è il ragionamento che A non fa mai:
A instrada verso la prova senza argomentare *perché* la prova converta. La risposta è che un genitore
che porta il figlio a una lezione di prova sale tutti e tre i gradini della belief ladder in un
pomeriggio — vede il ciclodromo chiuso al traffico e i caschi allacciati (*Sicurezza*), vede un
maestro federale che lavora sull'equilibrio con un gruppo piccolo (*Metodo*), vede gli altri bambini
e gli altri genitori a bordo pista (*Community*). Nessuna quantità di copy fa quel lavoro. **La prova
non è una concessione al genitore indeciso: è il nostro unico asset di prova disponibile.**

E c'è un secondo fatto che chiude il ragionamento (B §2.2): oggi le richieste di prova arrivano quasi
solo dal passaparola. Cioè il percorso che funziona nella realtà è **persona → prova → iscrizione**, e
la home ne salta i primi due terzi. Il sito compete con un funnel che non esiste invece di mettersi
dentro quello che già funziona.

### Principio guida — tre orologi, tre proprietari

| Livello | Che cosa contiene | Chi lo scrive | Ogni quanto cambia |
|---|---|---|---|
| **Marca** (hero) | Chi siamo, per chi, dove, **le due porte** | Il codice | Mai |
| **Regia** (fascia sotto la hero) | La prova adesso, il prossimo appuntamento, gli orari | Codice + Airtable | Da sola |
| **Racconto** (sezioni) | Scuola, ciclodromo, amatori, Marathon | Il codice | Mai |

Da cui la regola operativa, che è la frase migliore di A e la tengo alla lettera:

> **Il codice garantisce la presenza. Airtable modula l'enfasi.**

E la sua gemella, che viene da C ed è quella che protegge dalla direzione opposta:

> **Il codice garantisce anche l'assenza.** Le porte sono un componente che *non ha la prop* per una
> terza CTA. Fra un anno non possono tornare quattro.

### Le quattro mosse strutturali

1. **La hero smette di ruotare e torna deterministica.** Oggi l'`<h1>` della home è il titolo della
   campagna Airtable attiva (`HeroCampagne.tsx:253`, `const TitleTag = i === 0 ? "h1" : "p"`; il
   commento a riga 31 dice il contrario ed è **stale**). Misurato adesso in locale: l'`<h1>` è
   *"Le iscrizioni sono aperte"*. Il claim di marca è degradato a `<p>` da 15px. Il vincolo "un solo
   `<h1>`, il claim brand" oggi **non è rispettato**: questa proposta lo ripristina. È anche la
   precondizione tecnica di tutto il resto: l'altezza del primo viewport si può garantire solo se il
   contenuto non dipende da quanti caratteri ha scritto l'amministratore.
2. **Due porte, dichiarate a parole** (C): non due intensità dello stesso atto, ma due domande con
   risposta ovvia, ognuna con il suo **prezzo d'ingresso** scritto sotto.
3. **Una fotografia vera nel primo viewport** (§3). È la mancanza che il verdetto ha giudicato
   decisiva: tutte e tre le proposte erano architetture dell'informazione, nessuna diceva che immagine
   si vede.
4. **Tutto ciò che ha una data scende nella fascia di regia**, che sostituisce il ticker morto —
   `HomeTicker.tsx:11` annuncia ancora `Marathon MTB 209 · 28 GIU 2026`, da sei settimane.

### Emendamento a `PRODUCT.md` — da decidere prima di costruire qualsiasi cosa

Prendo da B (§2.4) anche la parte scomoda: tutte e tre le proposte retrocedono *"Iscrivi tuo figlio"*
e solo B ha il coraggio di dire che questo contraddice il documento di brand. Il punto decisivo è che
la riga *"Primary CTA: Iscriviti alla scuola"* **confonde obiettivo e CTA**. Su `PRODUCT.md` ha
ragione e non lo tocco — *"il sito pubblico esiste per far crescere le iscrizioni"*, e l'obiettivo
resta l'iscrizione. Ma **l'obiettivo primario non è automaticamente la CTA primaria**: un funnel a due
passi con un primo passo ad attrito quasi nullo converte più iscrizioni di un funnel a un passo ad
attrito alto, soprattutto quando il primo passo *è* l'esperienza che vende il secondo.

Testo esatto dell'emendamento, sezione *Conversion & proof*:

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

Se il committente non accetta l'emendamento, **questa proposta non va implementata a metà**: un sito
la cui CTA primaria contraddice il documento di brand è peggio di entrambe le opzioni pure.

---

## 2 · Mappa dei casi d'uso

### ① Genitore curioso — il pubblico primario

| | |
|---|---|
| **Cosa cerca** | "Posso far provare mio figlio senza impegnarmi in niente?" |
| **Dove atterra** | `/` (organico, passaparola, QR di Narni) |
| **La sua porta** | **Porta A** nella hero: `Prenota una prova` → `/prova`. Scorciatoia: fascia slot ①, `Scrivi su WhatsApp` → `wa.me` |
| **Come la riconosce** | È l'unica superficie ciano piena del viewport, ed è preceduta da una domanda su di lui: *"Tuo figlio non ha mai provato?"*. Sotto il bottone c'è il prezzo d'ingresso: *"Fino a 2 lezioni, gratis · basta una bici qualsiasi e il casco"* |
| **Clic all'obiettivo** | **2** per la via informata (hero → `/prova` → WhatsApp, dove arriva sapendo chi risponde e cosa portare). **1** per la via veloce (fascia → WhatsApp) |
| **Momenti di dubbio** | Zero prima del clic: *costa?* → "gratis" nel prezzo e nel sottotitolo · *serve una bici da corsa?* → "una bici qualsiasi" · *devo iscrivermi?* → "senza iscriversi" nella fascia · *quando?* → fascia slot ③ |
| **Oggi** | Nessuna porta. La parola "prova" non compare in home nemmeno una volta |

### ② Genitore già deciso

| | |
|---|---|
| **Cosa cerca** | Il bottone di iscrizione, subito, senza leggere |
| **Dove atterra** | `/` o diretto su `/portale/iscrizioni` |
| **La sua porta** | **Porta B** nella hero (`Iscrivi tuo figlio`, giallo pieno) + navbar desktop + drawer mobile |
| **Come la riconosce** | Stessa geometria di porta A, stesso rango tipografico, **tinta diversa**: la porta bassa è sempre `primary` (ciano), la porta alta sempre `support` (giallo). Due porte, due tinte, nessuna ambiguità |
| **Clic all'obiettivo** | **1**, da qualunque pagina |
| **Cosa guadagna** | Il prezzo d'ingresso dichiarato *prima* del wizard: *"Tutto online · foto e certificato medico"*. Chi non ha il certificato scopre in due secondi che oggi la sua porta è la A, invece di sbatterci contro a metà procedura |

### ③ Società / famiglia interessata alle gare di settembre

| | |
|---|---|
| **Cosa cerca** | Data, disciplina, luogo, e **come ci si iscrive** |
| **Dove atterra** | `/` (ricerca locale, canali FCI, passaparola tra società) |
| **La sua porta** | Fascia slot ②, `IN PROGRAMMA` |
| **Come la riconosce** | È l'unico blocco della home con una data in evidenza, in mono, nel linguaggio della telemetria: l'occhio lo legge come *dato*, non come *pubblicità* |
| **Clic all'obiettivo** | **0.** La risposta *è* lo slot: `12 set · Giovanissimi su strada` / `Ciclodromo Renato Perona, Terni · iscrizioni tramite le società, sui canali FCI`. **1** solo se esiste un URL reale (locandina, pagina federale) messo su Airtable |
| **Effetto voluto** | La riga "iscrizioni tramite le società" impedisce alle famiglie di confondere la gara con l'iscrizione alla scuola: protegge la porta della prova dal traffico sbagliato |

### ④ Amatore / agonista

| | |
|---|---|
| **Cosa cerca** | Livello della squadra, tesseramento, Marathon 209 |
| **Dove atterra** | `/` o `/gli-amatori-triono` |
| **La sua porta** | Navbar `Amatori` + `SezioneAmatori` + `SezioneMarathon`. Nella hero è annunciato dall'eyebrow `SCUOLA DI CICLISMO E SQUADRA · TERNI` e dalla chiusa del sottotitolo *"chi cresce continua con la squadra"* |
| **Clic all'obiettivo** | **1** (navbar) |
| **Come capisce che le porte non parlano per lui** | Le domande sono esplicitamente su un figlio (*"Tuo figlio…"*). Il criterio dichiarato fa da filtro in entrambe le direzioni: chi non ha un figlio da iscrivere smette di leggere in meno di un secondo e va in navbar |
| **Cosa cambia per lui** | Nulla, tranne una perdita: il ticker spariva e con lui la voce `TESSERAMENTO 2026`. Dichiarata in §10 |

**Nessuna porta si confonde con un'altra**, perché ognuna ha un canale visivo diverso: la prova è
*ciano pieno preceduto da una domanda*, l'iscrizione è *giallo pieno preceduto da una domanda*, le
gare sono *mono + data*, gli amatori sono *navigazione*.

---

## 3 · L'idea visiva

Questa è la parte che il verdetto ha giudicato mancante in tutte e tre le proposte, e ha ragione: si
discuteva di quanti slot ha una fascia, non di che cosa vede l'occhio nei primi 300 millisecondi.

### 3.1 La scena: *la prova, vista da dove la guarda un genitore*

**Nel primo viewport si vede una fotografia sola, vera, grande: un bambino ripreso da dietro, casco
allacciato, maglia Triono, che si allontana su un percorso delimitato dal nastro, altri due bambini
davanti a lui, alberi umbri e luce di ottobre.**

L'asset esiste e non è usato da nessuna parte: `public/photos/scuola/inizio-lezione.jpg`, 1920×1080.

**Perché questa e non un'altra.** È letteralmente il punto di vista di un genitore alla prima lezione:
sei in piedi dietro tuo figlio e lo guardi partire. Non è una foto di gruppo in posa, non è una
partenza di gara: è il momento esatto che stiamo vendendo. In più fa tre cose che nessun'altra fa
insieme:

- **dice sicurezza senza scriverlo** — casco, percorso delimitato, altri bambini davanti, nessuna auto;
- **non mostra volti di minori.** Nessun cutout, nessuna sfocatura, nessuna liberatoria da chiedere per
  il pezzo di sito più visto. Il problema si risolve nell'inquadratura, non in post;
- **ha il terzo sinistro vuoto** (prato e nastro), che è esattamente dove va la tipografia.

**Perché non le altre**, in ordine di quanto ci ho pensato:

| Foto | Perché no |
|---|---|
| `lezione-ciclodromo.jpg` (tramonto, 9 bambini, colline di Terni) | La più bella che abbiamo. Ma i volti dei minori sono in primo piano e al centro, ed è **già usata due volte** — `SezioneScuola.tsx:72` in home e come `FOTO_PROVA_SRC` in `/la-scuola`. Metterla anche in hero farebbe ripetere la home a sé stessa due schermi dopo |
| `gruppo-traguardo.jpg` (griglia di partenza) | Volti, maglie di altre società, energia agonistica. Dice *gara*, non *puoi venire a provare* |
| `esercizio-equilibrio.jpg` (una bambina, frontale) | Bellissima, ma quadrata, volto in campo, un solo soggetto: è una foto da card, non da hero |
| Il video ambient di Airtable (slot `home-hero`) | **Non può essere l'immagine, per costruzione.** Il DS impone al fondale vivo grayscale + duotone + `opacity ≤ .4` + vignetta (`apex.css`, `FondaleVivo.tsx`). È texture, e infatti oggi nel primo viewport non si capisce che cosa si stia guardando |

**Costo di produzione: zero.** Nessun asset nuovo. Se un domani si vorrà sostituirla, il vincolo di
composizione da rispettare è: *soggetto a destra, di spalle, terzo sinistro libero, orizzontale
≥1600px*.

### 3.2 Come sta in pagina: **la foto è il palco, non lo sfondo**

Il DS APEX ha una regola precisa e giusta: il fondale vivo si tratta fino a renderlo illeggibile.
Quindi la fotografia **non diventa un fondale**: diventa **metà del palco**.

**Desktop (≥1024px) — composizione a due campi.**

```
│◄────────── 52% tipografia ──────────►│◄──── 46% fotografia ────►│
│  fondo #030818 pieno (stage-bg)      │  la foto, leggibile,     │
│  eyebrow · h1 · sottotitolo · porte  │  full-bleed fino al      │
│                                       │  bordo destro           │
                       ▲
        giunzione: gradiente orizzontale navy 0→100% su ~12% di larghezza
```

Il testo **non tocca mai la fotografia**. Non è un vezzo: è il risultato di una misura. La mia prima
versione metteva il testo *sopra* la foto con uno scrim navy in gradiente, come fanno tutti. L'ho
misurata campionando i pixel dello screenshot: **il testo mono a 11px arrivava a 1,87:1 contro il
pixel di sfondo peggiore**, cioè meno della metà del minimo AA (4,5:1) — perché la maglia bianca del
bambino e il cielo passano proprio sotto le etichette. Per portarlo ad AA lo scrim sarebbe dovuto
arrivare a ~0,88 di opacità, cioè avrebbe spento la foto. Quindi la foto sta di là e il testo sta di
qua, e la giunzione è un gradiente. Con questa composizione, misurato di nuovo:

| Elemento | Contrasto sul pixel di sfondo peggiore | Esito |
|---|---|---|
| `<h1>` (`--stage-ink`) | **15,8 : 1** | AAA |
| Sottotitolo (`--stage-ink-dim`) | **10,6 : 1** | AAA |
| Domande e prezzi (`--stage-muted`, 11px) | **6,3–6,4 : 1** | AA |
| *(mobile 375×553, stessi elementi)* | **5,2–15,6 : 1** | AA |

**Mobile (<1024px) — la foto è il pavimento della hero.**
Il testo e le porte stanno sul palco pieno; sotto le porte, una **banda fotografica da 150px** a tutta
larghezza, con una didascalia mono in basso a sinistra: `MARTEDÌ, 17:00 · CICLODROMO RENATO PERONA`.
La banda è tagliata dalla piega: è insieme l'immagine e il *fold hint*. Misurato: su iPhone 12–16 se
ne vedono **55px** sopra la piega, su iPhone X/11 **34px**, su iPhone SE **zero** — arriva al primo
movimento del pollice (parte 20px sotto la piega). Lo dichiaro perché è vero e perché è il limite
fisico: su 553px utili non ci stanno insieme una fotografia leggibile, un `<h1>`, un sottotitolo e due
porte con la loro grammatica. Qualunque proposta dica il contrario non ha misurato.

### 3.3 Che cosa esce dal primo viewport, e perché

- **Il video ambient** (slot Airtable `home-hero`). La home diventa fotografica; il video resta dov'è
  utile, nella CTA finale (slot `home-cta`). Perdita reale, dichiarata in §10: il titolare ha scelto
  quel video in EVO-021. In cambio il primo viewport ha un'immagine che si capisce, e l'LCP diventa un
  `<img priority>` invece di un `<video>` lazy.
- **Le mascotte.** Nino e Vittoria non stanno nel primo viewport. Oggi ci sono perché arrivano
  dall'`IMMAGINE_URL` della campagna attiva. La regola che propongo, e che vale da qui in avanti:
  **le foto provano, le mascotte spiegano.** Il genitore freddo che decide se fidarsi ha bisogno di
  bambini veri; le mascotte lavorano dove si spiega (Scuola, sicurezza, kit, `/prova`, `/la-scuola`),
  dove sono già e dove funzionano benissimo. È la lezione già scritta in `AGENTS.md` a proposito di
  EVO-029: tenere sobrie le sezioni di credibilità adulta.
- **Le quattro celle HUD** (11 anni di squadra, 5 maestri, 4 anni di scuola, 6 edizioni 209). Sono
  nella hero statica di oggi (`HomeHero.tsx:78-86`) e **A non dice mai che fine fanno**. Fine: scendono
  in coda a `SezioneAmatori`, che è la sezione del pubblico a cui quei numeri parlano davvero (anni di
  squadra ed edizioni 209 sono fatti da adulti). Non aiutano un genitore a decidere se venire a
  provare, e nel primo viewport competerebbero con le porte.
- **Il carosello.** Con la rotazione spariscono 6 controlli interattivi dal primo viewport mobile
  (misurati: prev, play/pausa, 3 dot, next), un carosello da mantenere in accessibilità, e il caso
  d'uso più fastidioso di SC 2.2.2.

### 3.4 La fascia, disegnata come un oggetto e non come tre caselle

Il verdetto ha ragione anche qui: "fascia regia", "bandella avvisi" e "In programma" erano tre nomi per
la stessa superficie trascurata, e quella superficie porta due dei quattro pubblici.

La fascia è **un tabellone di regia**, non una barra promozionale. Anatomia:

```
┌───────────────────────────────────────────────────────────────────────────────┐  hairline
│ ▌LA PROVA · SUBITO      │ IN PROGRAMMA              │ ALLENAMENTI              │
│ Due lezioni gratuite,   │ 12 set · Giovanissimi     │ Martedì strada ·         │
│ senza iscriversi.       │ su strada                 │ Giovedì MTB              │
│ ▰ SCRIVI SU WHATSAPP    │ Ciclodromo R. Perona,     │ 17:00–18:30, Ciclodromo  │
│                         │ Terni · iscrizioni        │ Renato Perona, Terni     │
│                         │ tramite le società, FCI   │                          │
│                         │ POI: 26 SET · MTB         │ Come funziona la Scuola →│
└───────────────────────────────────────────────────────────────────────────────┘  hairline
   ▲ barra accento 2px            ▲ hairline 1px          ▲ hairline 1px
```

Quattro decisioni di disegno, non di contenuto:

1. **Superficie `--stage-surface` fra due hairline a tutta larghezza.** È lo stesso linguaggio del
   ticker che sostituisce (banda, mono uppercase, bordi netti): continuità con il *chrome* del sistema,
   non con la pubblicità. È la difesa contro la cecità da banner.
2. **Una barra accento da 2px solo sulla prima colonna**, le altre due separate da hairline da 1px. È
   il segnale "questa riga è viva" del linguaggio telemetria, e costa un bordo.
3. **Nessuna immagine, nessun prop, nessun movimento.** La fascia non consuma budget APEX: niente
   fondale, niente L+1, niente animazioni. Quindi non compete mai con la hero sopra né con la sezione
   sotto.
4. **Etichette in `--stage-muted`, mai in `--stage-faint`** (2,7:1, sotto AA sul testo piccolo:
   trappola già documentata in `AGENTS.md`).

**Livrea `racing`**, non `scuola`: è chrome di regia, e il DS prescrive che *"il brand padre firma
tutto"* per il chrome (§1.7). Così il ciano della fascia e il ciano di porta A sono lo stesso segnale.

---

## 4 · Wireframe e misure della piega

### 4.0 Condizioni di misura — perché questi numeri valgono

Le tre proposte contenevano tre aritmetiche della piega e due erano sbagliate, sempre per lo stesso
motivo: **avevano scambiato l'altezza dello schermo per l'altezza del viewport**. Un iPhone SE non ha
667px di viewport: ne ha ~553 con le barre di Safari visibili.

- Dev server locale (`npm run dev`), pagina `/` reale, CSS APEX reale, font caricati.
- Viewport forzato via CDP `Emulation.setDeviceMetricsOverride`, verificato a ogni run confrontando
  `innerWidth`/`innerHeight` con il valore richiesto (lo script ritenta fino a 3 volte: sotto carico
  Chrome headless può ignorare l'override — è successo, ed è per questo che c'è il controllo).
- Il primo viewport proposto è **costruito dentro la pagina viva** — hero e fascia iniettate nel DOM
  usando le classi reali (`apex-wrap`, `apex-display`, `apex-cta`, `apex-data`, `apex-fondale`) — e poi
  misurato con `getBoundingClientRect()`. Non è un mockup: è il CSS di produzione.
- Le **altezze utili** sono quelle reali dei dispositivi, non quelle dello schermo:

| Profilo | Schermo | **Viewport utile misurato** | Perché |
|---|---|---|---|
| iPhone SE (2ª/3ª gen) | 375×667 | **375×553** | Safari iOS, tutte le barre visibili |
| iPhone X–13 mini | 375×812 | **375×635** | idem |
| iPhone 12–16 | 390×844 | **390×659** | idem |
| Laptop 720p | 1280×720 | **1280×608** | Chrome macOS a finestra piena (menubar + tab strip + barra indirizzi) |
| MacBook Air 13" | 1440×900 | **1440×780** | idem |

Riporto **entrambe** le colonne: la utile (che è quella che conta) e la nominale (che è quella chiesta
nel brief, e vale se il browser è a schermo intero senza barre).

### 4.1 Dove cade la piega **oggi** — misurato

Stato reale al momento della misura: tre comunicazioni attive, quindi hero dinamica.

| Viewport utile | `<h1>` | CTA della hero | Ticker (l'unico operativo) | Cliccabili visibili sopra la piega |
|---|---|---|---|---|
| 375×553 | *"Le iscrizioni sono aperte"* | +146 | **−246** | **9**, di cui **6 controlli del carosello** |
| 375×635 | idem | +228 | **−164** | 9 |
| 390×659 | idem | +252 | **−140** | 9 |
| 1280×608 | idem | **0** — il bottone chiude *esattamente* sulla piega | **−288** | 10 |
| 1440×780 | idem | +172 | **−116** | **16** |

Tre cose che nessuna delle tre proposte aveva misurato:

1. **Il livello operativo oggi non è mai nel primo viewport**, su nessun viewport: da −116 a −288px.
   Quindi la fascia non peggiora niente per costruzione — parte da zero.
2. **Su un laptop 1280×608 l'unica CTA della home chiude a filo di piega** (Δ = 0): metà dei visitatori
   desktop con finestra piccola vede un bottone tagliato.
3. Su mobile, degli elementi cliccabili visibili sopra la piega, **due terzi sono i comandi del
   carosello**. L'unica CTA reale è `Iscrivi tuo figlio`.

### 4.2 Il primo viewport proposto — desktop 1440×780 (utile)

```
╔══════════════════════════════════════════════════════════════════════════════╗ 0
║ [logo]  SCUOLA AMATORI CHI SIAMO MARATHON 209 DIVENTA MAESTRO CONTATTI       ║
║                            Accedi ·  ⟨Prenota una prova⟩ ⟨Iscrivi tuo figlio⟩ ║ 60
╠═══════════════════════════════════════════════╤══════════════════════════════╣
║  SCUOLA DI CICLISMO E SQUADRA · TERNI         │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓║ eyebrow mono
║                                               │▓  la fotografia:            ▓║
║  IN BICI,                                     │▓  bambino di spalle,        ▓║ h1 96px
║  SICURI,                                      │▓  casco, nastro, prato,     ▓║ 3 righe
║  INSIEME.                            ← h1     │▓  altri due davanti         ▓║ "INSIEME."
║                                               │▓                            ▓║ in accento
║  Bambini dai 4 anni, maestri federali, al     │▓  full-bleed fino al bordo  ▓║
║  Ciclodromo Renato Perona di Terni. Si        │▓  destro, nessun trattamento▓║ sottotitolo
║  comincia con due lezioni di prova gratuite;  │▓  duotone: si vede          ▓║ 3 righe
║  chi cresce continua con la squadra.          │▓                            ▓║
║                                               │▓                            ▓║
║  TUO FIGLIO NON HA MAI PROVATO?   HAI GIÀ DECISO?                           ▓║ domande mono
║  ▰▰ PRENOTA UNA PROVA →           ⟨ ISCRIVI TUO FIGLIO ⟩                    ▓║ ciano / giallo
║  FINO A 2 LEZIONI, GRATIS ·       TUTTO ONLINE · FOTO E                     ▓║ prezzi mono
║  BASTA UNA BICI QUALSIASI         CERTIFICATO MEDICO                        ▓║
║  E IL CASCO                                   │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓║ 690
╠══════════════════════════════════════════════════════════════════════════════╣ hairline
║ ▌LA PROVA · SUBITO      │ IN PROGRAMMA           │ ALLENAMENTI               ║
║ Due lezioni gratuite,   │ 12 set · Giovanissimi  │ Martedì strada ·          ║ 90px sopra
║ senza iscriversi.       │ su strada              │ Giovedì MTB               ║ la piega
╠═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═ ═╣ 780 ◄ PIEGA
║ ▰ SCRIVI SU WHATSAPP    │ Ciclodromo R. Perona…  │ 17:00–18:30, Ciclodromo…  ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### 4.3 Il primo viewport proposto — mobile 375px

```
┌───────────────────────────────────┐ 0
│ [logo]        ⟨PROVA GRATIS⟩  [☰] │ 60    chip pieno: oggi qui NON C'È
├───────────────────────────────────┤       nessuna CTA
│ SCUOLA DI CICLISMO E SQUADRA      │       eyebrow
│ · TERNI                           │
│ IN BICI,                          │       h1 — 46px (36px se il
│ SICURI,                           │       viewport è più basso di 620)
│ INSIEME.                          │
│ Bambini dai 4 anni, maestri       │       sottotitolo corto: la seconda
│ federali, al Ciclodromo Renato    │       metà vive nelle porte, sotto
│ Perona di Terni.                  │
│                                   │
│ TUO FIGLIO NON HA MAI PROVATO?    │       domanda
│ ▰▰  PRENOTA UNA PROVA  →          │       ciano pieno, full width
│ FINO A 2 LEZIONI, GRATIS · BASTA  │       prezzo
│ UNA BICI QUALSIASI E IL CASCO     │
│                                   │
│ HAI GIÀ DECISO?                   │
│ ⟨   ISCRIVI TUO FIGLIO   ⟩        │       giallo pieno, full width
│ FOTO + CERTIFICATO MEDICO         │ 551
├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤ 553 ◄ PIEGA su iPhone SE
│▓▓ la fotografia, banda 150px ▓▓▓▓▓│       su iPhone 12–16 se ne vedono
│▓ MARTEDÌ, 17:00 · CICLODROMO ▓▓▓▓▓│       55px sopra la piega
├───────────────────────────────────┤
│ ▌LA PROVA · SUBITO                │       fascia, impilata
│ …                                 │
└───────────────────────────────────┘
```

### 4.4 La tabella delle misure — proposta D

Distanza dalla piega, in pixel. **Positivo = sopra la piega.**

| Viewport | porta A · bottone | porta A · prezzo | porta B · bottone | porta B · prezzo | foto · bordo sup. | fascia · bordo sup. | fascia · WhatsApp |
|---|---|---|---|---|---|---|---|
| **375×553** *(SE, utile)* | **+154** | **+117** | **+25** | **+2** | −20 | −170 | −286 |
| **375×635** *(X–13 mini, utile)* | +207 | +170 | +78 | +56 | **+34** | −116 | −233 |
| **390×659** *(12–16, utile)* | +229 | +192 | +100 | +77 | **+55** | −95 | −211 |
| **1280×608** *(laptop, utile)* | +155 | +118 | +155 | +118 | +548 | **+62** | −54 |
| **1440×780** *(MBA 13", utile)* | +183 | +146 | +183 | +146 | +720 | **+90** | −26 |
| *1280×720 (nominale)* | +123 | +86 | +123 | +86 | +660 | +30 | −86 |
| *1440×900 (nominale)* | +303 | +266 | +303 | +266 | +840 | +210 | **+94** |

### 4.5 Il criterio della piega, riscritto perché sia vero

A si era dato il criterio *"il bordo superiore della fascia almeno 72px sopra la piega su tutti e
quattro i viewport"*, e prometteva lo slot ① intero con il bottone WhatsApp sopra la piega su iPhone
SE. **Misurato, è falso di 286px.** Non è un errore di stima: è un criterio impossibile, perché su
553px utili non ci stanno insieme le porte e la fascia.

Il criterio giusto riguarda **le porte**, non la fascia:

> **Criterio della piega (D).** Su tutti e cinque i viewport utili di riferimento, sopra la piega
> devono esserci: l'`<h1>`, il sottotitolo, e **entrambe le porte complete** — domanda, bottone,
> prezzo. La fascia di regia è il primo oggetto **sotto** la piega; su tre viewport su cinque ne
> sbircia la prima riga.

Verifica eseguibile, da mettere nella checklist di accettazione:

```js
const fold = innerHeight;
const ok = (sel) => document.querySelector(sel).getBoundingClientRect().bottom <= fold;
ok('[data-porta="prova"] [data-prezzo]') && ok('[data-porta="iscrizione"] [data-prezzo]')
document.querySelectorAll('h1').length === 1
```

**Il punto in cui questa proposta è più tirata, detto senza attenuanti:** su iPhone SE il prezzo di
porta B chiude a **+2px** dalla piega. È dentro, ma è fuori tolleranza — basta una metrica di fallback
del font diversa e va sotto. Il rimedio è già misurato e sta nei margini interni della hero mobile
(padding 20→16, margine dell'h1 14→12, margine del sottotitolo 16→14: **+6px**), e la verifica va
fatta col criterio eseguibile qui sopra, non a occhio. Ho anche misurato l'alternativa "fondere prezzo
e domanda su una riga" e **peggiora** (la riga fusa va a capo e spinge giù il bottone di 15px): la
scarto con il numero in mano.

Due parametri di layout nascono da una misura e vanno tenuti come vincoli, non come preferenze:

- **`<h1>` a `--fs-display`, con step-down a `--fs-h1` sotto `max-height: 620px`.** Con `--fs-hero`
  (che è il token che usa oggi la hero statica) l'h1 su iPhone SE è alto **223px** e spinge il bottone
  di porta A **47px sotto la piega**: cioè la hero "monumentale" del DS e le due porte non possono
  coesistere sul viewport più piccolo. Lo step-down per altezza — non per larghezza — costa una media
  query e risolve il caso.
- **Label `Prenota una prova`, non `Prenota una prova gratuita`.** Misurato: con la label lunga la CTA
  va a capo su due righe nella colonna di porta A a 1280px (295px disponibili, 296 necessari), e la
  regola DS dice *truncation e a-capo mai sulle CTA*. La parola "gratis/gratuita" resta **tre volte**
  nel primo viewport: sottotitolo, prezzo di porta A, fascia. È la scelta di B, e la confermo con il
  righello.

### 4.6 Densità del primo viewport, contata sul serio

| | oggi (campagne attive) | proposta D |
|---|---|---|
| Cliccabili visibili sopra la piega — **mobile** | **9** (di cui 6 controlli carosello) | **5** (logo, hamburger, chip, porta A, porta B) |
| Cliccabili visibili sopra la piega — **desktop 1440×780** | **16** (di cui 6 controlli carosello) | **12** (logo, 6 link di nav, Accedi, 2 CTA di navbar, porta A, porta B) |
| Superfici piene in accento | 1 | **2** (una ciano "prova", una gialla "iscriviti") |
| Superfici in movimento | 2 (video + carosello) | **0** |
| Decisioni reali offerte | 1, ed è quella sbagliata per chi non ci conosce | **2**, con il criterio scritto accanto |
| Messaggio stabile? | **no**, cambia ogni 7 secondi | **sì** |

**Punto di rottura, da scrivere nel commento del componente** (graft da B, che è l'unica delle tre ad
averlo nominato): *"Oltre 3 CTA o 8 elementi nel primo viewport, la porta smette di essere l'unico
fuoco visivo. `PorteIngresso` non ha la prop per una terza porta: se serve, la si aggiunge sotto, non
qui."*

---

## 5 · Copy, parola per parola

### 5.1 Hero

```
eyebrow    SCUOLA DI CICLISMO E SQUADRA · TERNI

h1         In bici, sicuri, insieme.          ["insieme." in accento]

sub        Bambini dai 4 anni, maestri federali, al Ciclodromo Renato Perona
(desktop)  di Terni. Si comincia con due lezioni di prova gratuite; chi cresce
           continua con la squadra.

sub        Bambini dai 4 anni, maestri federali, al Ciclodromo Renato Perona
(mobile)   di Terni.
```

**Eyebrow.** Tre informazioni in cinque parole: che cosa siamo (*scuola*), che cosa siamo anche
(*squadra* → è la porta semantica del pubblico ④), dove (*Terni*). Nessuna data, quindi non invecchia.
Sostituisce `TRIONO RACING · DAL 2015 · TERNI`, che ripete il nome già presente nel logo e mette una
data che non aiuta nessuno dei quattro pubblici a decidere.

**`<h1>` — resta `In bici, sicuri, insieme.`** Il brief chiede di non riaprirlo senza un motivo forte
e non ce n'è uno: è breve, memorizzabile, e porta due dei quattro gradini della belief ladder
(*sicuri* → Sicurezza, *insieme* → Community). L'accento va su **insieme**, non su *sicuri*: la
sicurezza è il prerequisito, l'appartenenza è la promessa. Il cambiamento vero non è il testo: è che
adesso è davvero un `<h1>` e non cambia più ogni sette secondi.

*Alternativa considerata e scartata:* l'`<h1>` di B, *"Prima di iscriverti, vieni a provare."*. È la
frase esatta di cui la mamma del brief aveva bisogno — ma è **un'istruzione di funnel messa
nell'asset tipografico più prezioso del sito**, e riproduce la degradazione che B stessa critica: il
claim di marca torna a essere un `<p>` da 15px, solo con un occupante diverso. Quella frase non
sparisce: diventa la **domanda di porta A**, che è il posto in cui un'istruzione ha diritto di stare.

**Sottotitolo.** 156 caratteri, cinque fatti verificati, zero aggettivi: *dai 4 anni* · *maestri
federali* · *Ciclodromo Renato Perona di Terni* · **due lezioni di prova gratuite** · *chi cresce
continua con la squadra*. È qui che si vince il test dei dieci secondi, ed è l'unica delle quattro
proposte che porta **entrambe** le metà della riga di `PRODUCT.md` nel primo viewport. Su mobile si
ferma al primo punto: la seconda metà è ridondante con il prezzo di porta A che sta 100px più sotto
(*"fino a 2 lezioni, gratis"*), e l'eyebrow porta già la parola *squadra*. Non è una rinuncia: è
de-duplicazione all'altezza giusta.

### 5.2 Le due porte

|  | **Porta A** | **Porta B** |
|---|---|---|
| **Domanda** (mono, accento) | `Tuo figlio non ha mai provato?` | `Hai già deciso?` |
| **Azione** | `Prenota una prova` → `/prova` · ciano pieno | `Iscrivi tuo figlio` → `/portale/iscrizioni` · giallo pieno |
| **Prezzo** (mono, muted) | `Fino a 2 lezioni, gratis · basta una bici qualsiasi e il casco` | `Tutto online · foto e certificato medico` *(mobile: `Foto + certificato medico`)* |

**Perché due domande e non due bottoni.** È la diagnosi migliore di tutto il fascicolo, ed è di C: due
bottoni che sono *due intensità dello stesso atto* costringono a valutare un **grado**, e valutare un
grado richiede informazioni che il genitore freddo non ha. Due domande con risposta ovvia no. È la
differenza fra un bivio stradale (richiede giudizio) e le due file "UE / non UE" al controllo
passaporti (richiede zero giudizio, perché il criterio è un fatto, non un'opinione).

**Perché il prezzo dichiarato.** È il secondo criterio di auto-selezione, ed è onesto in entrambe le
direzioni: chi non ha il certificato medico scopre in due secondi che oggi la sua porta è la A, invece
di scoprirlo a metà wizard; e chi teme di non avere "la bici giusta" viene disinnescato in tre parole.
*"Una bici qualsiasi"* è la frase che abbatte la barriera vera.

**Isomorfismo.** Le due porte hanno la stessa grammatica — domanda → azione → prezzo — e la stessa
geometria. Il lettore decodifica la prima in ~4 secondi e la seconda in meno di uno, perché ne conosce
già la forma. Rispetto a C ho tolto il *titolo* e il *dettaglio* di ciascuna porta: sono i due slot che
nella proposta C facevano crescere ogni porta a 200-230px e spingevano il bottone di porta B 90px sotto
la piega su iPhone SE. **La grammatica di C, al costo di A.**

**Perché porta B non è nascosta.** Non è un link debole: è una superficie piena, alta 48px misurati, in
`--accent-2` — che in livrea racing è il giallo `#F4E718`, il colore con il contrasto migliore di tutta
la palette (15,5:1 sul palco). Chi ha già deciso non va convinto: va servito, e lo si serve dandogli la
stessa dimensione, non lo stesso rumore.

### 5.3 Riga di cornice — la si prende da C così com'è

Sopra le due porte, su desktop, una riga sola:

> **Due modi per cominciare. Il primo è gratis.**

Sette parole che fanno tre cose: dichiarano il **numero** (due — insieme chiuso, niente opzioni
nascoste da cercare), dichiarano il **differenziatore** (gratis), e **incorniciano** la coppia come un
unico oggetto da leggere. Non è una domanda: chiedere *"da dove vuoi cominciare?"* inviterebbe a
deliberare. La domanda sta *dentro* le porte, dove ha risposta ovvia. È la riga migliore di tutto il
fascicolo ed è anche l'unica che ha il registro del reference: dice la cosa e lascia che la porta sia
ovvia, invece di vendere.

Su mobile la riga **non c'è**: costa 30px misurati e su 553px utili quei 30px sono il prezzo di porta
B. Le domande dentro le porte fanno lo stesso lavoro.

### 5.4 Fascia

```
slot ①   LA PROVA · SUBITO
         Due lezioni gratuite, senza iscriversi.
         ▰ Scrivi su WhatsApp                        → wa.me   [ciano pieno, sm]

slot ②   IN PROGRAMMA                                          ← da Airtable
         12 set · Giovanissimi su strada
         Ciclodromo Renato Perona, Terni · iscrizioni tramite le società,
         sui canali FCI
         POI: 26 SET · GIOVANISSIMI IN MTB                      ← generata, max 1 riga

slot ③   ALLENAMENTI
         Martedì strada · Giovedì MTB
         17:00–18:30, Ciclodromo Renato Perona, Terni
         Come funziona la Scuola →                   → /la-scuola  [link testuale]
```

*"Senza iscriversi"* nello slot ① è la frase che chiude il malinteso del brief: la mamma aveva aperto
la procedura di iscrizione perché il sito non le aveva mai detto che si poteva fare l'una senza
l'altra.

Gli **orari nello slot ③** sono lì per un motivo preciso: un genitore decide *"possiamo farcela?"*
prima di decidere *"ci proviamo?"*. Martedì alle 17:00 è una domanda di logistica familiare, e oggi la
risposta vive due schermi più in basso.

---

## 6 · I tre eventi di settembre

### 6.1 Due sono annunci, uno è una porta

| Evento | Natura reale | Dove vive | Perché |
|---|---|---|---|
| **12 set** · gara strada Giovanissimi | annuncio | fascia slot ② | Iscrizioni via FCI tra società: non c'è niente da far fare al visitatore |
| **26 set** · gara MTB Giovanissimi | annuncio | fascia slot ② | idem |
| **19 set** · Narni Sport Night | **porta** | **fascia slot ①** | Non è un evento a cui assistere: è la lezione di prova portata in città, con le bici fornite da noi |

**Narni non è il terzo evento: è la seconda istanza della prova.** È il fatto più prezioso del brief e
catalogarlo come "evento" lo sprecherebbe. A Narni cadono *tutte* le barriere residue: non serve la
bici (le mettiamo noi), non serve andare al ciclodromo, non serve concordare niente — basta passare in
centro. È letteralmente la nostra porta più bassa, per una sera. Quindi **non prende uno slot suo: si
sovrappone allo slot ①**, che è già la porta della prova, e ne cambia le parole per diciannove giorni.

Record Airtable, `SLOT = prova`:

```
EYEBROW      LA PROVA · IN CITTÀ
TITOLO       Il **19 settembre** siamo alla Narni Sport Night.
SOTTOTITOLO  Percorso di agilità per bambini: le bici le mettiamo noi.
             Venite così come siete.
CTA_LABEL    (vuoto — resta il bottone WhatsApp strutturale)
VALIDO_DA    2026-09-01
VALIDO_A     2026-09-19
```

Il `**19 settembre**` riusa la sintassi di accento già implementata in `renderTitolo()`
(`HeroCampagne.tsx:44`): il parser si sposta nella fascia insieme al resto, zero codice nuovo.

Il **20 settembre lo slot ① torna da solo** al suo testo permanente. Nessuno deve ricordarsi di
spegnere niente.

**Effetto sul primo viewport dall'1 al 19 settembre:** due porte della prova che si rinforzano invece
di contendersi lo spazio — *"prenota al ciclodromo"* (hero) e *"oppure vieni a trovarci in centro il
19"* (fascia) — perché sono **la stessa porta detta due volte**, non due messaggi.

### 6.2 Le due gare

```
Record A  SLOT=evento · EYEBROW "GARA · STRADA"
          TITOLO "12 set · Giovanissimi su strada"
          SOTTOTITOLO "Ciclodromo Renato Perona, Terni · iscrizioni tramite
                       le società, sui canali federali FCI"
          VALIDO_DA 2026-08-20 · VALIDO_A 2026-09-12 · PRIORITA 10

Record B  SLOT=evento · EYEBROW "GARA · MOUNTAIN BIKE"
          TITOLO "26 set · Giovanissimi in MTB"
          SOTTOTITOLO (identico) · VALIDO_A 2026-09-26 · PRIORITA 20
```

**Regola anti-bacheca imposta dal codice, non dalla disciplina:** fra tutti i record in corso con
`SLOT = evento`, la fascia ne mostra **esattamente uno** in primo piano (quello con `VALIDO_A` più
vicino) più **al massimo una** riga "POI:". L'amministratore può attivarne dieci: la home ne mostrerà
sempre una e mezza. **La bacheca è strutturalmente impossibile.**

Se non esiste un URL reale, lo slot resta **testo puro**: nessun link finto, nessun vicolo cieco.
**Nessuna route `/gare`**: il fatto accertato dice che non c'è nessun flusso da costruire, e una pagina
che ripete tre righe di slot sarebbe un contenitore vuoto da mantenere.

### 6.3 Il calendario, giorno per giorno

| Periodo | Slot ① | Slot ② | Slot ③ | Colonne |
|---|---|---|---|---|
| fino al 19 ago | Prova (permanente) | *(vuoto)* | Allenamenti | **2** |
| 20 ago – 31 ago | Prova (permanente) | 12 set strada · *POI: 26 set MTB* | Allenamenti | 3 |
| 1 set – 12 set | **Narni 19 set** | 12 set strada · *POI: 26 set MTB* | Allenamenti | 3 |
| 13 set – 19 set | **Narni 19 set** | 26 set MTB | Allenamenti | 3 |
| 20 set – 26 set | Prova (permanente) | 26 set MTB | Allenamenti | 3 |
| **dal 27 set** | Prova (permanente) | *(vuoto)* | Allenamenti | **2** |

Nessuna riga di questa tabella richiede che una persona faccia qualcosa in una certa data.

---

## 7 · Destinazione di ogni CTA, superficie per superficie

### 7.1 Home

| Superficie | Label esatta | URL esatto | Variante | Modifica |
|---|---|---|---|---|
| Hero · porta A | `Prenota una prova` | `/prova` | primary | **nuova** |
| Hero · porta B | `Iscrivi tuo figlio` | `/portale/iscrizioni` | **support** | era primary |
| Fascia ① | `Scrivi su WhatsApp` | `https://wa.me/39…` | primary sm | **nuova** |
| Fascia ① *(fallback)* | `Come funziona la prova` | `/prova` | primary sm | **nuova** |
| Fascia ② | *(dinamico, es.)* `Locandina` | `CTA_URL` da Airtable | link testuale | **nuova** |
| Fascia ③ | `Come funziona la Scuola` | `/la-scuola` | link testuale | **nuova** |
| `SezioneScuola` | `Prenota una prova` | `/prova` | primary | era `Iscrivi tuo figlio` |
| `SezioneScuola` | `Iscrivi tuo figlio` | `/portale/iscrizioni` | support | era ghost `Scopri di più` |
| `SezioneScuola` | `Scopri di più sulla Scuola` | `/la-scuola` | link testuale | era CTA ghost |
| `SezioneMarathon` | *(invariata)* | `/contatti?motivo=marathon` | ghost | — |
| `CtaFinale` **(solo home)** | `Prenota una prova` | `/prova` | primary | era `Iscrivi tuo figlio` |
| `CtaFinale` **(solo home)** | `Iscrivi tuo figlio` | `/portale/iscrizioni` | support | — |
| `CtaFinale` **(solo home)** | ~~`Accedi all'area genitori`~~ | — | — | **rimossa**: non è una conversione, è in navbar |

**Il vincolo che B non aveva visto.** `CtaFinale` è importata da **tre** pagine: `/`, `/chi-siamo`,
`/gli-amatori-triono`. Ricablarla sulla prova senza prop farebbe chiudere la pagina **Amatori &
Agonisti** con un invito a prenotare una lezione di prova per bambini. Quindi:

```ts
// CtaFinale.tsx
variant?: "squadra" | "scuola";   // default "squadra" = comportamento attuale
```

Solo `/` passa `variant="scuola"`. Tre call site toccati, zero regressioni sulle pagine adulte. Il
testo del paragrafo e l'`<h2>` restano quelli che sono per la variante `squadra`.

### 7.2 Navbar (tutte le pagine pubbliche)

| Superficie | Label | URL | Variante | Modifica |
|---|---|---|---|---|
| Desktop | `Accedi` / `Vai al portale` | `/portale/login` \| `/portale` | **link testuale** | era `apex-cta--ghost--sm` |
| Desktop | `Prenota una prova` | `/prova` | **primary sm** | **nuova** |
| Desktop | `Iscrivi tuo figlio` | `/portale/iscrizioni` | **support sm** | era primary |
| **Header mobile** | `Prova gratis` | `/prova` | **primary sm (chip)** | **nuova — oggi qui non c'è nessuna CTA** |
| Drawer mobile | `Prenota una prova` | `/prova` | primary | **nuova, prima voce** |
| Drawer mobile | `Iscrivi tuo figlio` | `/portale/iscrizioni` | support | era primary |
| Drawer mobile | `Accedi` / `Vai al portale` | `/portale/login` \| `/portale` | ghost | — |

Due decisioni, entrambe con un motivo:

- **`Accedi` scende a link testuale.** Non è una conversione: è manutenzione dell'account. Libera lo
  spazio per la seconda porta senza aumentare il numero di bottoni nella navbar (restano due).
- **Il chip mobile porta la prova, ed è pieno.** È l'unico elemento garantito nel 100% dei viewport di
  **tutte** le pagine: su `/la-scuola`, `/chi-siamo`, `/marathon-209` è l'unica porta bassa presente
  sopra la piega. Oggi la navbar mobile non ha nessuna CTA: verificato.

I link di navigazione restano **sei**: `/prova` non entra nel menu principale (sarebbe il settimo e la
navbar è già al limite).

### 7.3 `/la-scuola`

| Superficie | Oggi | Proposta |
|---|---|---|
| `SezioneComeIscriversi`, step 01 | link testuale soft → `/contatti?motivo=scuola` | `Come funziona la prova →` **`/prova`** (resta un link soft: la gerarchia decisa in EVO-022 è giusta, cambia solo la destinazione) |
| `CtaScuola`, eyebrow | `ISCRIZIONI APERTE` | `PRIMA DI DECIDERE` |
| `CtaScuola`, bottoni | `Iscrivi tuo figlio` / `Scrivici` (mailto) / `Chiama` | `Prenota una prova` (primary) → `/prova` · `Iscrivi tuo figlio` (support) · `Chiama {telefono}` (ghost, da Airtable). **`Scrivici` (mailto) esce**: la sostituisce `/prova`, che offre WhatsApp, telefono *e* modulo |

Su `/la-scuola` porta A punta a `/prova` e non direttamente a WhatsApp: chi è già dentro la pagina
lunga sta ancora raccogliendo informazioni. Nella fascia della home, dove il genitore ha appena letto
criterio e prezzo, la scorciatoia diretta è giustificata.

### 7.4 `/contatti` — la correzione di verità

La card *"Vieni a trovarci"* (`src/app/(public)/contatti/page.tsx:97`) dice oggi: *"Sei il benvenuto in
qualsiasi lezione per conoscere maestri, bambini e ambiente. **Niente prenotazione, basta
presentarsi.**"*

Questa frase non è falsa: riguarda il **venire a guardare**. Il fatto accertato riguarda il **provare
in sella**, che va concordato prima. Il difetto è che **la distinzione oggi non è scritta da nessuna
parte**, e un genitore che legge quella card e si presenta al ciclodromo con la bici del figlio brucia
la prima impressione del club. Quindi non si cancella l'accoglienza: **si dichiara la distinzione**.

> **Vieni a guardare una lezione: quando vuoi.** Martedì e giovedì, 17:00–18:30, al Ciclodromo Renato
> Perona. Niente prenotazione, basta presentarsi.
> **Vuoi che provi in sella?** Scrivici prima, così il maestro vi aspetta e il gruppo è pronto.
> **Prenota una prova →** `/prova`

Fatta così, `/contatti` diventa **una porta ancora più bassa della prova** invece di un'ambiguità che
costa una famiglia. È il reperto di B, con il rimedio che il verdetto ha corretto.

Inoltre: `MOTIVI` in `ContactForm.tsx:21` guadagna **`Lezione di prova`** e `motivoFromKey` la chiave
`prova`. **Costo dichiarato:** il valore va allineato in **tre** punti — `MOTIVI`, lo `z.enum` in
`api/contatti/route.ts:25`, e la singleSelect Airtable `CONTATTI.MOTIVO` su **PROD e DEV** — altrimenti
Airtable risponde 422 `INVALID_MULTIPLE_CHOICE_OPTIONS`, errore già visto su questo repo.

Il form **non è la porta primaria** della prova: il messaggio di successo promette *"2–3 giorni"*
(quattro occorrenze nel file), tempo giusto per un'informazione e sbagliato per prenotare una lezione
che si tiene fra due giorni.

---

## 8 · La consegna a WhatsApp, progettata come momento

Tutte e tre le proposte finivano su `wa.me` con una stringa precompilata e si fermavano lì. Ma la
consegna è **il momento più freddo del sito**: è quando un genitore sta per dare il proprio numero a
degli sconosciuti. Le academy che il brief cita vincono esattamente qui.

### 8.1 Che cosa vede prima di uscire dal sito

`/prova` è una pagina statica, in livrea Scuola, senza nessun dato a scadenza (quindi manutenzione
zero). Il suo pezzo centrale è un blocco che si chiama **"Cosa succede quando ci scrivi"** e sta
**sopra** il bottone, non sotto:

```
COSA SUCCEDE QUANDO CI SCRIVI

  01   Ti risponde {scuola-referente} in persona.
       Non un centralino, non un modulo: il numero è quello della scuola.

  02   Concordiamo il giorno insieme.
       Martedì su strada o giovedì in mountain bike, 17:00–18:30.

  03   Vieni e provi.
       Basta una bici qualsiasi e il casco. Fino a due lezioni, su
       entrambi i corsi. Poi decidete con calma.

  ▰▰  SCRIVI SU WHATSAPP  →              [ciano pieno]
      Chiama {telefono}                  [ghost]
      Preferisci scrivere? Compila il modulo →   /contatti?motivo=prova

  Se sei al computer, WhatsApp ti chiederà di inquadrare un codice con il
  telefono: da qui è più veloce chiamare.
```

Quattro cose che questo blocco fa e che un link non fa:

1. **Nomina chi risponde.** *"Ti risponde {scuola-referente} in persona"* — da `Impostazioni Sito`,
   chiave già esistente. È la riga più calda del fascicolo, messa nel momento più freddo del sito.
   Fallback se la chiave è vuota: *"Ti risponde uno di noi, in persona."*
2. **Dice cosa succede dopo**, in tre passi, prima che il genitore si esponga. Il salto di intimità
   diventa una sequenza prevedibile.
3. **Non promette un tempo di risposta.** Non è un fatto accertato, e promettere "rispondiamo entro X"
   su un canale presidiato da una persona sola è il modo migliore per creare un debito. Diciamo *chi*
   risponde, non *quando*: è vero, ed è più rassicurante.
4. **Risolve il vicolo cieco desktop, invece di annotarlo a piè di pagina.** Su desktop `wa.me` apre
   WhatsApp Web e chiede un QR: è una quota reale di visitatori che sbatte contro un muro nel momento
   della prima impressione. La riga sotto le CTA lo dice prima che succeda, e il telefono è lì accanto
   con lo stesso rango tipografico. Non nascondiamo il modulo in un accordion: chi non usa WhatsApp è
   un pubblico, non un'eccezione.

### 8.2 Il messaggio precompilato

```
Ciao! Vorrei prenotare una lezione di prova per mio figlio/a. Età:
```

Tre proprietà volute (l'analisi è di C, la confermo): **(a)** è inviabile così com'è, quindi non è un
compito; **(b)** finisce su uno slot aperto che si completa con un tocco, e regala al titolare l'unico
dato che determina il gruppo; **(c)** è corto, quindi nessun client lo tronca e nessuno lo cancella per
riscriverlo.

**Tre varianti per origine** — attribuzione di canale a costo zero (graft da B §9.4). Per un club senza
analytics configurate, contare i messaggi per testo è l'unico modo onesto di sapere se il sito ha
davvero aperto un canale che oggi, per ammissione, non porta niente:

| Origine | Testo |
|---|---|
| Fascia slot ① (via veloce) | `Ciao! Ho visto il sito e vorrei prenotare una lezione di prova per mio figlio/a. Età:` |
| `/prova` (via informata) | `Ciao! Vorrei prenotare una lezione di prova per mio figlio/a. Età:` |
| Card Narni (dal 1 al 19 set) | `Ciao! Ho visto Narni Sport Night, vorrei sapere come funziona la lezione di prova.` |

### 8.3 Derivazione del numero, degrado, dettagli tecnici

Il numero **non è mai scritto nel codice**. Helper nuovo accanto a `phoneHref()` in
`src/lib/site-settings.ts` (~8 righe):

```ts
/** wa.me vuole E.164 senza "+" e senza separatori. */
export function whatsappHref(raw: string, testo?: string): string {
  const t = raw.trim();
  const digits = t.startsWith("+") ? t.replace(/\D/g, "") : `39${t.replace(/\D/g, "")}`;
  return `https://wa.me/${digits}${testo ? `?text=${encodeURIComponent(testo)}` : ""}`;
}
```

Sorgente: `getSiteSettings()["scuola-whatsapp"] ?? getSiteSettings()["scuola-telefono"]`. Oggi
coincidono; la chiave opzionale costa una riga e mette al riparo dal giorno in cui divergeranno, senza
creare niente adesso.

**Degrado.** `getSiteSettings()` è SAFE e può ritornare `{}` (env mancanti, Airtable giù, preview). In
quel caso **la porta non sparisce**: la CTA della fascia diventa `Come funziona la prova → /prova`,
stesso peso, stessa posizione. Mai un `wa.me/undefined`.

**Dettaglio tecnico obbligatorio.** `ApexCta` rende **sempre** un `next/link` e **non espone `target`**
(verificato in `ApexCta.tsx`). Quindi il link WhatsApp è un `<a target="_blank" rel="noopener
noreferrer">` con le classi `apex-cta apex-cta--primary` (stesso pattern già usato in EVO-043 per i
link esterni), più uno `<span class="sr-only">(si apre in WhatsApp)</span>`. È un **link**, non un
embed: nessun impatto sul consenso cookie, nessun gating.

---

## 9 · Degrado al 27 settembre — e a qualunque altra data

Il 27 settembre alle 00:00 `isComunicazioneInCorso()` smette di far passare i record (`oggi >
VALIDO_A`). La funzione è pura, prende `oggi` iniettata, estremi inclusi
(`comunicazioni-hero.ts:64`). **Non è testata**: in questo repo non esiste nessun test su `src/` —
l'unica suite è in `emails/`. A dichiarava il contrario ed era falso. La mossa onesta è **scriverne
due** (§11), non dichiararli esistenti.

Che cosa resta in pagina:

```
┌────────────────────────────────────────────────────────────────────┐
│ ▌LA PROVA · SUBITO                │ ALLENAMENTI                     │
│ Due lezioni gratuite,             │ Martedì strada · Giovedì MTB    │
│ senza iscriversi.                 │ 17:00–18:30, Ciclodromo Renato  │
│ ▰ SCRIVI SU WHATSAPP              │ Perona, Terni                   │
│                                   │ Come funziona la Scuola →       │
└────────────────────────────────────────────────────────────────────┘
```

**Perché non si apre un buco:**

1. Gli slot superstiti sono **cablati nel codice**: non possono mancare.
2. La griglia è `repeat(auto-fit, minmax(260px, 1fr))`: due slot occupano l'intera larghezza da soli,
   nessuna colonna fantasma. È degradazione di layout, non un caso da gestire.
3. **L'altezza della fascia non cambia** (una riga su desktop; su mobile due blocchi invece di tre): la
   geometria misurata in §4.4 resta valida, e su mobile migliora.
4. La hero non si accorge di niente: è statica.

**La prova del nove — degrado in condizioni peggiori:**

| Guasto | Che cosa succede |
|---|---|
| Airtable irraggiungibile / env mancanti in preview | `getComunicazioniHeroAttive()` è SAFE → `[]`. Fascia con slot ① e ③. **La porta della prova c'è.** |
| `scuola-telefono` non impostato | Slot ① mostra `Come funziona la prova → /prova` |
| Record lasciato attivo per sbaglio senza `VALIDO_A` | **Tetto di 90 giorni in codice** (graft da C): qualunque contenuto guidato da Airtable in fascia sparisce comunque dopo 90 giorni da `VALIDO_DA`. Rete di sicurezza indipendente dal fatto che il campo sia stato compilato bene |
| JavaScript disattivato o lento | Hero e fascia sono Server Component senza stato: si vedono tutte. Le porte sono `<a>` reali |
| `prefers-reduced-motion` | Non c'è niente da fermare: nel primo viewport non si muove più nulla |
| Fotografia mancante (404) | Il fondale statico APEX resta sotto (`apex-fondale`: stage + floodlight + vignetta). Nessun CLS: il `<figure>` ha altezza dichiarata |

**La porta della prova non può sparire in nessuno scenario.** È il singolo requisito non negoziabile di
questa proposta, ed è per questo che le porte e gli slot ① e ③ non sono su Airtable.

---

## 10 · Operatività

### 10.1 Che cosa sta in codice, e perché

| Elemento | Perché non è su Airtable |
|---|---|
| Hero completa (h1, sottotitolo, **le due porte**, fotografia) | È la grammatica del sito, non un contenuto. Deve essere deterministica per garantire la piega (§4) e non contiene niente che scada |
| Fascia, slot ① e ③ | Sono porte e orari: non devono poter sparire per un errore di configurazione |
| `/prova` | Nessun contenuto a scadenza, tranne il blocco Narni che viene dallo stesso record Airtable dello slot ① |
| Numero WhatsApp | *Derivato* da `scuola-telefono`: già gestito da Airtable, non va duplicato |

### 10.2 Che cosa aggiorna il titolare

**Un solo gesto, una sola tabella, una schermata che già usa.** Su `/portale/admin/comunicazioni`
(CRUD esistente, con `revalidatePath("/")` già implementato → la home cambia in pochi secondi, non in
cinque minuti):

| Quando | Che cosa fa | Quanto ci mette |
|---|---|---|
| C'è un evento da annunciare | Nuovo record `SLOT = evento`, `VALIDO_DA` = da quando annunciarlo, **`VALIDO_A` = il giorno dell'evento** | ~1 minuto |
| Un'iniziativa cambia le parole della prova (Narni) | Nuovo record `SLOT = prova`, con le date | ~1 minuto |
| L'evento è passato | **Niente** | 0 |
| Cambia il telefono o il referente | `Impostazioni Sito` (già in uso) | ~30 secondi |
| Cambiano gli orari dei corsi | **Deploy** — dichiarato sotto | — |

> **Regola operativa unica da ricordare, e sta in una riga:**
> `VALIDO_A` è il giorno dell'evento. Il resto si spegne da solo.

**Il graft più prezioso di C, a costo quasi zero.** C aveva ragione su una cosa: in `Comunicazioni
Hero` la scadenza è un campo separato che qualcuno deve **ricordarsi** di compilare, mentre in una
tabella `Eventi` la scadenza *è* la data dell'evento, e dimenticarsene è impossibile. Ma non serve una
tabella nuova per avere quel beneficio: basta **cambiare l'etichetta del campo nel form admin**, non lo
schema.

```
VALIDO_A  →  etichetta: "Giorno dell'evento"
             help:      "Dopo questa data la comunicazione sparisce da sola dalla home."
```

Zero migrazioni, zero secondo modello mentale, zero CRUD nuovo da costruire: il significato che rende
impossibile sbagliare, dentro lo strumento che il titolare già conosce.

### 10.3 Costi introdotti, dichiarati tutti

**Una tantum:**

1. **Un campo Airtable nuovo**: `SLOT` (singleSelect: `evento`, `prova`) su `Comunicazioni Hero`, su
   **PROD e DEV nella stessa sessione**. Retro-compatibile: vuoto = `evento`. ⚠️ Va creato **con
   entrambe le scelte in un colpo**: l'API Airtable non permette di aggiungere choice a un singleSelect
   esistente (`update_field` → 422 `INVALID_REQUEST_UNKNOWN`); l'unica alternativa è scrivere un record
   con `typecast: true` o farlo a mano nella UI.
2. **Route `/prova`** + voce in `sitemap.ts` (`priority 0.9`, `changeFrequency "yearly"`) + `metadata`
   con canonical + link nel footer. OG: riusabile `/og/home.jpg` in v1.
3. **`MOTIVI`** allineato in tre punti (§7.4).
4. **`whatsappHref()`** in `site-settings.ts`.
5. **Una variante CSS nuova nel DS**: `.apex-fondale--foto` — fondale fotografico, niente grayscale,
   scrim lineare al posto della vignetta radiale. Il precedente in casa esiste ed è documentato:
   `.apex-fondale--tessuto` è nato esattamente per lo stesso motivo (un fondale che è un
   `background-image` e non un video, con overlay lineare perché i due stack si moltiplicherebbero).
   Costo: una regola CSS + una riga in `DS-APEX`.
6. **Prop `variant` su `CtaFinale`** (3 call site) · **variante e chip in navbar** · **etichetta admin**
   da "Comunicazioni hero" a "Comunicazioni in home", perché la destinazione cambia.
7. **`HomeTicker` eliminato.** Il componente DS `Ticker` resta in repo senza consumatori: è nei nove
   componenti canonici, tenerlo o rimuoverlo è una decisione di igiene, non di prodotto.

**Ricorrente: zero.** Nessun contenuto va spento a mano. Nessuna data è cablata.

**Richiede deploy (dichiarato):** orari e giorni dei corsi (slot ③ e `/prova`), il testo permanente
della prova, il copy della hero. Cambiano una volta ogni due anni e in cambio non possono rompersi. Se
un domani dovessero cambiare spesso, la via esiste già senza inventare niente: due chiavi in
`Impostazioni Sito` (`scuola-orario-strada`, `scuola-orario-mtb`) lette con fallback ai valori in
codice. **Non lo propongo adesso**: sarebbe complessità per un problema che non abbiamo.

### 10.4 Che cosa perdiamo, detto chiaramente

1. **La hero non è più un palcoscenico promozionale.** Una campagna verso adulti (per esempio il
   reclutamento Maestri di EVO-035) non avrà più il titolo grande e la mascotte dedicata: avrà lo slot
   ② e la sua pagina. È il prezzo del determinismo della piega e della stabilità dell'`<h1>`, e lo pago
   consapevolmente. La meccanica di EVO-035 **non si butta**: `lib/comunicazioni-hero.ts`, il CRUD
   admin, il date-range, la priorità, `revalidatePath("/")` restano tutti e alimentano la fascia. Cambia
   il componente di presentazione.
2. **Il video ambient esce dalla home** (§3.3). Lo slot Airtable `home-hero` resta nel codice ma non è
   più consumato dalla home: **va detto al titolare**, altrimenti crede di poter cambiare la hero e non
   succede niente. È il tipo di manopola morta che genera chiamate a distanza di mesi.
3. **Le mascotte escono dal primo viewport** (§3.3).
4. **Il ticker sparisce e con lui `TESSERAMENTO 2026`**, che era l'unica menzione degli amatori sopra la
   piega. Resta la navbar. Se il tesseramento è una campagna vera, è un record `SLOT = evento` come gli
   altri, e allora *migliora*: oggi è una riga in una marquee `aria-hidden`.
5. **Quattro riparazioni che vengono gratis**, perché stanno nei file che si toccano comunque:
   `HeroCampagne` usa `<a href>` invece di `next/link` (righe 284, 289) → ricaricamento completo della
   pagina; `line-clamp-2` sul sottotitolo (riga 277) → tronca in silenzio il testo dell'admin senza che
   lo sappia; `priority` su una foto sotto la piega in `SezioneScuola` (riga 77) → priorità di
   caricamento sprecata a scapito della hero, che adesso ha una fotografia e ne ha bisogno davvero.

---

## 11 · Taglio in evolutive

### EVO-α — **La porta.** Nessuna dipendenza da Airtable, nessuna dipendenza dalle date.

Due file, il problema della mamma chiuso in giornata:

- `HomeHero` → hero statica con **le due porte** (domanda, azione, prezzo) e la fotografia;
- `HomeTicker` → **fascia con il solo slot ①**, cablato, con il bottone WhatsApp;
- `whatsappHref()` in `site-settings.ts`.

Niente `/prova` ancora: porta A punta a `wa.me` finché la pagina non esiste, e il chip mobile arriva
con EVO-β. È il taglio minimo che A aveva individuato correttamente (§17), con in più la fotografia e
la grammatica delle porte, che costano lo stesso.

**Criterio di uscita:** le due porte complete sopra la piega sui cinque viewport (§4.5), `<h1>` unico e
uguale al claim, contrasti AA verificati campionando i pixel.

### EVO-β — **La consegna.** Da avere in piedi **prima che vada in stampa qualunque materiale di Narni.**

- Route `/prova` con il blocco *"Cosa succede quando ci scrivi"* (§8);
- `MOTIVI` + `motivoFromKey` + singleSelect Airtable PROD/DEV;
- correzione di verità su `/contatti` (§7.4);
- navbar: chip mobile, `Accedi` a link, seconda porta desktop;
- `CtaFinale` con prop `variant`, `SezioneScuola` ricablata, `/la-scuola` (`CtaScuola`, step 01).

**È il taglio con il vincolo di data più stringente di tutto il lavoro**: il QR e il volantino di Narni
devono puntare a una pagina già viva.

### EVO-γ — **Il tempo.** Dipende dalle date di settembre: in piedi **entro fine agosto**.

- Campo `SLOT` su `Comunicazioni Hero` (PROD + DEV) + opzione nel CRUD admin + etichetta `VALIDO_A`;
- fascia completa: slot ② da Airtable (uno + "POI:"), slot ③, tetto di 90 giorni;
- i tre record di settembre (§6);
- **i primi due test del repo**: `isComunicazioneInCorso` (estremi inclusi, record senza date, record
  scaduto) e la regola "un solo evento in primo piano + al massimo una riga POI". Sono le due funzioni
  da cui dipende la promessa "non può invecchiare male": se sono importanti come dico, si testano.

**Ordine e indipendenza.** α non dipende da niente. β dipende da α solo per coerenza di copy. γ non
dipende da β. Se il committente vuole fermarsi dopo α, la home è già corretta e la porta c'è.

---

## 12 · Rischi e trade-off accettati

**In ordine di gravità.**

1. **La garanzia della piega è una promessa da difendere nel tempo.** Vale finché la hero resta
   deterministica: basta che qualcuno rimetta contenuto a lunghezza variabile lì dentro e i numeri di
   §4.4 saltano senza che nessuno se ne accorga. *Mitigazione:* il criterio è un test eseguibile
   (§4.5), va nella checklist di merge e nel commento in testa al componente. *Rischio residuo: reale.*
   È il punto in cui questa architettura può degradare in silenzio.
2. **+2px su iPhone SE** (§4.5). Il margine più sottile del progetto, dichiarato con il numero e con il
   rimedio già misurato. Non lo nascondo dietro un "sopra la piega".
3. **WhatsApp concentra il carico su una persona sola.** Se il canale funziona, i messaggi aumentano,
   arrivano la sera e nel weekend, e non c'è triage. *Non ho una mitigazione tecnica onesta* oltre al
   fatto che il testo precompilato è corto e già qualificato, e che `/prova` offre telefono e modulo.
   **Va accettato prima, non scoperto dopo.**
4. **Due porte possono ancora dividere l'intenzione.** Un genitore già deciso potrebbe cliccare "prova"
   perché è il bottone più acceso. *Mitigazione:* il criterio dichiarato è precisamente il dispositivo
   che riduce questo rischio, e `Iscrivi tuo figlio` è in navbar su ogni pagina. *Trade-off accettato:*
   una prova in più costa una sera di un maestro; un'iscrizione abbandonata al terzo passaggio costa un
   bambino.
5. **Ogni criterio binario lascia fuori una coda** (R1 di C, e la prendo così com'è). Chi non è né "mai
   provato" né "già deciso" — *"l'anno scorso ha fatto la prova, quest'anno vogliamo capire i costi"* —
   non si riconosce in nessuna delle due domande. *Mitigazione:* il titolo di porta B è neutro e la
   fascia raccoglie. *Residuo reale.*
6. **Perdiamo il palcoscenico delle campagne** (§10.4). Se il titolare ci tiene, questa è la parte che
   sentirà come una rinuncia. Non la mascherò: è una scelta, e la contropartita è che il claim di marca
   smette di sparire ogni sette secondi.
7. **La fotografia è una scommessa su un asset solo.** Se un giorno non piacerà più, la sostituzione
   richiede una foto con lo stesso vincolo di composizione (§3.1) e un deploy. *Accettato:* è il
   contrario del problema che abbiamo, che è troppo contenuto governato da Airtable e nessuno che se ne
   ricordi.
8. **La fascia è un pattern nuovo e potrebbe leggersi come una barra promozionale** (cecità da banner).
   *Mitigazione:* non è floating, non è chiudibile, non ha icone di chiusura, non usa colori fuori
   palette, e adotta il linguaggio del ticker che sostituisce.
9. **Non ho prove che funzioni.** Il canale è nuovo: non posso promettere numeri e non ne invento.
   Quello che posso dire è che il percorso attuale ha **una prova documentata di fallimento** — la mamma
   del brief — e zero prove documentate di successo dal sito. Non è una garanzia: è un'asimmetria.

### Come si misura se ho torto — protocollo a 60 giorni

Una tesi che non si può falsificare non è una tesi (§16 di B, la prendo intera). Tre misure, tutte a
costo zero e tutte disponibili al titolare senza strumenti nuovi:

1. **Messaggi WhatsApp con il testo precompilato**, nei primi 60 giorni. È attribuzione diretta: quei
   messaggi non esistevano prima. **Se sono zero, la tesi è sbagliata e va rivista, non difesa.**
2. **Rapporto prove concordate → iscrizioni** sui contatti arrivati dal sito. Verifica la premessa
   vera: che la prova converta meglio di una richiesta fredda.
3. **Iscrizioni dirette senza prova.** Se crollano, la retrocessione di porta B è costata più del
   previsto e la regola cromatica si inverte in una riga.

Se dopo 60 giorni la misura 1 è zero e la 3 è calata, **il modo corretto di procedere è tornare
indietro, non aggiustare.**

### Alternative valutate e scartate

| Alternativa | Perché no |
|---|---|
| Testo sopra la fotografia con scrim (la scelta ovvia) | **Misurata:** 1,87:1 sul testo mono. Per portarla ad AA lo scrim spegne la foto |
| `<h1>` = *"Prima di iscriverti, vieni a provare."* (B) | Un'istruzione di funnel nell'asset tipografico più prezioso del sito; ripete la degradazione che B stessa critica. Diventa la domanda di porta A |
| Le porte in una fascia separata sotto la hero (C) | Aggiunge una cornice e ~90px senza aggiungere significato: le porte *sono* la hero |
| Tabella `Eventi` nuova (C) | Il beneficio vero è la semantica della data, e si ottiene cambiando l'etichetta del campo. Una tabella nuova senza CRUD chiederebbe al titolare un secondo modello mentale |
| Tenere il carosello e aggiungere la prova come slide | 7 secondi su 21 per il messaggio più importante; altezza non deterministica → salta la garanzia della piega; l'`<h1>` resta il titolo di una campagna |
| Barra sticky della prova sempre a schermo | Copre L0 (contenuto della pista sacro), si legge come pubblicità, e su mobile ruba 56px a ogni viewport della sessione |
| Route `/gare` per settembre | Non c'è nessun flusso da costruire: sarebbe un contenitore vuoto da mantenere |
| Orari dei corsi da Airtable adesso | Complessità per un problema che non abbiamo. La via è tracciata in §10.3 se servirà |

---

## 13 · Conformità al sistema, e criteri di accettazione

| Vincolo | Come è rispettato |
|---|---|
| **Un solo `<h1>`** | La hero statica ha l'unico `<h1>`, ed è il claim brand. **Oggi il vincolo è violato** (misurato): questa proposta lo ripristina. La fascia usa un `<h2>` `sr-only`; le porte sono `<article>` con `<h2>` che unisce criterio e promessa |
| **Max 1 fondale vivo per viewport** | **Zero** fondali vivi nel primo viewport: la fotografia è contenuto (L0), non fondale animato. Il video resta in `CtaFinale`, in un altro viewport |
| **Budget 1 prop L+1 su mobile** | Zero prop nel primo viewport. `TargaDorsale` e `Waveform` restano `mobileHide`; le mascotte non ci sono |
| **L0 sacro, mai coperto** | Niente si sovrappone a testo o CTA. La fotografia è **accanto** al testo su desktop e **sotto** su mobile, mai dietro |
| **WCAG 2.1 AA** | Contrasti **misurati sui pixel** (§3.2): peggiore 5,18:1. Mai `--stage-faint` su testo piccolo. Bersagli 48px misurati. Link esterno annunciato. **SC 2.2.2 risolto per sottrazione**: nel primo viewport non si muove più niente |
| **Tastiera** | 5 elementi focusabili su mobile, 12 su desktop, ordine = ordine DOM. Nessuna trappola: spariscono carosello, dot e roving tabindex |
| **`prefers-reduced-motion`** | Niente da disattivare nel primo viewport |
| **Alt text** | Fotografia della hero: **`alt` descrittivo**, non decorativa — *"Un bambino della scuola, con il casco, si allontana su un percorso segnato dal nastro; altri due bambini pedalano davanti a lui."* Veicola un messaggio, quindi si descrive |
| **Zero prove sociali inventate** | Nessun numero, nessuna testimonianza, nessun logo, nessuna scarsità. Le uniche cifre in pagina sono orari, età minima, numero di lezioni di prova e date: tutte verificate |
| **Livree** | Hero e fascia in `racing` (il brand padre firma il chrome, DS §1.7); `SezioneScuola` resta `scuola`; `/prova` in `scuola` |

**Bonus prestazionale.** La home perde un Client Component dal percorso critico (`HeroCampagne`:
`"use client"`, `setInterval`, `useStageParallax`, sei `useState`) e un `<video>` lazy dal primo
viewport, e guadagna un Server Component con un `<img priority>`. L'`<h1>` è nel markup statico e non
cambia dopo l'idratazione: LCP e CLS migliorano, e Google indicizza un titolo stabile invece del titolo
dell'ultima campagna attiva.

### Checklist di merge — verificabile senza opinioni

- [ ] `document.querySelectorAll('h1').length === 1` su `/`, testo `In bici, sicuri, insieme.`
- [ ] Le due porte **complete** (domanda, bottone, prezzo) sopra la piega a **375×553**, **375×635**,
      **390×659**, **1280×608**, **1440×780** — script di §4.5, non a occhio
- [ ] Nessuna CTA va a capo su nessuno dei cinque viewport (regola DS: truncation mai sulle CTA)
- [ ] Contrasto ≥ 4,5:1 su ogni testo <18px, misurato campionando i pixel dello screenshot
- [ ] Con `AIRTABLE_TOKEN` rimosso, la fascia rende comunque slot ① e ③, e il bottone WhatsApp o il suo
      fallback è presente
- [ ] Con tre record `SLOT=evento` in corso, la fascia ne mostra **uno** in primo piano e **uno** in riga
      "POI:"
- [ ] Con `oggi = 2026-09-27`, la fascia rende **due** slot su una riga piena, senza spazi vuoti
- [ ] Zero `<video>` e zero prop L+1 nel primo viewport; un solo `FondaleVivo` in pagina (`CtaFinale`)
- [ ] `/chi-siamo` e `/gli-amatori-triono` chiudono **ancora** con `Iscrivi tuo figlio` e non con la
      prova (prop `variant` su `CtaFinale`)
- [ ] `next build`: la home resta `○ Static` con `Revalidate 10m`

---

## 14 · Le cose che solo il committente può sciogliere

Le riporto perché tre di queste bloccano del copy che altrimenti va inventato — e non si inventa.

1. **Accetta l'emendamento a `PRODUCT.md`** (§1)? Tutto il resto dipende da qui. Non è una domanda di
   design: è una modifica al documento di brand.
2. **È disposto a perdere la hero come palcoscenico per le campagne**, e il video ambient in home?
   EVO-021 ed EVO-035 sono recenti: è una preferenza reale da verificare, non un dettaglio tecnico.
3. **`scuola-referente` è un nome proprio usabile in pubblico** (*"Ti risponde Luca in persona"*)?
4. **Vuole dichiarare un tempo di risposta su WhatsApp**, o preferisce non promettere niente? Io
   propongo di non promettere: non è un fatto accertato.
5. **La distinzione "venire a guardare" / "provare in sella" è vera come l'ho scritta** (§7.4)? Se
   venire a guardare è davvero libero, è una porta ancora più bassa della prova e va detta bene. Se non
   è vera, la card di `/contatti` va corretta oggi, a prescindere da quale proposta si sceglie.
6. **Le due gare del 12 e 26 hanno un orario pubblicabile? Il pubblico può venire a guardare?** Una
   riga di tabellone senza ora è monca, e "si può venire a vedere" sarebbe un secondo invito gratuito
   che oggi il sito non fa.
7. **Narni Sport Night: orario, età minima, ed esiste materiale stampato?** Se sì, `/prova` deve
   esistere **prima** che vada in stampa: è il vincolo di data più stringente di tutto il lavoro.
8. **La fotografia va bene?** `inizio-lezione.jpg` mostra bambini di spalle, senza volti riconoscibili.
   Se esiste una foto migliore con lo stesso vincolo di composizione (§3.1), si sostituisce in una riga.
