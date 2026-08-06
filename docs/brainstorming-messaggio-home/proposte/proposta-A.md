# La home come palcoscenico, con una regia

Architettura del messaggio della homepage di trionoracing.it.

---

## 1 · Tesi e principio guida

> **Tesi.** La hero non deve portare quattro messaggi: deve portarne uno, per sempre. Tutto ciò che
> ha una data, una scadenza o un numero di telefono scende di un livello, in una **fascia di regia
> permanente** subito sotto la hero, che sostituisce il ticker morto. Il messaggio non si contende
> lo spazio: si stratifica.

**Principio guida — due livelli, due orologi.**

| Livello | Che cosa contiene | Chi lo scrive | Ogni quanto cambia |
|---|---|---|---|
| **Marca** (hero) | Chi siamo, per chi, la promessa, le due porte | Il codice | Mai, o quasi mai |
| **Regia** (fascia sotto la hero) | La prova, il prossimo appuntamento, gli orari | Codice + Airtable | Di continuo, da solo |

Non sto inventando un livello nuovo. **Il design system APEX ce l'ha già e si chiama L+2, "Regia":
HUD, ticker, countdown, progress — "chrome broadcast, sempre sopra"** (DS-APEX §4). Il principio n. 1
del sistema è *"La gara è il chrome: telemetria, ticker, HUD non sono decorazione, sono l'interfaccia.
Il dato è cittadino di prima classe"*.

Oggi quel livello esiste in home ed è un cadavere: `HomeTicker` è una marquee `aria-hidden`,
hardcoded, che dal 29 giugno annuncia un evento del 28 giugno. Il livello giusto per il messaggio
operativo è già in pagina, già nel sistema, già nel posto giusto — semplicemente non fa il suo
lavoro. **Questa proposta non aggiunge una fascia: dà un mestiere alla fascia che c'è.**

### La mossa che rende possibile tutto il resto

**La hero smette di ruotare.** `HeroCampagne` non è più il consumatore di `Comunicazioni Hero`:
lo diventa la fascia di regia. La hero torna a essere statica, deterministica, con un `<h1>` che
non cambia mai.

Non è un capriccio estetico, è la precondizione tecnica della proposta:

- **Un'altezza deterministica è l'unica che permette di garantire dove cade la piega.** Con la hero
  dinamica, l'altezza del primo viewport dipende da quanti caratteri l'amministratore ha scritto in
  `TITOLO` e `SOTTOTITOLO` su Airtable. Una promessa del tipo "la porta della prova è nel primo
  viewport" non è mantenibile se un titolo di campagna può crescere di due righe. Con la hero
  statica, l'altezza la decido io e la posso verificare (§4).
- **Oggi l'`<h1>` della home è il titolo della campagna attiva**, non il claim di marca — `HeroCampagne.tsx:253`,
  `const TitleTag = i === 0 ? "h1" : "p"` (il commento in testa al file dice il contrario: è stale).
  Il claim "In bici, sicuri, insieme." è degradato a `<p>` da 15px. Il vincolo "un solo `<h1>`, il
  claim brand" oggi **non è rispettato**: questa proposta lo ripristina.
- **Quando c'è una campagna attiva la hero perde tutto il resto**: il sottotitolo che spiega cos'è la
  scuola (4 anni, maestri federali, ciclodromo), le due CTA, l'HUD. Restano solo il titolo della
  campagna e le sue CTA. Il test dei dieci secondi oggi dipende da quale slide sta girando.
- Una hero statica è un **Server Component**: si elimina il `"use client"`, l'`setInterval`, il
  parallax e i tre `useState` dal percorso critico dell'LCP.

Il costo — perdiamo il palcoscenico grande per le campagne — è reale e lo dichiaro in §10 e §12.

---

## 2 · Diagnosi in una riga

La home ha **una sola porta ripetuta quattro volte, ed è la più alta che abbiamo**: registrazione
account, dati anagrafici del genitore, dati del bambino, certificato medico, pagamento. La mamma del
brief non ha sbagliato: ha fatto esattamente quello che il sito le ha detto di fare. La parola
"prova" non compare in home nemmeno una volta.

Non serve spostare la porta alta. Serve **aprirne una bassa accanto**, e renderla impossibile da non
vedere.

---

## 3 · L'architettura in tre strati

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR (sticky, livrea racing)          — chrome       │  60px
├─────────────────────────────────────────────────────────┤
│                                                          │
│  HERO — MARCA                                            │
│  statica · un solo h1 · due porte · zero date            │  altezza
│  "In bici, sicuri, insieme."                             │  deterministica
│  [Prenota una prova gratuita] [Iscrivi tuo figlio]       │
│                                                          │
├─────────────────────────────────────────────────────────┤ ← LA PIEGA CADE QUI DENTRO
│  FASCIA REGIA — OPERATIVO (sostituisce HomeTicker)       │  ~104px desktop
│  ① LA PROVA   ② PROSSIMO APPUNTAMENTO   ③ ALLENAMENTI    │  ~88px/riga mobile
├─────────────────────────────────────────────────────────┤
│  SEZIONI — PERCORSO (invariate nella struttura)          │
│  Scuola · Come raggiungerci · Amatori · Marathon · CTA   │
└─────────────────────────────────────────────────────────┘
```

**Regola di ripartizione, applicabile senza discutere:**

> Se un contenuto ha una data, un orario, un numero di telefono o una scadenza, **non entra nella
> hero**. Vive nella regia. Se un contenuto sarà vero anche fra tre anni, **non entra nella regia**.
> Vive nella hero o nelle sezioni.

**Regola di responsabilità (la più importante per l'operatività):**

> La **struttura** della fascia è cablata nel codice: gli slot ① e ③ esistono sempre, anche con
> Airtable spento, anche senza variabili d'ambiente, anche in preview. Airtable **modula le parole**
> dello slot ① e **riempie** lo slot ②, ma non può cancellare una porta.
> *Il codice garantisce la presenza. Airtable modula l'enfasi.*

---

## 4 · Il rischio principale, affrontato di petto

**Il rischio.** Se la porta della prova non è visibile nel primo viewport — soprattutto su mobile a
375px — questa proposta fallisce il test della mamma e va bocciata. È il punto debole strutturale di
qualunque tesi che sposti l'operativo sotto la hero.

**La risposta in due mosse.**

**Mossa 1 — la prova è anche nella hero, ma come *azione*, non come *informazione*.**
La hero ha due CTA e la **primaria è la prova**. Il livello operativo non è "dove sta la prova": è
"dove stanno i dettagli, gli orari, le date e i canali". La hero dice *cosa puoi fare*, la regia dice
*come e quando*. Questa non è una deroga alla tesi: è la tesi. Le CTA della hero sono evergreen —
non cambiano mai, non scadono mai, non dipendono da Airtable. Tutto ciò che si data sta sotto.

**Mossa 2 — la piega deve cadere *dentro* la fascia, mai prima.**
Non mi serve la fascia intera nel primo viewport. Mi serve che **la prima riga della fascia (lo slot
① LA PROVA) sia leggibile e visibilmente tagliata**, così l'occhio sa che sotto continua. È il
classico *fold hint*, ed è una feature, non un compromesso.

Lo trasformo in un vincolo numerico verificabile:

> **Criterio della piega.** Il bordo superiore della fascia deve trovarsi **almeno 72px sopra la
> piega** in tutti e quattro i viewport di riferimento. 72px = etichetta mono + riga principale
> dello slot ① leggibili.

### La matematica

Misure reali dal codice: navbar `height: 60px` (`apex.css:78`), ticker sostituito `height: 34px`
(`apex.css:131`).

Altezze proposte (sostituiscono `min-h-[520px] lg:min-h-[640px]` di `HeroCampagne`):

| | mobile (<640px) | desktop (≥1024px) |
|---|---|---|
| `min-height` hero | `clamp(360px, 56svh, 520px)` | `clamp(460px, 62svh, 700px)` |
| `padding-block` hero | `clamp(24px, 3.5vh, 40px)` | `clamp(28px, 4vh, 64px)` |
| altezza fascia | 88px/riga | 104px (riga unica a 3 colonne) |

Verifica sui quattro viewport (altezza *usable*: viewport meno chrome del browser; `svh` = small
viewport height, quella con tutte le barre visibili — l'ipotesi peggiore, giusta):

| Dispositivo | usable | hero (contenuto vs min-h) | top fascia | margine sopra la piega | esito |
|---|---|---|---|---|---|
| **iPhone SE, 375×667** | ~553 | 398 (contenuto) | 458 | **95px** | ✅ slot ① intero + accenno slot ② |
| **iPhone 13/14, 375×812** | ~715 | 400 (min-h 56svh) | 460 | **255px** | ✅ slot ①②③ visibili |
| **Laptop 1280×720** | ~600 | 438 (contenuto) | 498 | **102px** | ✅ fascia praticamente intera |
| **Laptop 1440×900** | ~780 | 484 (min-h 62svh) | 544 | **236px** | ✅ fascia intera + 132px di respiro |

Il caso critico (iPhone SE) passa con 95px di margine, e passa **perché** su mobile tolgo dalla hero
la riga di microcopy (§7): quella riga dice esattamente ciò che dice il sotto-titolo dello slot ①
della fascia, che ora è visibile. Non è una rinuncia, è de-duplicazione: lo stesso fatto detto una
volta sola, all'altezza giusta.

**Perché questa garanzia regge solo con la hero statica.** Le altezze della tabella sono
riproducibili perché il contenuto della hero è nel codice. Con la hero dinamica, un titolo di
campagna di due righe in più sposta la fascia di ~130px e il caso iPhone SE va in negativo. Questa è
la ragione tecnica per cui la rotazione va rimossa, non una preferenza estetica.

**Come si verifica in review** (nessuna stima, misura vera):

```js
const f = document.querySelector('[data-regia]').getBoundingClientRect().top;
window.innerHeight - f >= 72   // deve essere true sui 4 viewport
document.querySelectorAll('h1').length === 1
```

---

## 5 · Mappa dei quattro pubblici

### ① Genitore curioso — "vorrei fargli provare, non voglio ancora iscriverlo"

| | |
|---|---|
| **Cosa cerca** | "Si può provare? Serve una bici da corsa? Devo pagare qualcosa? Come mi presento?" |
| **Dove atterra** | `/` (organico, passaparola, volantino) |
| **La sua porta** | Hero, CTA primaria **"Prenota una prova gratuita"** → `/prova`. Rinforzo: fascia slot ①, **"Scrivi su WhatsApp"** → `wa.me` |
| **Come la riconosce** | È l'unico elemento pieno color accento della hero, ed è il primo. La parola "gratuita" è nel bottone, "gratuite" nel sottotitolo, "gratuite" nell'etichetta di slot ①: tre volte nel primo viewport, mai due volte nella stessa frase |
| **Clic all'obiettivo** | **2** per la via informata: hero → `/prova` → bottone WhatsApp (arriva in chat sapendo già cosa portare e che giorno scegliere). **1** per la via veloce: fascia slot ① → WhatsApp |
| **Momenti di dubbio rimossi** | "serve la bici giusta?" → microcopy hero + slot ①: *una bici qualsiasi e il casco* · "posso presentarmi?" → *si concorda prima* · "quale giorno?" → slot ③: *martedì strada, giovedì MTB, 17:00–18:30* |

### ② Genitore già deciso — "so cos'è, voglio iscrivere"

| | |
|---|---|
| **Cosa cerca** | Il bottone di iscrizione, subito, senza leggere |
| **Dove atterra** | `/` oppure diretto su `/portale/iscrizioni` |
| **La sua porta** | Navbar sticky, CTA **"Iscrivi tuo figlio"** (presente in ogni viewport di ogni pagina) + hero CTA secondaria, stessa label |
| **Come la riconosce** | Colore diverso: nel sistema di livree, la porta alta è sempre `--support` (accent-2), la porta bassa sempre `--primary` (accent). Due porte, due tinte, nessuna ambiguità (§8) |
| **Clic all'obiettivo** | **1** (desktop: nav; mobile: hero CTA secondaria, che è sopra la piega — verificato in §4) |

### ③ Società / famiglia interessata alle gare di settembre

| | |
|---|---|
| **Cosa cerca** | Data, disciplina, categoria, luogo, e **come ci si iscrive** |
| **Dove atterra** | `/` (cercando "gara giovanissimi Terni"), o via passaparola tra società |
| **La sua porta** | Fascia slot ②, **PROSSIMO APPUNTAMENTO** |
| **Come la riconosce** | È l'unico blocco della home con una data in evidenza. L'etichetta mono la separa dagli altri due slot |
| **Clic all'obiettivo** | **0.** La risposta *è* lo slot: `12 set · Giovanissimi su strada` / `Ciclodromo Renato Perona, Terni · iscrizioni tramite le società, canali FCI`. Non costruiamo un flusso che non esiste, e diciamo esplicitamente qual è il canale vero. **1** clic solo se esiste un URL reale (locandina, pagina FCI, evento social) messo su Airtable |
| **Effetto collaterale voluto** | La riga "iscrizioni tramite le società" impedisce alle famiglie di confondere la gara con l'iscrizione alla scuola: protegge la porta della prova dal traffico sbagliato |

### ④ Amatore / agonista

| | |
|---|---|
| **Cosa cerca** | Livello tecnico, squadra, tesseramento, Marathon 209 |
| **Dove atterra** | `/` o `/gli-amatori-triono` |
| **La sua porta** | Navbar **"Amatori"** (primo viewport, sempre) + `SezioneAmatori` in pagina. Nella hero è annunciato dall'eyebrow `SCUOLA DI CICLISMO E SQUADRA · TERNI` e dalla chiusa del sottotitolo *"chi cresce continua con la squadra"* |
| **Come la riconosce** | La navbar è l'unica superficie che indirizza esplicitamente un pubblico adulto nel primo viewport; nessuno degli altri tre pubblici usa la navbar come porta primaria, quindi non c'è collisione |
| **Clic all'obiettivo** | **1** (nav → `/gli-amatori-triono`); **2** fino a `/contatti?motivo=tesseramento` |

**Nessuna porta si confonde con un'altra**, perché ognuna ha un canale visivo diverso: la prova è
*accento pieno*, l'iscrizione è *support pieno*, le gare sono *etichetta mono + data*, gli amatori
sono *navigazione*.

---

## 6 · Wireframe — desktop (≥1024px)

### Schermo 1 — il primo viewport (1440×900, usable ~780px)

```
╔══════════════════════════════════════════════════════════════════════════╗ 0
║ [logo]   SCUOLA  AMATORI  CHI SIAMO  MARATHON 209  MAESTRO  CONTATTI     ║
║                                              [Accedi] ⟨Iscrivi tuo figlio⟩║ 60   livrea racing
╠══════════════════════════════════════════════════════════════════════════╣
║  ░ fondale vivo (video Airtable slot home-hero, duotone) ░  · 54 KM/H ░   ║      L−2 · unico
║                                                                          ║      per viewport
║  SCUOLA DI CICLISMO E SQUADRA · TERNI                        ╭─────╮     ║      eyebrow mono
║                                                              │Nino │     ║      L+1 · 1 prop
║  IN BICI, SICURI,                                            │ +   │     ║
║  INSIEME.                                            ← h1    │Vitt.│     ║      64px, accent
║                                                              ╰─────╯     ║      su "INSIEME"
║  Bambini dai 4 anni, maestri federali, al Ciclodromo Renato Perona di    ║
║  Terni. Si comincia con due lezioni di prova gratuite; chi cresce        ║
║  continua con la squadra.                                                ║
║                                                                          ║
║  ▰▰ Prenota una prova gratuita →    ⟨ Iscrivi tuo figlio ⟩                ║      primary + support
║  Serve solo una bici qualsiasi e il casco. Si concorda prima, su WhatsApp.║      microcopy
║                                                                          ║ 544
╠══════════════════════════════════════════════════════════════════════════╣
║ LA PROVA          │ PROSSIMO APPUNTAMENTO   │ ALLENAMENTI                 ║      FASCIA REGIA
║ Due lezioni       │ 12 set · Giovanissimi   │ Martedì strada ·            ║      livrea racing
║ gratuite, senza   │ su strada               │ Giovedì MTB                 ║      hairline, no
║ iscriversi.       │ Ciclodromo R. Perona,   │ 17:00–18:30, Ciclodromo     ║      fondale vivo
║ Basta una bici    │ Terni · iscrizioni      │ Renato Perona, Terni        ║
║ qualsiasi e il    │ tramite società, FCI    │                             ║
║ casco.            │ Poi: 26 set · MTB       │ Come funziona la Scuola →   ║
║ ▰▰ Scrivi su WhatsApp                                                     ║ 648
╚══════════════════════════════════════════════════════════════════════════╝
                                    ~132px di respiro fino alla piega (780)
```

### Schermi successivi (struttura invariata rispetto a oggi)

| # | Sezione | Modifica |
|---|---|---|
| 2 | `SezioneScuola` (livrea scuola) | Card *Quando/Dove*: CTA da `Iscrivi tuo figlio` + `Scopri di più` → **`Prenota una prova gratuita`** (primary) + **`Iscrivi tuo figlio`** (support); "Scopri di più sulla Scuola" diventa link testuale |
| 3 | `ComeRaggiungerci` | invariata |
| 4 | `SezioneAmatori` | invariata — porta del pubblico ④ |
| 5 | `SezioneMarathon` | invariata |
| 6 | `CtaFinale` | CTA da `Iscrivi tuo figlio` + `Accedi` → **`Prenota una prova gratuita`** + **`Iscrivi tuo figlio`**; "Accedi" esce (è già in navbar, non è una conversione) |

**Conteggio densità, primo viewport desktop** — per peso, non per numero:

| Tier | Elementi | n |
|---|---|---|
| **T1 — dominante** | `<h1>` | **1** |
| **T2 — azione piena accento** | CTA hero "Prenota una prova gratuita" · CTA fascia "Scrivi su WhatsApp" | **2** *(stesso messaggio: si rinforzano, non competono)* |
| **T3 — contesto** | sottotitolo · CTA nav (support, tinta diversa) · slot ② · slot ③ | 4 |
| **T4 — chrome e decoro** | logo · 6 link nav · "Accedi" · eyebrow · microcopy · mascotte · telemetria ghost | 12 |

**Decisioni reali offerte all'utente nel primo viewport: due.** *Provare* o *iscriversi*. Tutto il
resto è contesto o cornice. Oggi le decisioni offerte sono una sola, ed è quella sbagliata per il
70% di chi arriva.

---

## 7 · Wireframe — mobile 375px

### iPhone SE 375×667 (usable ~553px) — il caso peggiore

```
┌───────────────────────────────────┐ 0
│ [logo]                        [☰] │ 60      navbar sticky
├───────────────────────────────────┤
│ ░ fondale vivo · duotone ░        │
│ SCUOLA DI CICLISMO E SQUADRA      │         eyebrow (1 riga)
│ · TERNI                           │
│                                   │
│ IN BICI, SICURI,          ╭─────╮ │         h1, 32px, 3 righe
│ INSIEME.                  │ Nino│ │         mascotte = 1 solo
│                           ╰─────╯ │         prop L+1 (budget ok)
│ Bambini dai 4 anni, maestri       │
│ federali, al Ciclodromo Renato    │         sottotitolo 15px
│ Perona di Terni. Si comincia con  │         4 righe
│ due lezioni di prova gratuite;    │
│ chi cresce continua con la squadra│
│                                   │
│ ▰▰ Prenota una prova gratuita  → │         primary, full width
│ ⟨  Iscrivi tuo figlio           ⟩ │ 458     support, full width
├───────────────────────────────────┤
│ LA PROVA                          │         ← slot ① intero
│ Due lezioni gratuite,             │
│ senza iscriversi.                 │
│ Basta una bici qualsiasi e il     │
│ casco. Si concorda prima.         │
│ ▰▰ Scrivi su WhatsApp             │ 546
├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤ 553 ← PIEGA (accenno di slot ②)
│ PROSSIMO APPUNTAMENTO             │
│ 12 set · Giovanissimi su strada   │
│ …                                 │
└───────────────────────────────────┘
```

**Cosa è nel primo viewport su iPhone SE:** eyebrow, `<h1>`, sottotitolo intero, **entrambe** le CTA
della hero, **lo slot ① della fascia per intero, WhatsApp incluso**, e il taglio dello slot ② che
invita a scorrere. Nella hero mobile **non c'è** la riga di microcopy: il suo contenuto è la
sotto-riga dello slot ① lì sotto.

**Conteggio densità, primo viewport mobile:**

| Tier | Elementi | n |
|---|---|---|
| **T1** | `<h1>` | **1** |
| **T2** | CTA "Prenota una prova gratuita" · CTA "Scrivi su WhatsApp" | **2** *(stesso messaggio)* |
| **T3** | sottotitolo · CTA "Iscrivi tuo figlio" | 2 |
| **T4** | logo · hamburger · eyebrow · mascotte | 4 |

**Decisioni offerte: due.** Su 375px non c'è nessun elemento in più rispetto a desktop, solo meno
contesto — che è esattamente come dovrebbe essere.

**Conformità APEX su mobile:** 1 solo fondale vivo (hero); **1 solo prop L+1** (il duo mascotte —
`TargaDorsale` e `Waveform` restano `mobileHide` come oggi); L−1 ridotto al dominante
(`TelemetriaGhost`); la fascia **non aggiunge nessun prop e nessun fondale**, è superficie piatta
con hairline. Contenuto della pista (L0) mai coperto.

---

## 8 · Copy della hero, parola per parola

```
eyebrow    SCUOLA DI CICLISMO E SQUADRA · TERNI

h1         In bici, sicuri, **insieme.**

sub        Bambini dai 4 anni, maestri federali, al Ciclodromo Renato Perona
           di Terni. Si comincia con due lezioni di prova gratuite; chi cresce
           continua con la squadra.

CTA 1      Prenota una prova gratuita →          [primary, accent pieno]
CTA 2      Iscrivi tuo figlio                    [support, accent-2 pieno]

microcopy  Serve solo una bici qualsiasi e il casco. Si concorda prima, su WhatsApp.
           (solo ≥640px — su mobile il fatto vive nello slot ① della fascia)
```

**Perché ogni pezzo è così.**

**Eyebrow.** Tre informazioni in cinque parole: che cosa siamo (*scuola*), che cosa siamo anche
(*squadra* → è la porta semantica del pubblico ④), dove (*Terni*). Nessuna data, quindi non invecchia.
Rimpiazza `TRIONO RACING / DAL 2015 · TERNI` perché "dal 2015" è vero per la squadra ma non per la
scuola (4 anni), e l'anno non aiuta nessuno dei quattro pubblici a decidere.

**H1 — resta `In bici, sicuri, insieme.`** Il brief chiede di non riaprirlo senza un motivo forte e
non ce n'è uno: è breve, memorizzabile, e porta due dei quattro gradini della belief ladder
(*sicuri* → Sicurezza, *insieme* → Community). L'accento va su **insieme**, non su *sicuri*: la
sicurezza è il prerequisito, l'appartenenza è la promessa. Il cambiamento vero non è il testo, è che
**adesso è davvero un `<h1>` e non cambia più ogni sette secondi**.
*Alternativa considerata e scartata:* un h1 che portasse anche il percorso ("Si comincia in
sicurezza. Si arriva lontano.") — più completo ma generico, e butta via l'equity di un claim già in
produzione. Il percorso lo porta il sottotitolo.

**Sottotitolo — è qui che si vince il test dei dieci secondi.** 156 caratteri, cinque fatti
verificati e zero aggettivi: *dai 4 anni* (`SezioneScuola`, verificato) · *maestri federali*
(verificato) · *Ciclodromo Renato Perona di Terni* (verificato) · **due lezioni di prova gratuite**
(fatto accertato n. 1) · *chi cresce continua con la squadra* (positioning `PRODUCT.md`). Un genitore
che legge solo questa riga ha già in mano la frase da ricordare **e** sa che può provare gratis.
Nessun numero inventato, nessuna testimonianza, nessuna scarsità: non ne abbiamo, e non ne servono.

**"Prenota una prova gratuita".** *Prenota* è deliberato e fa un lavoro preciso: dice al genitore che
c'è un passaggio da fare **prima** di presentarsi (fatto accertato n. 2). "Vieni a provare" produrrebbe
esattamente il comportamento che il committente dice non funzionare. *Gratuita* al singolare perché
il bottone è la prima lezione; il plurale ("due lezioni") sta nel sottotitolo, dove non compete con
l'azione.

**"Iscrivi tuo figlio".** Invariata: è la label che il pubblico ② già cerca, e cambiarla dopo che è
in quattro punti del sito sarebbe un costo senza beneficio. Cambia solo il *peso*, non il testo.

**Microcopy.** Undici parole che smontano le due obiezioni più costose: *«non ha la bici giusta»* e
*«posso presentarmi giovedì?»*. È il punto in cui il fatto accertato n. 3 diventa conversione.

### Il sistema di colore delle CTA — due porte, due tinte

Regola valida su tutto il sito pubblico, verificabile con un grep:

| Ruolo | Variante APEX | Racing | Scuola | Dove |
|---|---|---|---|---|
| **Porta bassa** — provare, contattare | `apex-cta--primary` (accent pieno) | ciano `#37C8FF` | giallo `#F4E718` | hero, fascia ①, `SezioneScuola`, `CtaFinale`, `/prova`, `/la-scuola` |
| **Porta alta** — iscriversi, pagare | `apex-cta--support` (accent-2 pieno) | giallo `#F4E718` | arancio `#FF8A3D` | navbar, hero CTA2, `SezioneScuola`, `CtaFinale` |
| **Terziario** — approfondire | `apex-cta--ghost` | bordo accento | bordo accento | ovunque |

La coerenza in APEX è **per ruolo, non per tinta** — è il principio n. 3 del sistema ("i componenti
sono ciechi ai colori"). Nel primo viewport della home ci sono esattamente **tre superfici piene: due
ciano che dicono "prova", una gialla che dice "iscriviti"**. Un solo cambio di variante nella navbar
(`primary` → `support`, `ApexNavBar.tsx:79`) elimina l'ambiguità su tutte le pagine.

**La fascia di regia dichiara `data-livery="racing"`**, non `scuola`: è chrome di regia, e il DS
prescrive che *"il brand padre firma tutto"* per il chrome (§1.7, come navbar, ticker e footer). Così
il ciano della fascia e il ciano della hero sono lo stesso segnale.

---

## 9 · La Fascia Regia — anatomia e copy

Componente nuovo `src/components/home/FasciaRegia.tsx`, **Server Component** (nessuno stato,
nessuna animazione), che sostituisce `HomeTicker` nella stessa posizione.

**Perché non un ticker.** Il ticker è `aria-hidden` (contenuto ridondante per definizione), scorre in
automatico senza controlli — sotto WCAG 2.1 SC 2.2.2 un movimento >5s va poter fermare, e oggi si
ferma solo sotto `prefers-reduced-motion` — e non può contenere link. Una porta di conversione non
può stare in una marquee decorativa. La fascia usa lo **stesso linguaggio visivo** (banda a tutta
larghezza, hairline sopra e sotto, etichette mono uppercase, superficie `--stage-surface`) ma è
**ferma, leggibile, cliccabile e annunciata**.

```html
<section data-regia data-livery="racing" aria-labelledby="regia-h">
  <h2 id="regia-h" class="sr-only">In breve</h2>
  <!-- 3 slot: grid auto-fit desktop / stack mobile -->
</section>
```

### Slot ① — LA PROVA · cablato nel codice, indistruttibile

```
etichetta   LA PROVA
titolo      Due lezioni gratuite, senza iscriversi.
sotto       Basta una bici qualsiasi e il casco. Si concorda prima.
azione      ▰▰ Scrivi su WhatsApp          → wa.me/…  [primary, accent pieno]
```

- **Non dipende da Airtable.** Se `getComunicazioniHeroAttive()` ritorna `[]` — env mancanti,
  Airtable giù, preview senza variabili — questo slot c'è comunque. È la garanzia strutturale
  contro il ripetersi del problema del brief.
- **Degrado del canale:** se `getSiteSettings()["scuola-telefono"]` non è disponibile, l'azione
  diventa `Come funziona la prova → /prova` (stesso peso, stessa posizione, nessun buco, nessun link
  rotto). Entrambi gli helper sono già SAFE per costruzione.
- **Airtable può cambiarne le parole** (etichetta, titolo, sotto-riga) ma **non l'azione**: il
  bottone WhatsApp è strutturale.

### Slot ② — PROSSIMO APPUNTAMENTO · da Airtable, uno solo alla volta

```
etichetta   PROSSIMO APPUNTAMENTO            ← EYEBROW
titolo      12 set · Giovanissimi su strada  ← TITOLO (supporta **accento**)
sotto       Ciclodromo Renato Perona, Terni · iscrizioni tramite le società,
            sui canali federali FCI          ← SOTTOTITOLO
coda        Poi: 26 set · Giovanissimi in MTB   ← generata, max 1 riga
azione      (solo se CTA_URL è valorizzato) Locandina → [link testuale, non bottone]
```

**Regola anti-bacheca, imposta dal codice e non dalla disciplina:** fra tutti i record in corso con
`SLOT = evento`, la fascia ne mostra **esattamente uno** in primo piano — quello con `VALIDO_A` più
vicino — più **al massimo una** riga "Poi:". Gli altri restano in coda, invisibili. L'amministratore
può attivare dieci comunicazioni: la home ne mostrerà sempre una e mezza. **La bacheca è
strutturalmente impossibile.**

Se non esiste nessun URL reale, lo slot resta **testo puro**: nessun link finto, nessun vicolo cieco.

### Slot ③ — ALLENAMENTI · cablato nel codice

```
etichetta   ALLENAMENTI
titolo      Martedì strada · Giovedì MTB
sotto       17:00–18:30, Ciclodromo Renato Perona, Terni
azione      Come funziona la Scuola →  /la-scuola   [link testuale]
```

Sono i dati che oggi vivono due schermi più in basso, nella card *Quando/Dove* di `SezioneScuola`. Un
genitore decide "possiamo farcela?" prima di decidere "ci proviamo?": l'orario **deve** stare sopra
la piega. Restano anche nella sezione, dove hanno il contesto.
*Alternativa scartata:* slot ③ = "Il percorso: Scuola → Amatori → Marathon" (servirebbe il pubblico
④). Scartata perché toglie dal primo viewport l'informazione operativa più utile per il pubblico ①,
che è quello che stiamo cercando di sbloccare. Il pubblico ④ ha la sua porta in navbar.

### Comportamento e accessibilità

- **Nessuna animazione, nessuna rotazione, nessun timer** → SC 2.2.2 non si applica; niente da
  mettere in pausa.
- `sr-only` heading + tre `<article>` con la propria etichetta → uno screen reader legge tre blocchi
  chiari, non una stringa che scorre.
- Bersagli tattili ≥44px; ordine di tabulazione = ordine di lettura; focus-visible dal DS.
- `prefers-reduced-motion`: nulla da disattivare, è già ferma.
- Contrasto: etichette mono in `--stage-muted` (#8A94B8 su #030818, ~6.7:1) — **mai
  `--stage-faint`**, che sotto AA non passa sul testo piccolo.
- Desktop `grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))` → con 2 slot si ridistribuisce
  da sola (§11); mobile `grid-cols-1` esplicito (mai `grid` senza colonna di base, che overflowa).

---

## 10 · I tre eventi di settembre

### Principio: due dei tre sono annunci, uno è una porta

| Evento | Natura reale | Dove vive | Perché |
|---|---|---|---|
| **12 set** · gara strada Giovanissimi | annuncio | slot ② | Iscrizioni via FCI tra società: non c'è nulla da far fare al visitatore |
| **26 set** · gara MTB Giovanissimi | annuncio | slot ② | idem |
| **19 set** · Narni Sport Night | **porta** | **slot ①** | Non è un evento a cui assistere: è la lezione di prova portata in città, con le bici fornite da noi |

**Narni non è il terzo evento: è la seconda istanza della prova.**

È il fatto più prezioso di tutto il brief e catalogarlo come "evento" lo sprecherebbe. Narni Sport
Night rimuove *tutte* le barriere residue della prova: non serve nemmeno la bici, non serve andare al
ciclodromo, non serve prenotare — basta passare in centro. È letteralmente la nostra porta più
bassa, per una sera. Quindi **non prende uno slot suo: si sovrappone allo slot ①**, che è già la
porta della prova, e ne cambia le parole per diciannove giorni.

**Come si realizza (record Airtable, `SLOT = prova`):**

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
(`HeroCampagne.tsx:44`): il parser si sposta nella fascia insieme al resto. Zero codice nuovo.

Il **20 settembre lo slot ① torna da solo** al suo testo permanente. Nessuno deve ricordarsi di
spegnere niente. È la dimostrazione più pulita del principio di auto-scadenza.

**Effetto sul primo viewport dall'1 al 19 settembre:** due porte della prova visibili insieme —
*«puoi provare al ciclodromo»* (bottone WhatsApp) e *«oppure vieni a trovarci in città il 19»*. Si
rinforzano, non si contendono lo spazio, perché sono **lo stesso slot**.

### I due annunci-gara

Servono al pubblico ③ e vanno detti bene, ma non devono costare niente e non devono creare
aspettative false.

```
Record A  SLOT=evento · EYEBROW "GARA · STRADA"
          TITOLO "12 set · Giovanissimi su strada"
          SOTTOTITOLO "Ciclodromo Renato Perona, Terni · iscrizioni tramite
                       le società, sui canali federali FCI"
          VALIDO_DA 2026-08-20 · VALIDO_A 2026-09-12 · PRIORITA 10

Record B  SLOT=evento · EYEBROW "GARA · MOUNTAIN BIKE"
          TITOLO "26 set · Giovanissimi in MTB"
          SOTTOTITOLO  (identico)
          VALIDO_DA 2026-08-20 · VALIDO_A 2026-09-26 · PRIORITA 20
```

`VALIDO_A` = **il giorno dell'evento**. Il record muore da solo il giorno dopo. Non serve nessun
campo nuovo per la data: la semantica "valido fino al" e "si svolge il" coincidono perfettamente per
un evento, e questa coincidenza è ciò che rende il sistema a manutenzione zero.

**Nessuna route `/gare`.** Il fatto accertato n. 6 dice che non c'è nessun flusso da costruire; una
pagina che ripete tre righe di slot sarebbe un contenitore vuoto da mantenere. Se esiste una
locandina o una pagina federale, si incolla l'URL in `CTA_URL` e lo slot diventa cliccabile; se non
esiste, resta testo.

### Timeline completa — cosa vede un visitatore, giorno per giorno

| Periodo | Slot ① | Slot ② | Slot ③ | Colonne |
|---|---|---|---|---|
| fino al 19 ago | Prova (permanente) | *(vuoto)* | Allenamenti | **2** |
| 20 ago – 31 ago | Prova (permanente) | 12 set strada · *Poi: 26 set MTB* | Allenamenti | 3 |
| 1 set – 12 set | **Narni 19 set** | 12 set strada · *Poi: 26 set MTB* | Allenamenti | 3 |
| 13 set – 19 set | **Narni 19 set** | 26 set MTB | Allenamenti | 3 |
| 20 set – 26 set | Prova (permanente) | 26 set MTB | Allenamenti | 3 |
| **dal 27 set** | Prova (permanente) | *(vuoto)* | Allenamenti | **2** |

Nessuna riga di questa tabella richiede che una persona faccia qualcosa in una certa data.

---

## 11 · Degrado al 27 settembre

Il 27 settembre alle 00:00, `isComunicazioneInCorso()` smette di far passare i record: `oggi >
VALIDO_A`. La funzione esiste già, è pura ed è testata (`comunicazioni-hero.ts:64`).

**Cosa resta in pagina:**

```
┌──────────────────────────────────────────────────────────────┐
│ LA PROVA                        │ ALLENAMENTI                 │
│ Due lezioni gratuite,           │ Martedì strada · Giovedì MTB │
│ senza iscriversi.               │ 17:00–18:30, Ciclodromo      │
│ Basta una bici qualsiasi        │ Renato Perona, Terni         │
│ e il casco. Si concorda prima.  │                              │
│ ▰▰ Scrivi su WhatsApp           │ Come funziona la Scuola →    │
└──────────────────────────────────────────────────────────────┘
```

**Perché non si apre un buco:**

1. Gli slot superstiti sono **cablati nel codice**: non possono mancare.
2. La griglia è `auto-fit` con `minmax(260px, 1fr)`: due slot occupano l'intera larghezza da soli,
   nessuno spazio vuoto, nessuna colonna fantasma. È il degrado del layout, non un caso da gestire.
3. **L'altezza della fascia non cambia** (una riga desktop, due righe mobile invece di tre): la
   posizione della piega calcolata in §4 resta valida — anzi migliora su mobile.
4. La hero non si accorge di niente: è statica.

**Degrado in condizioni peggiori (la vera prova del nove):**

| Guasto | Cosa succede |
|---|---|
| Airtable irraggiungibile o env mancanti | Fascia con slot ① e ③. **La porta della prova c'è.** |
| `scuola-telefono` non impostato | Slot ① mostra `Come funziona la prova → /prova` |
| Nessun `IMMAGINE_URL` / video hero assente | `FondaleVivo` → poster/fondale statico (già gestito) |
| JavaScript disattivato o lento | La fascia è un Server Component senza stato: si vede tutta |
| `prefers-reduced-motion` | La fascia è già ferma; la hero perde solo il reveal |

**La porta della prova non può sparire in nessuno scenario.** È il singolo requisito non negoziabile
di questa proposta, ed è per questo che gli slot ① e ③ non sono su Airtable.

---

## 12 · Destinazione di ogni CTA, superficie per superficie

### Home

| Superficie | Label esatta | URL esatto | Variante | Modifica |
|---|---|---|---|---|
| Hero | `Prenota una prova gratuita` | `/prova` | primary | **nuova** |
| Hero | `Iscrivi tuo figlio` | `/portale/iscrizioni` | support | era primary |
| Fascia ① | `Scrivi su WhatsApp` | `https://wa.me/39…` | primary | **nuova** |
| Fascia ① *(fallback)* | `Come funziona la prova` | `/prova` | primary | **nuova** |
| Fascia ② | *(dinamico)* es. `Locandina` | `CTA_URL` da Airtable | link testuale | **nuova** |
| Fascia ③ | `Come funziona la Scuola` | `/la-scuola` | link testuale | **nuova** |
| `SezioneScuola` | `Prenota una prova gratuita` | `/prova` | primary | era `Iscrivi tuo figlio` |
| `SezioneScuola` | `Iscrivi tuo figlio` | `/portale/iscrizioni` | support | era primary |
| `SezioneScuola` | `Scopri di più sulla Scuola` | `/la-scuola` | link testuale | era CTA ghost |
| `SezioneMarathon` | *(invariata)* | `/contatti?motivo=marathon` | ghost | — |
| `CtaFinale` | `Prenota una prova gratuita` | `/prova` | primary | era `Iscrivi tuo figlio` |
| `CtaFinale` | `Iscrivi tuo figlio` | `/portale/iscrizioni` | support | — |
| `CtaFinale` | ~~`Accedi all'area genitori`~~ | — | — | **rimossa** (già in navbar) |

`CtaFinale` è condivisa con `/chi-siamo` e `/gli-amatori-triono`: prende una prop
`variant?: "scuola" | "squadra"` (default = comportamento attuale) e solo la home passa `"scuola"`.
Tre call site toccati, nessuna regressione sulle pagine adulte.

### Navbar (tutte le pagine pubbliche)

| Superficie | Label | URL | Variante | Modifica |
|---|---|---|---|---|
| Desktop | `Accedi` / `Vai al portale` | `/portale/login` \| `/portale` | ghost | — |
| Desktop | `Iscrivi tuo figlio` | `/portale/iscrizioni` | **support** | era primary |
| Drawer mobile | `Prenota una prova gratuita` | `/prova` | **primary** | **nuova, prima voce** |
| Drawer mobile | `Iscrivi tuo figlio` | `/portale/iscrizioni` | support | era primary |
| Drawer mobile | `Accedi` / `Vai al portale` | `/portale/login` \| `/portale` | ghost | — |

I link di navigazione restano **sei**: `/prova` non entra nel menu principale (sarebbe un settimo
elemento e la navbar è già al limite). È raggiungibile da hero, fascia, `SezioneScuola`, `CtaFinale`,
drawer mobile, `/la-scuola` e footer.

### `/la-scuola`

| Superficie | Label | URL | Modifica |
|---|---|---|---|
| `SezioneComeIscriversi` step 01 | `Come funziona la prova` | `/prova` | era `Contattaci e prenota subito una prova` → `/contatti?motivo=scuola` |
| `CtaScuola` | `Prenota una prova gratuita` | `/prova` | primary — era `Iscrivi tuo figlio` |
| `CtaScuola` | `Iscrivi tuo figlio` | `/portale/iscrizioni` | support |
| `CtaScuola` | `Chiama {telefono}` | `tel:+39…` | invariata |
| `CtaScuola` | ~~`Scrivici`~~ (mailto) | — | rimossa: la sostituisce la porta `/prova`, che offre WhatsApp, telefono **e** form |

Il link soft dello step 01 resta soft (testo + freccia, non bottone): la gerarchia decisa in EVO-022
è giusta e la porta primaria ora è altrove.

### `/contatti`

Il `<select>` `MOTIVI` guadagna **`"Lezione di prova"`** e `motivoFromKey()` la chiave `"prova"`
(`/contatti?motivo=prova`). Serve solo come ripiego dalla pagina `/prova` per chi non usa WhatsApp:
il messaggio di successo del form promette "2–3 giorni", tempo giusto per un'informazione e sbagliato
per prenotare una lezione fra sei giorni — motivo per cui il form **non** è la porta primaria della
prova.

### `/prova` — la pagina nuova

Statica, livrea scuola, nessun dato a scadenza, quindi **manutenzione zero**.

```
h1     Due lezioni di prova. Gratis.

sub    Prima di iscriverti, tuo figlio può venire a provare fino a due lezioni,
       su entrambi i corsi: martedì su strada, giovedì in mountain bike.

tre fatti, in tre blocchi mono
       COSA SERVE    Una bici qualsiasi e il casco. Nient'altro.
       QUANDO        Martedì o giovedì, 17:00–18:30.
       DOVE          Ciclodromo Renato Perona, Terni.

blocco "Come si prenota"
       La prova si concorda prima: i gruppi sono piccoli e i maestri vi
       aspettano. Presentarsi senza avvisare non funziona.

       ▰▰ Scrivi su WhatsApp →   [primary]        wa.me, messaggio precompilato
          Chiama 3xx xxx xxxx    [ghost]          tel: da scuola-telefono
          Preferisci scrivere? Compila il modulo → /contatti?motivo=prova

chiusa Se hai già deciso, puoi saltare la prova:
       ⟨ Iscrivi tuo figlio ⟩ → /portale/iscrizioni     [support]
       Guarda com'è fatta la Scuola → /la-scuola        [link]
```

Sitemap: `{ path: "/prova", priority: 0.9, changeFrequency: "yearly" }`.

### WhatsApp — derivazione del numero e messaggi

**Il numero non è mai scritto nel codice.** Nuovo helper accanto a `phoneHref()` in
`src/lib/site-settings.ts`:

```ts
/** wa.me vuole E.164 senza "+" e senza separatori. */
export function whatsappHref(raw: string, testo?: string): string {
  const t = raw.trim();
  const digits = t.startsWith("+")
    ? t.replace(/[^\d]/g, "")          // già internazionale
    : `39${t.replace(/[^\d]/g, "")}`;  // numero IT
  const q = testo ? `?text=${encodeURIComponent(testo)}` : "";
  return `https://wa.me/${digits}${q}`;
}
```

Sorgente: `getSiteSettings()["scuola-whatsapp"] ?? getSiteSettings()["scuola-telefono"]` — oggi
coincidono (fatto accertato n. 4), la chiave opzionale `scuola-whatsapp` costa una riga e mette al
riparo dal giorno in cui divergeranno, senza nessun campo da creare adesso.

**Messaggi precompilati** — corti, perché il testo precompilato quasi nessuno lo modifica:

| Origine | Testo |
|---|---|
| Fascia ① (via veloce) | `Ciao! Ho visto il sito e vorrei prenotare una lezione di prova per mio figlio.` |
| `/prova` (via informata) | `Ciao! Ho visto il sito e vorrei prenotare una lezione di prova. Nome del bambino: · Età: · Preferirei martedì (strada) / giovedì (MTB)` |

*"Ho visto il sito"* è tracciamento senza analytics: al primo messaggio il titolare sa che il canale
nuovo funziona. Dalla pagina `/prova` il messaggio è più ricco perché chi arriva di lì ha appena
letto quali informazioni servono.

**Dettagli tecnici obbligatori:** `wa.me` è esterno → `ApexCta` usa sempre `next/link` e non espone
`target`, quindi serve un `<a target="_blank" rel="noopener noreferrer">` con le classi
`apex-cta apex-cta--primary` (stesso pattern già usato in EVO-043 per i link esterni), più uno
`<span class="sr-only">(si apre in WhatsApp)</span>`. È un **link**, non un embed: nessun impatto sul
consenso cookie, nessun gating.

---

## 13 · Operatività — chi aggiorna cosa, e quanto costa

### Che cosa sta in codice, e perché

| Elemento | Dove | Perché non è su Airtable |
|---|---|---|
| Hero completa | `HomeHero.tsx` | Deve essere deterministica per garantire la piega (§4), e non contiene niente che scada |
| Fascia, slot ① e ③ | `FasciaRegia.tsx` | Sono le porte: non devono poter sparire per un errore di configurazione |
| Numero WhatsApp | *derivato* da `scuola-telefono` | Già gestito da Airtable, non duplicarlo |
| `/prova` | route statica | Nessun contenuto a scadenza |

### Che cosa aggiorna il titolare, e quando

**Un solo gesto, una sola tabella.** Su `/portale/admin/comunicazioni` (CRUD già esistente,
`revalidatePath("/")` già implementato → la home cambia in pochi secondi, non in 5 minuti):

| Quando | Che cosa fa | Quanto ci mette |
|---|---|---|
| C'è un evento da annunciare | Nuovo record `SLOT = evento`, `VALIDO_DA` = da quando annunciarlo, **`VALIDO_A` = il giorno dell'evento** | ~1 minuto |
| Un'iniziativa cambia le parole della prova (es. Narni) | Nuovo record `SLOT = prova`, con le date | ~1 minuto |
| L'evento è passato | **Niente.** | 0 |
| Cambia il telefono | `Impostazioni Sito`, chiave `scuola-telefono` (già in uso) | ~30 secondi |
| Cambiano gli orari dei corsi | **Deploy** (è in codice) | dichiarato sotto |

**Regola operativa unica da ricordare, e sta in una riga:**
> `VALIDO_A` è il giorno dell'evento. Il resto si spegne da solo.

### Costi che introduco — dichiarati tutti

**Costi una tantum:**

1. **Un campo Airtable nuovo**: `SLOT` (singleSelect: `evento`, `prova`) su `Comunicazioni Hero`, da
   creare su **PROD e DEV**. Retro-compatibile: valore vuoto = `evento`, quindi i record esistenti
   continuano a funzionare. ⚠️ Va creato **con entrambe le scelte in un colpo** — l'API Airtable non
   permette di aggiungere choice a un singleSelect esistente (`update_field` → 422); l'unica
   alternativa è scrivere un record con `typecast: true` o farlo a mano nella UI.
2. **Route `/prova`** + voce in `sitemap.ts` + link nel footer.
3. **`MOTIVI`** in `ContactForm` guadagna `"Lezione di prova"` e la chiave `prova`.
4. **`whatsappHref()`** in `site-settings.ts` (~8 righe).
5. **Etichetta admin** da "Comunicazioni hero" a "Comunicazioni in home" (la destinazione cambia).
6. **Variante navbar** `primary` → `support` e nuova CTA nel drawer mobile.
7. **Prop `variant` su `CtaFinale`** (3 call site).
8. **`HomeTicker` eliminato**; il componente DS `Ticker` resta in repo ma senza consumatori — va
   tenuto (è nei 9 componenti canonici del DS) o rimosso, è una decisione di igiene, non di prodotto.

**Costo ricorrente: zero.** Nessun contenuto va spento a mano. Nessuna data è hardcoded.

**Costo che richiede deploy (dichiarato apertamente):** orari e giorni dei corsi (slot ③), la
descrizione permanente della prova (slot ①), il copy della hero. Sono dati che cambiano una volta
ogni due anni, e in cambio non possono rompersi. Se un domani gli orari dovessero cambiare spesso,
esiste già il posto giusto senza inventare niente: due chiavi in `Impostazioni Sito`
(`scuola-orari-strada`, `scuola-orari-mtb`) lette con fallback ai valori in codice. **Non lo
propongo adesso**: sarebbe complessità per un problema che non abbiamo.

**Ciò che perdiamo, detto chiaramente:** la hero non è più un palcoscenico promozionale. Una campagna
verso adulti (per esempio il reclutamento Maestri) non avrà più il titolo grande e la mascotte
dedicata: avrà lo slot ② e la sua pagina. È il prezzo della determinismo della piega e della
stabilità dell'`<h1>`, e lo pago consapevolmente. Se un giorno servisse davvero riaprire la hero alle
campagne, la via corretta **non** è rimettere il carosello, ma aggiungere alla hero una singola riga
sopra l'`<h1>` (un "nastro" di altezza fissa e testo troncato a lunghezza nota) — altezza
deterministica preservata. Non lo costruisco ora: non serve, e ogni escape hatch inutilizzato è
debito.

---

## 14 · Conformità al sistema

| Vincolo | Come è rispettato |
|---|---|
| **Un solo `<h1>`** | La hero statica ha l'unico `<h1>`, ed è il claim brand. Oggi il vincolo è violato (`HeroCampagne.tsx:253`): questa proposta lo ripristina. La fascia usa un `<h2>` `sr-only` |
| **Max 1 fondale vivo per viewport** | Hero: `FondaleVivo` (slot `home-hero`). Fascia: superficie piatta + hairline. `CtaFinale` mantiene il suo, in un altro viewport |
| **Budget 1 prop L+1 su mobile** | Solo il duo mascotte. `TargaDorsale` e `Waveform` restano `mobileHide`. La fascia non aggiunge props |
| **L0 sacro, mai coperto** | La fascia è nel flusso del documento, non è floating né sticky né dismissible. Nessun overlay sopra testo o CTA |
| **WCAG 2.1 AA** | Contrasti: etichette in `--stage-muted` (~6.7:1), **mai `--stage-faint`** su testo piccolo; CTA con testo ink scuro su accento pieno (tabella DS §8.1). Bersagli ≥44px. Link esterno annunciato. Nessun contenuto in movimento nella fascia → SC 2.2.2 risolto per sottrazione (oggi il ticker scorre senza controlli) |
| **Tastiera** | 3–5 elementi focusabili nel primo viewport, ordine = ordine di lettura, focus-visible dal DS. Nessun focus trap (spariscono carosello, dot e roving tabindex) |
| **`prefers-reduced-motion`** | La fascia è statica per costruzione; la hero conserva `.reveal` che è già reduced-motion safe |
| **Alt text** | Mascotte hero decorative (`alt=""` + `aria-hidden`), come da NINO.md; nessuna immagine nuova nella fascia |
| **Zero prove sociali inventate** | Nessun numero, nessuna testimonianza, nessun logo partner, nessuna scarsità. Ogni fatto in pagina è verificato in codice o nei fatti accertati |
| **Livree** | Hero e fascia in `racing` (chrome = brand padre, DS §1.7); `SezioneScuola` resta `scuola`; `/prova` in `scuola` |

**Bonus prestazionale:** la home perde un Client Component dal percorso critico (`HeroCampagne`:
`"use client"`, `setInterval`, `useStageParallax`, quattro `useState`) e guadagna un Server Component
senza stato. L'`<h1>` è nel markup statico e non cambia dopo l'idratazione: LCP e CLS migliorano, e
Google indicizza un titolo stabile invece del titolo dell'ultima campagna attiva.

---

## 15 · Rischi, fragilità, trade-off accettati

**Dove questa proposta è più fragile — in ordine di gravità.**

1. **La garanzia della piega è una promessa da difendere nel tempo.** Vale finché la hero resta
   deterministica. Basta che qualcuno reintroduca contenuto a lunghezza variabile nella hero e il
   calcolo di §4 salta senza che nessuno se ne accorga. *Mitigazione:* il criterio è espresso come
   test eseguibile (§4), va nella checklist di accettazione dell'evolutiva e nel commento in testa a
   `FasciaRegia.tsx`. *Rischio residuo: reale.* È il punto in cui questa architettura può degradare
   silenziosamente.

2. **Su iPhone SE il pubblico ③ è sotto la piega.** Con 95px di margine si vede lo slot ①, non lo ②.
   Chi cerca le gare su un telefono piccolo deve scorrere una volta. *Accettato deliberatamente:*
   fra i quattro pubblici, quello delle gare è l'unico che arriva già sapendo cosa cerca e con
   motivazione alta.

3. **Perdiamo il palcoscenico grande per le campagne** (§13). Se il titolare tiene molto all'effetto
   "campagna in home", questa è la parte della proposta che sentirà come una rinuncia. *Non la
   mascherò:* è una scelta, e la contropartita è che il claim di marca smette di sparire ogni sette
   secondi.

4. **WhatsApp concentra il carico su una persona.** Non c'è coda, non c'è triage, non c'è orario di
   risposta dichiarato. Se il canale funziona come speriamo, il volume aumenta. *Mitigazione:* i
   messaggi precompilati sono corti e lasciano al titolare il controllo dello scambio; `/prova` offre
   telefono e modulo come alternative. *Non risolto:* se servirà una risposta automatica fuori
   orario, è un lavoro successivo.

5. **`wa.me` su desktop apre WhatsApp Web e richiede un telefono collegato.** Una parte dei
   visitatori desktop sbatterà contro un QR code. *Mitigazione:* `/prova` mette telefono e modulo
   accanto al bottone; sulla fascia il bottone WhatsApp resta perché la quota mobile domina questo
   pubblico.

6. **Due porte possono dividere l'intenzione.** Un genitore già deciso potrebbe cliccare "prova"
   perché è il bottone più acceso. *Mitigazione:* la regola cromatica per ruolo (§8) e la presenza
   costante di "Iscrivi tuo figlio" in navbar. *Trade-off accettato:* una prova in più costa una
   sera di un maestro; un'iscrizione abbandonata al terzo passaggio costa un bambino.

7. **La fascia è un pattern nuovo e potrebbe leggersi come una barra promozionale** (cecità da
   banner). *Mitigazione:* non è floating, non è chiudibile, non ha icone di chiusura, non usa
   colori fuori palette, e adotta lo stesso linguaggio (hairline, mono uppercase, superficie del
   palco) del ticker che sostituisce — continuità visiva con il chrome del sistema, non con la
   pubblicità.

8. **Finché il campo `SLOT` non esiste, tutti i record finiscono nello slot ②.** Il comportamento è
   corretto ma la sovrapposizione Narni non funziona. *Mitigazione:* il campo è il primo task
   dell'implementazione, su PROD e DEV nella stessa sessione.

**Alternative valutate e scartate.**

| Alternativa | Perché no |
|---|---|
| La prova come unica CTA della hero, iscrizione solo in navbar | Punisce il pubblico ②, che è quello che converte, e contraddice `PRODUCT.md` ("Primary CTA: iscriviti alla scuola") |
| Tenere il carosello e aggiungere la prova come slide | Esposizione 7s su 21s per il messaggio più importante; altezza non deterministica → salta la garanzia della piega; l'`<h1>` resta il titolo di una campagna |
| Barra sticky della prova sempre a schermo | Copre L0 (contenuto della pista sacro), si legge come pubblicità, e su mobile ruba 56px a ogni viewport della sessione |
| Route `/gare` per settembre | Il fatto accertato n. 6 dice che non c'è nessun flusso da costruire: sarebbe un contenitore vuoto da mantenere |
| Orari dei corsi da Airtable già adesso | Complessità per un problema che non abbiamo (cambiano una volta l'anno). La via è tracciata in §13 se servirà |

---

## 16 · Criteri di accettazione

Verificabili prima del merge, senza opinioni.

- [ ] `document.querySelectorAll('h1').length === 1` su `/`, e il testo è `In bici, sicuri, insieme.`
- [ ] `innerHeight - document.querySelector('[data-regia]').getBoundingClientRect().top >= 72` a
      **375×667**, **375×812**, **1280×720**, **1440×900**
- [ ] La parola "prova" compare nel primo viewport a tutti e quattro i viewport di riferimento
- [ ] Esattamente **tre** superfici piene nel primo viewport: due accento ("prova"), una accent-2
      ("iscriviti")
- [ ] Con `AIRTABLE_TOKEN` rimosso, la fascia rende comunque slot ① e ③, e il bottone WhatsApp o il
      suo fallback è presente
- [ ] Con tre record `SLOT=evento` in corso, la fascia ne mostra **uno** in primo piano e **uno** in
      riga "Poi:"
- [ ] Impostando `oggi = 2026-09-27` (data di sistema o test su `isComunicazioneInCorso`), la fascia
      rende **due** slot su una riga piena, senza spazi vuoti
- [ ] Un solo `FondaleVivo` per viewport; un solo prop L+1 sotto 768px
- [ ] Nessun `text-stage-faint` su testo di dimensione normale nella fascia
- [ ] Navigazione da tastiera: focus visibile su tutte le CTA del primo viewport, ordine = lettura
- [ ] `next build`: la home resta `○ Static` con `Revalidate 10m`

---

## 17 · Se si potesse fare una cosa sola

Non la pagina `/prova`. Non la fascia intera.

**Sostituire `HomeTicker` con una fascia di un solo slot — LA PROVA, cablata nel codice, con il
bottone WhatsApp — e cambiare la CTA primaria della hero in "Prenota una prova gratuita".**

Due file toccati, nessun campo Airtable, nessuna route nuova. Il problema della mamma del brief è
chiuso lo stesso giorno. Tutto il resto di questa proposta — gli slot ② e ③, `/prova`, gli eventi di
settembre, la regola cromatica — è costruzione sopra quella base, e può arrivare dopo.
