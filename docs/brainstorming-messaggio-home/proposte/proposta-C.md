# Due porte, dichiarate a parole

Architettura del messaggio della home di trionoracing.it

---

## 1 · Tesi e principio guida

> **Tesi.** Alla mamma non mancava la porta bassa: le mancava un **criterio dichiarato** per
> capire quale porta fosse la sua. La home non deve scegliere al posto del genitore, deve
> mostrargli **due porte semanticamente distinte** e **nominarle a parole**, così che si
> auto-selezioni in un istante.

**Principio guida:** *la rumorosità serve a chi ha intenzione bassa, l'etichetta serve a chi ha
intenzione alta.*

Chi non sa ancora cosa cerca ha bisogno che la porta giusta gli **gridi addosso**. Chi sa già
cosa cerca ha bisogno soltanto che la porta sia **etichettata**: la trova da solo, perché la
sta cercando. Da qui la regola che governa tutta la proposta — **parità semantica, gerarchia
visiva**: le due porte hanno la stessa quantità di pagina, la stessa geometria, lo stesso rango
tipografico; una sola ha il riempimento in accento.

Oggi la home fa l'opposto: quattro volte lo stesso bottone, zero etichette, zero criterio. Non è
un problema di quantità di CTA, è un problema di **grammatica assente**.

---

## 2 · La diagnosi, per esteso

Aggiungere "Prenota una prova" accanto a "Iscrivi tuo figlio" senza altro lavoro **non risolve**
il problema della mamma, lo sposta. Due bottoni che sono *due intensità dello stesso atto*
(impegnarsi con la scuola, in versione leggera o in versione piena) costringono a valutare un
**grado**, e valutare un grado richiede informazioni che il genitore freddo non ha ancora. È
esattamente lì che nasce la paralisi da scelta — il rischio noto di questa tesi.

La mossa che la disinnesca: **le due porte non devono essere due intensità, ma due domande con
risposta ovvia.**

- *Tuo figlio non ha mai provato?* → porta A
- *Hai già deciso?* → porta B

Il genitore non confronta due offerte: **risponde a un fatto su di sé** che conosce già, con
zero deliberazione. È la differenza fra un bivio stradale (richiede giudizio) e le due file del
controllo passaporti "UE / non UE" (richiede zero giudizio, perché il criterio è un fatto, non
un'opinione).

---

## 3 · I quattro dispositivi anti-paralisi

Sono la sostanza della proposta. Se ne cade uno, la tesi si indebolisce davvero.

**D1 · Criterio dichiarato.** L'etichetta di ogni porta è una domanda fattuale sul lettore, mai
un giudizio di valore né una promessa comparativa. "Non ha mai provato?" / "Hai già deciso?".

**D2 · Prezzo dichiarato.** Ogni porta dice **cosa costa entrarci oggi**, in una riga:
porta A → *"servono solo una bici qualsiasi e il casco"*; porta B → *"tieni pronti una foto e il
certificato medico"*. Questo è il secondo criterio di auto-selezione, ed è onesto: chi non ha il
certificato scopre in due secondi che oggi la sua porta è la A, senza sbatterci contro a metà
wizard.

**D3 · Isomorfismo.** Le due porte hanno **la stessa identica grammatica**: domanda → promessa →
dettaglio → condizione → azione → approfondimento. Il lettore decodifica la prima porta in ~4
secondi e la seconda in meno di 1, perché ne conosce già la forma. L'isomorfismo è ciò che rende
la coppia più veloce da leggere di un bottone solo con un paragrafo di spiegazione.

**D4 · Gerarchia asimmetrica.** Stessa superficie, stesso rango tipografico, **fill in accento
solo sulla porta A**. Nel DS APEX la variante `ghost` non è un link debole: è
`box-shadow: inset 0 0 0 1px var(--accent)` su testo `--stage-ink` (`apex.css:276`), cioè un
bottone pieno di bordo, alto 44 px, in accento. **Porta B non è nascosta: è silenziosa.** È la
distinzione tecnica che dissolve l'obiezione "hai sepolto l'iscrizione".

**Disciplina che li tiene insieme: mai una terza CTA nel primo viewport.** Due porte significa
due. Ogni altro link (Scopri la Scuola, area genitori, campagne) scende sotto le porte o sale
nella navbar.

---

## 4 · Mappa dei casi d'uso

| | **1 · Genitore curioso** | **2 · Genitore deciso** | **3 · Società / famiglia gare settembre** | **4 · Amatore / agonista** |
|---|---|---|---|---|
| **Cosa cerca** | "Posso far provare mio figlio senza impegnarmi?" | "Dove si fa l'iscrizione?" | "Quando sono le gare, dove, chi può iscriversi" | "Che squadra è, come entro" |
| **Dove atterra** | Home (organico, passaparola, volantino Narni) o `/prova` diretto | Home o navbar da qualsiasi pagina | Home, `/` (o link diretto passato dalla società) | Home o `/gli-amatori-triono` |
| **La sua porta** | **Porta A** — WhatsApp con il titolare | **Porta B** — `/portale/iscrizioni` | La fascia **"In programma"**, sotto le porte | Navbar "Amatori" + sezione Amatori |
| **Come la riconosce** | La domanda mono in accento *"Tuo figlio non ha mai provato?"* + il fill giallo, primo blocco sotto il sottotitolo | La domanda gemella *"Hai già deciso?"*, identica per forma, alla sua destra (sotto, su mobile) | Righe **data-first**: la data mono in accento è la prima cosa a sinistra di ogni riga | La livrea: le porte sono in **livrea Scuola** (giallo caldo), lui legge "non è roba mia" in <1s e cerca altrove |
| **Clic all'obiettivo** | **1** (CTA → chat WhatsApp precompilata). 2 se passa da `/prova` | **1** (CTA → wizard). 1 anche dalla navbar, da ogni pagina | **0** — le date e la regola d'iscrizione sono leggibili senza cliccare | **1** (navbar) / 0 se scorre |
| **Momenti di dubbio** | 0: criterio dichiarato, prezzo dichiarato, canale nominato ("WhatsApp"), risponditore nominato | 0 | 0 sul *cosa*; 1 sul *come iscriversi*, risolto dalla nota "iscrizioni tramite le società, sui canali FCI" | 0 |

Nota sul pubblico 4: le porte **non parlano per lui**, e la livrea lo dichiara visivamente. È un
effetto voluto — il cambio di livrea fa lavoro semantico, non decorativo.

---

## 5 · Architettura della home: tre fasce, tre mestieri

```
┌─ FASCIA 1 · IL PALCO (hero)          permanente · livrea Racing · un fondale vivo
│    chi siamo, cos'è, dove. Nessuna azione. Nessuna rotazione.
├─ FASCIA 2 · LE PORTE                 permanente · livrea Scuola · CABLATA IN CODICE
│    l'unico punto della home dove si decide. Due porte, mai tre.
├─ FASCIA 3 · LA REGIA                 stagionale · livrea Racing · da Airtable, AUTO-SCADENTE
│    ticker (fatti senza data) + "In programma" (eventi datati)
└─ … resto della pagina invariato (Scuola → Ciclodromo → Amatori → Marathon → CTA finale)
```

Tre decisioni strutturali, ognuna con la sua ragione:

**1 · Le porte non stanno nell'hero, stanno subito sotto, a filo.** Sezione autonoma
(`data-livery="scuola"`, superficie piena, niente video). Motivi: (a) l'hero può restare
editoriale e stagionale senza mai toccare le porte; (b) l'altezza dell'hero diventa un numero che
controlliamo, quindi il "sopra la piega" è garantito per costruzione; (c) il contrasto
hero-vivo / porte-solide dice da solo *"qui finisce il racconto, qui si fa"*; (d) rispetta il
budget APEX di **un solo fondale vivo per viewport**.

**2 · L'`<h1>` torna al claim di brand ed è statico.** Oggi, con campagne attive,
`HeroCampagne` promuove a `<h1>` il **titolo della campagna** e degrada "In bici, sicuri,
insieme." a `<p>` (`HeroCampagne.tsx:253`). Significa che l'`<h1>` della home cambia ogni volta
che il titolare aggiunge una riga su Airtable, e ruota ogni 7 secondi. Un messaggio che cambia
mentre lo leggi non può essere ricordato dopo dieci secondi: è il test n.1 perso per costruzione.
L'`<h1>` torna a essere il claim, cablato, unico.

**3 · Niente rotazione nel primo viewport.** Il limite noto di EVO-035 ("ogni slide resta
visibile 7 secondi su 21") non si corregge con una rotazione più lenta: si corregge togliendo la
rotazione da dove serve concentrazione. La campagna a priorità più alta resta, **come una riga
sola** ("flash") accanto all'eyebrow di brand; tutto il resto scende nella fascia 3. Guadagni
collaterali reali: −7 controlli interattivi dal tab order, −1 carosello da mantenere in a11y,
LCP e CLS migliori, `prefers-reduced-motion` con molta meno superficie.

---

## 6 · Wireframe — desktop 1440 × 900

Navbar sticky 60 px → **840 px visibili**. Altezze indicative (da verificare con
`scripts/dev-shot.mjs`).

```
╔══ NAVBAR (60, sticky, livrea Racing) ════════════════════════════════════════════╗
║ [logo]   Scuola  Amatori  Chi siamo  Marathon 209  Diventa Maestro  Contatti     ║
║                                        Accedi │ [ PROVA GRATIS ] [ ISCRIVI … ]   ║
╚══════════════════════════════════════════════════════════════════════════════════╝

┌── FASCIA 1 · HERO ── stage-scene, min-height 600 ────────────────── L−2 FondaleVivo
│   L−1  telemetria ghost (dx) · waveform (sx)          ┊ L+1 mascotte campagna (dx, bordo↓)
│
│   (72)
│   SCUOLA · SQUADRA · GARE — TERNI, DAL 2015     ● 19 SET · SIAMO A NARNI SPORT NIGHT →
│   ─────────────────────────────────────────     ────────────────────────────────────
│   (24)                                          ↑ "flash" opzionale, 1 riga, da Airtable
│
│   In bici, sicuri,                                                     ← <h1>, 2 righe
│   insieme.                                                                (~150)
│
│   Scuola di ciclismo per bambini dai 4 anni, con maestri federali,      ← sottotitolo
│   al Ciclodromo Renato Perona di Terni. Strada il martedì, MTB il giovedì. (2 righe, 56)
│   (56)
└──────────────────────────────────────────────────────────────────────────────────
┌── FASCIA 2 · LE PORTE ── data-livery="scuola" · superficie piena · nessun video ──
│   ┄ hairline superiore ┄
│   (28)   Due modi per cominciare. Il primo è gratis.        ← riga di cornice, 1 riga
│   (16)
│   ┌────────────────────────────────┬────────────────────────────────┐
│   │ ▌barra accento 2px             │                                │   ~230
│   │ TUO FIGLIO NON HA MAI PROVATO? │ HAI GIÀ DECISO?                │
│   │ Fino a due lezioni di prova,   │ L'iscrizione si fa             │
│   │ gratis.                        │ tutta online.                  │
│   │ Vale su tutti e due i corsi…   │ Iscrizioni aperte tutto l'anno…│
│   │ ⓘ La prova si concorda prima.  │ ⓘ Tieni pronti foto e certif.  │
│   │ [ SCRIVICI SU WHATSAPP → ]     │ [ ISCRIVI TUO FIGLIO ]         │
│   │ Ti risponde Luca in persona.   │                                │
│   │ Come funziona la prova →       │ Cosa serve, passo per passo →  │
│   └────────────────────────────────┴────────────────────────────────┘
│   (56)
└── ≈ 732 px dal top ─── LA PIEGA CADE QUI (840) ──────────────────────────────────
┌── FASCIA 3 · REGIA ─ ticker (44) + "In programma" ── ~100 px sbirciano sotto la piega
```

Somma: 60 + 72 + 24 + 150 + 16 + 56 + 28 + 16 + 230 + 56 = **732 px**. Le due porte sono
interamente comprese fra ~500 e ~732 px: **sopra la piega con 108 px di margine**, e la fascia 3
sbircia quanto basta a promettere che la pagina continua.

---

## 7 · Wireframe — mobile 375 × 812 (e nota su 375 × 667)

Budget APEX mobile rispettato: **un solo prop L+1** (la mascotte), telemetria e waveform
nascoste, niente mouse-parallax.

```
╔══ NAVBAR (56) ═══════════════════════════════════════════╗
║ [logo]                        [ PROVA GRATIS ]   [ ☰ ]   ║   ← oggi qui non c'è NESSUNA CTA
╚══════════════════════════════════════════════════════════╝
┌── HERO ── min-height auto ── L+1 mascotte (bordo ↓) + velo navy solo-mobile
│  (28)
│  SCUOLA · SQUADRA · GARE — TERNI              (16)
│  ● 19 SET · NARNI SPORT NIGHT →               (16)   ← flash, va a capo su riga propria
│  (12)
│  In bici, sicuri,                                     ← <h1>, 2 righe @ ~34px  (80)
│  insieme.
│  (12)
│  Scuola di ciclismo per bambini dai 4 anni,           ← sottotitolo, 3 righe    (66)
│  maestri federali, Ciclodromo Perona, Terni.
│  Strada il martedì, MTB il giovedì.
│  (28)
└──────────────────────────────────────────────────────────
┌── LE PORTE (stack verticale) ─────────────────────────────
│  Due modi per cominciare. Il primo è gratis.      (30)
│  ┌─ PORTA A ──────────────────────────────────┐  (200)
│  │ ▌ TUO FIGLIO NON HA MAI PROVATO?           │
│  │ Fino a due lezioni di prova, gratis.       │
│  │ Bici qualsiasi + casco. Martedì o giovedì. │
│  │ ⓘ La prova si concorda prima.              │
│  │ [ SCRIVICI SU WHATSAPP → ]  full-width 48  │
│  │ Ti risponde Luca in persona.               │
│  │ Come funziona la prova →                   │
│  └────────────────────────────────────────────┘
│  ┌─ PORTA B ──────────────────────────────────┐  (176)
│  │ HAI GIÀ DECISO?                            │
│  │ L'iscrizione si fa tutta online.           │
│  │ ⓘ Foto + certificato medico non agonistico.│
│  │ [ ISCRIVI TUO FIGLIO ]      full-width 48  │
│  │ Cosa serve, passo per passo →              │
│  └────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────
```

Somma: 56+28+32+12+80+12+66+28+30+200+10+176+28 = **758 px**.

- **375 × 812 e superiori (iPhone 12→17, Android moderni): entrambe le porte interamente sopra
  la piega.** ✔
- **375 × 667 (iPhone SE):** la piega cade a 667. Porta A è tutta visibile; di porta B si vedono
  **domanda e titolo**, il bottone resta ~90 px sotto. Mitigazioni: il chip **Prova gratis** in
  header (visibile sempre), l'ancora sulla porta B già leggibile, e un solo pollice di scroll.
  **Non lo nascondo: su SE il pubblico 2 vede l'etichetta, non ancora il bottone.**

Alternativa valutata e **scartata**: comprimere porta B a una riga singola (domanda + CTA
inline, ~72 px) per farla stare su SE. Scartata perché rompe D3 (isomorfismo) e D2 (prezzo
dichiarato) proprio sulla porta che oggi è l'unica esistente: ricreerebbe l'asimmetria che
stiamo correggendo, solo al contrario. **Preferisco perdere 90 px su un viewport in coda alla
distribuzione che perdere la grammatica su tutti.**

---

## 8 · Densità: conteggio prima / dopo

Elementi che **competono per l'attenzione** nel primo viewport (desktop).

| | Oggi, con campagne attive | Oggi, hero statica | **Proposta** |
|---|---|---|---|
| Blocchi di contenuto | 6 (claim brand, eyebrow campagna, titolo campagna, sottotitolo campagna, + 2 CTA) | 5 (eyebrow, h1, paragrafo, 2 CTA) | **6** (eyebrow, flash, h1, sottotitolo, riga cornice, + 2 porte) |
| Elementi interattivi | **15** (2 CTA + prev/play/next + 3 dot + 2 "altre slide" + …) | 2 | **5** (2 CTA porte + 2 link quieti + 1 flash link) |
| Dati numerici in competizione | 0 | **4** (celle HUD) | 0 (l'HUD scende sotto la sezione Scuola) |
| Superfici in movimento | 2 (video + carosello) | 1 (video) | **1** (video) |
| Prop decorativi (desktop / mobile) | 4 / 1 | 3 / 1 | 3 / 1 |

Dove si rompe la mia hero: **al terzo messaggio.** Regge brand + routing. Se un giorno qualcuno
volesse infilarci anche un evento con titolo e immagine, la riga "flash" non basterebbe e
l'hero tornerebbe bacheca. Per questo il flash è **fisicamente una riga**: il layout non concede
un blocco, quindi non può degenerare. È un vincolo di costruzione, non di buona volontà.

---

## 9 · Copy, parola per parola

### 9.1 Hero

**Eyebrow (mono uppercase, `apex-eyebrow`)**
```
SCUOLA · SQUADRA · GARE — TERNI, DAL 2015
```
> Tre parole portano il *percorso* di `PRODUCT.md` (scuola → squadra → agonismo) nel chrome,
> senza rubare spazio alla tipografia. Sostituisce l'attuale `TRIONO RACING · DAL 2015 · TERNI`,
> che ripete il nome già presente nel logo.

**Flash campagna (opzionale, una riga, da Airtable; esempio settembre)**
```
● 19 SET · SIAMO A NARNI SPORT NIGHT →
```
> `EYEBROW` + `TITOLO` del record a priorità più alta. Supporta `**parola**` per l'accento.

**`<h1>` — unico, statico**
```
In bici, sicuri, insieme.
```
> Invariato (EVO-035): non c'è ragione forte per cambiarlo, le parole sono giuste. Cambia solo
> che torna a essere davvero l'`<h1>`, e che non ruota. Markup: `sicuri,` in `.stroke-word`,
> `insieme.` in `.accent-word`, come oggi nell'hero statica.

**Sottotitolo**
```
Scuola di ciclismo per bambini dai 4 anni, con maestri federali,
al Ciclodromo Renato Perona di Terni. Strada il martedì, mountain bike il giovedì.
```
> Ogni fatto verificato in codice (`SezioneScuola.tsx:104-110`, `HomeHero.tsx:64-68`). Porta le
> parole chiave che l'`<h1>` di brand non porta.

### 9.2 Riga di cornice (sopra le porte)

```
Due modi per cominciare. Il primo è gratis.
```
> Sette parole che fanno tre cose: dichiarano il **numero** (due — insieme chiuso, nessuna
> opzione nascosta da cercare), dichiarano il **differenziatore** (gratis) e **incorniciano** la
> coppia come un unico oggetto da leggere. Non è una domanda: chiedere "da dove vuoi cominciare?"
> inviterebbe a deliberare. La domanda sta *dentro* le porte, dove ha risposta ovvia.

### 9.3 Porta A

| Slot | Testo |
|---|---|
| Domanda (mono, accento) | `Tuo figlio non ha mai provato?` |
| Titolo (h2) | `Fino a due lezioni di prova, gratis.` |
| Dettaglio | `Vale su tutti e due i corsi: strada il martedì, mountain bike il giovedì. Servono solo una bici qualsiasi e il casco.` |
| Condizione | `La prova si concorda prima, così ti aspettiamo.` |
| CTA (primary) | `Scrivici su WhatsApp` |
| Microcopy sotto CTA | `Ti risponde {scuola-referente} in persona.` — fallback: `Ti risponde uno di noi, in persona.` |
| Link quieto | `Come funziona la prova →` |
| Riga stagionale (solo se c'è un evento *porta-aperta* nei prossimi 30 giorni) | `Il 19 settembre la portiamo in centro: Narni Sport Night, con le nostre bici.` |

Note di scrittura:
- *"Fino a due"* e non *"le prime due"*: il fatto accertato è **fino a 2 lezioni**. Non
  promettiamo un numero che non abbiamo promesso.
- *"una bici qualsiasi"* è la frase che abbatte la barriera vera: il genitore che pensa
  "non abbiamo una bici da corsa" viene disinnescato in tre parole.
- *"si concorda prima"* trasforma un vincolo (fatto n.2) in un'attenzione: **"così ti
  aspettiamo"** è la stessa informazione detta come ospitalità.

### 9.4 Porta B

| Slot | Testo |
|---|---|
| Domanda (mono) | `Hai già deciso?` |
| Titolo (h2) | `L'iscrizione si fa tutta online.` |
| Dettaglio | `Iscrizioni aperte tutto l'anno, dall'area riservata genitori.` |
| Condizione | `Tieni pronti una foto di tuo figlio e il certificato medico non agonistico.` |
| CTA (ghost) | `Iscrivi tuo figlio` |
| Link quieto | `Cosa serve, passo per passo →` |

> Nessuna spinta, nessuna scarsità, nessun "posti limitati". Chi ha già deciso non va convinto,
> va servito.

### 9.5 CTA finale della home (fascia in fondo)

Eyebrow `PRONTI A PEDALARE?` e titolo restano. Cambia il piede:

```
Due modi per cominciare, ancora qui in fondo.
[ SCRIVICI SU WHATSAPP → ]   [ ISCRIVI TUO FIGLIO ]
Accedi all'area genitori →                              (link testuale, non bottone)
```

---

## 10 · I tre eventi di settembre

### 10.1 Il principio: Narni non è un terzo evento, è la porta A con un secondo indirizzo

Le due gare (12 e 26) e Narni (19) **non sono la stessa cosa** e non vanno trattate allo stesso
modo:

- **Le gare sono annunci.** Le iscrizioni passano dai canali federali FCI fra società: non c'è
  nulla da costruire e nulla da vendere. Il compito della home è **dire che ci sono**, con la
  precisione di un tabellone.
- **Narni è acquisizione a frizione zero.** Mettiamo il percorso di agilità **e le bici**: cade
  la barriera dell'attrezzatura (fatto n.3) *e* quella dell'appuntamento (fatto n.2), e succede
  in centro città dove i genitori già sono. **È la lezione di prova, portata in piazza.**

Quindi Narni **non entra come terzo messaggio**: entra come **riga in più dentro porta A**. È il
punto in cui questa proposta guadagna di più: la home non cresce, **una porta esistente acquista
un secondo indirizzo per due settimane**, e poi lo perde da sola.

### 10.2 Dove vivono, con che peso

| Evento | Fascia 3 "In programma" | Porta A | `/prova` | Ticker |
|---|---|---|---|---|
| 12 set · Gara strada Giovanissimi | riga 1 (data mono + titolo + luogo + nota FCI) | — | — | sì, come voce datata |
| 19 set · Narni Sport Night | riga 2, con link `Vieni a provare →` `/prova` | **riga stagionale** | **blocco in testa alla pagina** | sì |
| 26 set · Gara MTB Giovanissimi | riga 3 | — | — | sì |

### 10.3 La fascia "In programma", nel dettaglio

Non tre card: **un binario di righe**, denso, in stile telemetria. È la differenza fra un
tabellone e una bacheca.

```
┄ ticker (44px, mono, decorativo, sempre presente) ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
   PROVA GRATUITA · FINO A 2 LEZIONI / MARTEDÌ · STRADA 17:00 / GIOVEDÌ · MTB 17:00 /
   CICLODROMO RENATO PERONA · TERNI / TRIONO RACING · DAL 2015 / …

In programma                                                        ← SectionHead variant h2
─────────────────────────────────────────────────────────────────────────────────────
 12 SET   Gara su strada · Giovanissimi          Ciclodromo Perona, Terni
 2026     Organizzata da noi.                    Iscrizioni tramite le società, sui canali FCI.
─────────────────────────────────────────────────────────────────────────────────────
 19 SET   Narni Sport Night                      Centro di Narni
 2026     Portiamo un percorso di agilità e      Vieni a provare →
          le nostre bici: si prova sul posto.
─────────────────────────────────────────────────────────────────────────────────────
 26 SET   Gara di mountain bike · Giovanissimi   Ciclodromo Perona, Terni
 2026     Organizzata da noi.                    Iscrizioni tramite le società, sui canali FCI.
─────────────────────────────────────────────────────────────────────────────────────
```

- Data mono in `--accent`, prima colonna: chi cerca date le trova senza leggere.
- Nessuna CTA verso flussi inesistenti. La nota FCI **è** la risposta al pubblico 3.
- Su mobile: tre blocchi impilati, data in alto, stessa gerarchia.
- **Un solo link in tutta la fascia** — quello di Narni, che porta a `/prova`.

### 10.4 Il colpo di Narni: `trionoracing.it/prova`

Perché la porta bassa merita **una pagina vera** e non solo un link a chat:

Il 19 settembre incontriamo di persona decine di genitori. Un URL corto, pronunciabile ad alta
voce e stampabile su un QR — **trionoracing.it/prova** — è l'unico artefatto che sopravvive alla
serata. E la stessa URL, **senza nessun intervento**:

- **fino al 19 settembre** apre con il blocco *"Il 19 siamo a Narni: bici nostre, vieni e basta"*;
- **dal 20 settembre** apre con la prova normale al ciclodromo.

Stesso indirizzo, contenuto che si adegua da solo, perché il blocco è pilotato dalla **data
dell'evento**, non da un interruttore che qualcuno deve ricordarsi di spegnere.

---

## 11 · Inventario CTA: label esatta → URL esatto

### 11.1 Il componente unico (garanzia anti-deriva)

Le due porte non sono copy sparso: sono **un solo componente**, `CoppiaPorte`, con tre varianti
di densità, usato su **ogni** superficie. Il componente **non può renderizzare una terza CTA**:
non ha la prop per farlo. È così che il problema "quattro volte lo stesso bottone" non può
tornare sotto altra forma.

| Variante | Dove | Cosa rende |
|---|---|---|
| `full` | fascia 2 della home | domanda + titolo + dettaglio + condizione + CTA + micro + link |
| `compact` | piede di sezione (`SezioneScuola`, `SezioneCorsi`, `CtaScuola`) | domanda mono + CTA |
| `inline` | hero `/la-scuola`, `CtaFinale` | solo le due CTA |

**Regola di livrea unica, valida ovunque:** porta A = `primary` (fill accento) · porta B =
`ghost` (bordo accento). Sempre, anche in navbar. Discussione onesta di questa scelta: PRODUCT.md
indica *"Primary CTA: iscriviti alla scuola"*. La conversione primaria **resta** l'iscrizione —
è la destinazione di tutto il sito, è in navbar su ogni pagina, è in ogni coppia. Il **bottone**
primario è la prova perché, per il segmento maggioritario e freddo, è il primo passo onesto più
breve verso quella stessa conversione. Invertire la regola fra chrome e pagina renderebbe la
grammatica non apprendibile: **una regola sola, ovunque.**

### 11.2 Tabella completa

| Superficie | Label esatta | URL esatto | Variante |
|---|---|---|---|
| NavBar desktop | `Prova gratis` | `/prova` | ghost sm |
| NavBar desktop | `Iscrivi tuo figlio` | `/portale/iscrizioni` | primary sm |
| NavBar desktop | `Accedi` / `Vai al portale` | `/portale/login` / `/portale` | **link semplice** in fondo alla riga link (oggi è un bottone) |
| NavBar mobile header | `Prova gratis` | `/prova` | chip ghost (**oggi non c'è nessuna CTA**) |
| NavBar mobile drawer | `Scrivici su WhatsApp` · `Iscrivi tuo figlio` · `Accedi` | wa.me · `/portale/iscrizioni` · `/portale/login` | primary · ghost · ghost |
| Hero — flash | testo del record | `CTA_URL` del record | link testuale con freccia |
| **Porta A** | `Scrivici su WhatsApp` | `https://wa.me/39{scuola-telefono}?text=…` | primary |
| Porta A — link quieto | `Come funziona la prova →` | `/prova` | link |
| **Porta B** | `Iscrivi tuo figlio` | `/portale/iscrizioni` | ghost |
| Porta B — link quieto | `Cosa serve, passo per passo →` | `/la-scuola#come-iscriversi` | link |
| In programma — Narni | `Vieni a provare →` | `/prova` | link |
| Sezione Scuola (piede) | coppia `compact` | wa.me · `/portale/iscrizioni` | primary + ghost |
| Sezione Scuola (piede) | `Scopri di più sulla Scuola` | `/la-scuola` | link testuale (oggi è un bottone) |
| CTA finale home | coppia `inline` + `Accedi all'area genitori →` | wa.me · `/portale/iscrizioni` · `/portale/login` | primary + ghost + link |
| `/la-scuola` hero | coppia `inline` | `/prova` · `/portale/iscrizioni` | primary + ghost |
| `/la-scuola` `SezioneComeIscriversi`, step 01 | `Prenota la prova →` | `/prova` (oggi: `/contatti?motivo=scuola`) | link |
| `/la-scuola` `CtaScuola` | coppia `compact` + `Chiama {telefono}` | wa.me · `/portale/iscrizioni` · `tel:` | primary + ghost + ghost |
| `/prova` (nuova) | `Scrivici su WhatsApp` | wa.me | primary |
| `/prova` | `Preferisci scrivere via email?` | `/contatti?motivo=prova` | link |
| `/prova` | `Vai all'iscrizione` | `/portale/iscrizioni` | link |

Su `/la-scuola` la porta A punta a `/prova` e non direttamente a WhatsApp: chi è già dentro la
pagina lunga sta ancora raccogliendo informazioni, e la pagina prova è il passo naturale. Nella
home, dove il genitore ha appena letto il prezzo dichiarato, la scorciatoia diretta è giustificata.

### 11.3 `wa.me`: come deriviamo il numero e cosa contiene il messaggio

Il numero **non si scrive in codice**: è già su Airtable, chiave `scuola-telefono` della tabella
`Impostazioni Sito`, la stessa che alimenta oggi il bottone "Chiama" (`CtaScuola.tsx:18`,
`site-settings.ts`). Si aggiunge un helper accanto ai due esistenti (`formatPhoneIT`,
`phoneHref`):

```ts
/** Costruisce un link wa.me da un numero IT + messaggio precompilato. */
export function whatsappHref(raw: string, text?: string): string {
  const d = raw.replace(/\D/g, "");
  const e164 = d.length === 10 ? `39${d}` : d;   // 10 cifre = mobile IT senza prefisso
  return `https://wa.me/${e164}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
```

**Messaggio precompilato:**
```
Ciao! Vorrei prenotare una lezione di prova per mio figlio/a. Età:
```
Tre proprietà volute: (a) è **inviabile così com'è**, quindi non è un compito; (b) finisce su
uno **slot aperto** che si completa con un tocco, e regala al titolare l'unico dato che
determina il gruppo; (c) è corto, quindi nessun client lo tronca.

**Degrado obbligatorio:** `getSiteSettings()` è SAFE e può ritornare `{}` (env mancante, Airtable
giù, preview). Se `scuola-telefono` manca, **porta A non sparisce**: la CTA diventa
`Scrivici` → `/contatti?motivo=prova`. La porta bassa non può dipendere da un fetch.

---

## 12 · Degrado al 27 settembre (e a qualsiasi altra data)

| Elemento | Cosa succede il 27 settembre | Chi lo spegne |
|---|---|---|
| Le due porte | **Nulla. Restano identiche.** | — sono in codice, permanenti |
| Riga stagionale Narni in porta A | sparisce il 20 | la **data dell'evento** |
| Blocco Narni su `/prova` | sparisce il 20, la pagina resta completa | la **data dell'evento** |
| Righe gare in "In programma" | spariscono il 13 e il 27 | la **data dell'evento** |
| Fascia "In programma" | se resta a 0 eventi, il **titolo e le righe** spariscono; **il ticker resta** | automatico |
| Flash campagna in hero | sparisce a `VALIDO_A`, **e comunque entro 90 giorni** (tetto in codice) | Airtable + rete di sicurezza |
| Ticker | non contiene date fisse: solo fatti senza scadenza + eventi iniettati | automatico |

**La home del 27 settembre è esattamente la home del 12 agosto meno una riga di eventi.** Nessun
buco: la fascia 3 non scompare mai del tutto perché il ticker (fatti senza scadenza) ne è il
pavimento; scompaiono solo le righe datate.

E soprattutto: **niente può invecchiare male.** Oggi `HomeTicker.tsx:11` annuncia ancora
*"Marathon MTB 209 · 28 GIU 2026"*, una data passata da sei settimane, perché è cablata a mano.
Nel modello proposto una data può solo **sparire**, mai **restare sbagliata**.

---

## 13 · Dati e operatività

### 13.1 Cosa sta in codice e perché

| In codice, permanente | Perché |
|---|---|
| Le due porte (copy, prezzi dichiarati, destinazioni) | è la grammatica del sito, non un contenuto. Non deve poter sparire, né invecchiare, né dipendere da un fetch |
| `<h1>`, sottotitolo, eyebrow | identità di brand |
| Pagina `/prova` (struttura e fatti stabili) | i fatti — 2 lezioni, bici qualsiasi + casco, martedì/giovedì — cambiano quasi mai; se cambiano è un cambio di prodotto, non di comunicazione |
| Voci "senza scadenza" del ticker | fatti permanenti |

### 13.2 Cosa sta su Airtable

| Tabella | Stato | Cosa governa | Scade da sé? |
|---|---|---|---|
| `Impostazioni Sito` | **esistente** | `scuola-telefono` (→ wa.me e tel:), `scuola-referente` (→ "ti risponde …") | n/a |
| `Comunicazioni Hero` | **esistente, invariata** | **una sola riga** flash in hero + `IMMAGINE_URL` = mascotte dell'hero | sì, `VALIDO_A` + tetto 90 gg in codice |
| `Sfondi Video` | **esistente, invariata** | fondale vivo hero e CTA | n/a |
| **`Eventi`** | **NUOVA** | righe di "In programma", riga stagionale di porta A, blocco su `/prova`, voci datate del ticker | **sì, per `DATA`** |

**Schema `Eventi`** (una tabella, quattro consumatori):

| Campo | Tipo | Nota |
|---|---|---|
| `NOME` | singleLineText (primary) | uso interno |
| `TITOLO` | singleLineText | "Gara su strada · Giovanissimi" |
| `DATA` | date | **è anche la scadenza** |
| `DATA_FINE` | date, opz. | eventi multigiorno |
| `LUOGO` | singleLineText | "Ciclodromo Renato Perona, Terni" |
| `TIPO` | singleSelect | `gara` · `porta-aperta` · `evento` |
| `NOTA` | singleLineText | "Iscrizioni tramite le società, sui canali FCI." |
| `LINK_LABEL` / `LINK_URL` | singleLineText, opz. | solo se una destinazione esiste davvero |
| `PUBBLICATO` | checkbox | kill switch manuale |

Helper `src/lib/eventi.ts`, calco esatto di `comunicazioni-hero.ts`: SAFE (`try/catch → []`),
ISR `revalidate: 300`, filtro `PUBBLICATO` + `(DATA_FINE ?? DATA) >= oggi`, ordinamento per data.

**Perché una tabella nuova invece di riusare `Comunicazioni Hero`:** in `Comunicazioni Hero` la
scadenza è un campo separato (`VALIDO_A`) che qualcuno deve **ricordarsi di compilare**. In
`Eventi` la scadenza **è la data dell'evento**: dimenticarsene è impossibile, perché è il dato
stesso che stai inserendo. Dato il fatto n.9 (aggiorna solo il titolare, "quando serve"), questa
differenza non è estetica: è la garanzia che la home non marcisca.

### 13.3 Chi fa cosa

| Attività | Chi | Frequenza | Costo |
|---|---|---|---|
| Inserire un evento | titolare, direttamente in Airtable | quando ne nasce uno | ~1 min a evento |
| Spegnere un evento passato | **nessuno** | mai | 0 |
| Cambiare numero WhatsApp / referente | titolare, `Impostazioni Sito` | rarissimo | ~1 min |
| Riga flash in hero | titolare, `Comunicazioni Hero` (già sa farlo, ha l'admin) | stagionale | ~2 min |
| Cambiare copy delle porte | dev, deploy | quasi mai | — |

### 13.4 Costi di manutenzione introdotti — dichiarati

1. **Nuova tabella `Eventi` su PROD *e* DEV** (allineamento schema come macro-task 0, per la
   regola già codificata in `AGENTS.md`).
2. **Nessuna UI admin per `Eventi` in v1**: il titolare la modifica dall'interfaccia Airtable,
   come già fa per `Impostazioni Sito` e `Sfondi Video`. Una pagina
   `/portale/admin/eventi` è un follow-up desiderabile, **non un prerequisito**. Costo differito,
   dichiarato.
3. **Nuova route pubblica `/prova`**: metadata, canonical, `sitemap.ts`, immagine OG (riusabile
   `/og/home.jpg` in v1).
4. **Nuovo motivo nel form contatti**: `"Lezione di prova"` in `MOTIVI` (`ContactForm.tsx:21`),
   nell'enum zod (`api/contatti/route.ts:25`), **e come choice del singleSelect Airtable
   `CONTATTI.MOTIVO`** — che, per la lezione già appresa su Airtable, si aggiunge scrivendo un
   record con `typecast: true` o a mano nella UI, non via API di schema. Più la chiave deep-link
   `prova` in `motivoFromKey`.
5. **`whatsappHref()`** in `site-settings.ts` (≈6 righe).
6. **Modifiche a componenti esistenti**: `HomeHero`/`HeroCampagne` (h1 statico, niente
   rotazione, flash), nuovo `PorteIngresso` + `CoppiaPorte`, `HomeTicker` (da statico a
   alimentato), `ApexNavBar` (cluster CTA), `CtaFinale` (+ prop `variant` per non alterare
   `/chi-siamo` e `/gli-amatori-triono` che la riusano), `SezioneScuola`, `ScuolaHero`,
   `SezioneCorsi`, `CtaScuola`, `SezioneComeIscriversi` (+ `id="come-iscriversi"` sulla sezione).
7. **Debito rimosso, non aggiunto**: sparisce il carosello dell'hero (rotazione, dot, roving
   tabindex, pausa, `inert`), sparisce il ticker cablato a mano che oggi è già sbagliato.

---

## 14 · Accessibilità e sistema

- **Un solo `<h1>`**, statico, in hero. Le porte sono `<h2>`; la fascia "In programma" è `<h2>`.
- **Semantica delle porte**: ogni porta è un `<article>` con
  `<h2><span class="apex-eyebrow">Tuo figlio non ha mai provato?</span> Fino a due lezioni di
  prova, gratis.</h2>`. Chi naviga per intestazioni sente **criterio + promessa** in un colpo
  solo — la stessa scorciatoia che l'occhio ha visivamente.
- **Contrasto**: le porte stanno su `--stage-surface` in livrea Scuola → accento giallo
  `#F4E718`, **15.5 : 1** su `#030818` (tabella §8.1 del DS): AA e AAA anche per il mono a 11px.
  Il fill primary usa ink scuro `#04091c` come da regola DS. Nessuna riga significativa in
  `text-stage-faint` (fallisce AA per il testo piccolo).
- **Ordine di focus = ordine DOM** (nessun riordino CSS fra desktop e mobile: la sequenza è la
  stessa, cambia solo la disposizione). Tab order del primo viewport: flash (se c'è) → CTA A →
  link A → CTA B → link B. **Cinque tappe contro le quindici di oggi.**
- **Target ≥ 44 px**: `.apex-cta` è `padding: 15px 26px` su mono 11px ≈ 44 px di altezza; su
  mobile le CTA sono full-width.
- **Link esterno**: la label contiene la parola "WhatsApp", quindi la destinazione è annunciata;
  `rel="noopener"`.
- **`prefers-reduced-motion`**: superficie di movimento drasticamente ridotta (via il carosello).
  Restano `.reveal` (già RM-safe) e il fondale vivo, che degrada a poster.
- **Budget APEX rispettato**: un solo fondale vivo per viewport (hero); le porte sono superficie
  piena. Un solo prop L+1 su mobile (la mascotte). **Contenuto della pista sacro**: nessun prop
  sopra porte, testo o CTA — la mascotte è ancorata al bordo inferiore dell'hero, che finisce
  *prima* della fascia porte.
- **Livree**: hero e regia in Racing (il brand padre firma), porte in Scuola. Il cambio di livrea
  è il segnale che il pubblico cambia.
- **No-JS**: le porte sono Server Component puri, link `<a>`. Funzionano senza una riga di JS —
  cosa che oggi, con la porta unica dentro un carosello client, non è vera allo stesso modo.

---

## 15 · Rischi e trade-off accettati

**R1 · La paralisi è ridotta, non eliminata.** Chi non è né "mai provato" né "già deciso" (es.
"l'anno scorso ha fatto la prova, quest'anno vogliamo capire i costi") non si riconosce in
nessuna delle due domande. Mitigazione: il titolo di porta B è neutro e i link quieti raccolgono
gli indecisi. **Residuo reale**, ed è il punto più fragile della tesi: *ogni* criterio binario
lascia fuori una coda.

**R2 · Il bottone acceso è la prova, non l'iscrizione.** Alcuni genitori già decisi cliccheranno
il bottone pieno per abitudine e finiranno in WhatsApp. Costo: un messaggio da gestire a mano
invece di un'iscrizione automatica. È **il prezzo esplicito della tesi**, e va misurato: se il
rapporto messaggi/iscrizioni peggiora oltre il tollerabile, la regola di livrea si inverte in una
riga.

**R3 · WhatsApp concentra il funnel su una persona sola.** La promessa *"ti risponde {referente}
in persona"* è il pregio della porta A e, se i volumi crescono, la sua fragilità. In v1 non c'è
mitigazione oltre al fallback email. È la cosa da tenere d'occhio per prima.

**R4 · Tolgo al titolare la rotazione dell'hero.** Guadagna una riga flash e una fascia eventi
strutturata; perde "tutte le campagne in hero". Se la vuole indietro, il componente esiste
ancora: si passa un array invece di un elemento. **Reversibile in un commit**, ma è una perdita
di controllo che va detta.

**R5 · Su viewport alti ≤ 667 px la CTA di porta B è appena sotto la piega** (§7). Documentato con
i numeri, con l'alternativa valutata e il motivo per cui l'ho scartata.

**R6 · Due porte = una grammatica da difendere su 8 componenti.** Basta una futura sezione che
aggiunge una terza CTA e il sistema si sfilaccia. Mitigazione **architetturale**: `CoppiaPorte`
è un componente unico che non ha la prop per una terza porta. Il vincolo è nel tipo, non nella
buona volontà.

**R7 · `/prova` e `/la-scuola` competono sulla stessa intenzione di ricerca.** Cannibalizzazione
lieve. Mitigazione: intenti distinti (`/prova` = "lezione di prova ciclismo Terni",
`/la-scuola` = la scuola), canonical propri, link incrociati espliciti.

**R8 · La fascia "In programma" può restare vuota per mesi.** Ho scelto che il ticker ne sia il
pavimento, così non c'è mai un buco; ma una home che finge attività sarebbe peggio di una che
tace. **Accetto che per parte dell'anno quella fascia sia solo un ticker.**

**R9 · La seconda metà della riga di `PRODUCT.md`** — *"chi cresce può diventare atleta della
squadra"* — **non è nel primo viewport.** La porta l'eyebrow (`SCUOLA · SQUADRA · GARE`) e la
sequenza della pagina. Scelta consapevole: nel primo schermo ottimizzo l'instradamento, il
racconto del percorso è lavoro della pagina.

---

## 16 · Sequenza di rilascio proposta

Tre tagli, il primo indipendente dalle date di settembre.

**Taglio 1 — la porta (sblocca subito il problema della mamma).**
`CoppiaPorte` + `PorteIngresso` in home · pagina `/prova` · `whatsappHref()` · motivo
`"Lezione di prova"` nel form · cluster CTA in navbar (incluso il chip mobile, che oggi manca) ·
`id="come-iscriversi"` · sostituzione delle 4 CTA identiche con la coppia. **Zero dipendenze da
Airtable nuove. Zero dipendenze dalle date.**

**Taglio 2 — l'hero.**
`<h1>` statico e unico · flash a una riga con tetto 90 giorni · niente rotazione · HUD spostato ·
altezze del primo viewport calibrate con `dev-shot.mjs` su 1440×900, 390×844 e 375×667.

**Taglio 3 — il tempo.**
Tabella `Eventi` (PROD + DEV) · `src/lib/eventi.ts` · fascia "In programma" · ticker alimentato ·
riga stagionale in porta A e blocco su `/prova`. **Da avere in piedi entro fine agosto** perché
il 12 settembre abbia senso, e perché il QR di Narni punti a una pagina già viva.

---

## 17 · Domande ancora aperte per il committente

1. Le gare del 12 e 26 hanno un **orario** da pubblicare? Una riga di tabellone senza ora è
   monca.
2. **Il pubblico può venire a guardare** le gare al ciclodromo? Non l'ho scritto perché non è un
   fatto accertato — oggi il sito dichiara l'ingresso libero solo *durante le lezioni*.
3. **Narni Sport Night: che orario**, e c'è un'età minima per il percorso di agilità?
4. Il messaggio WhatsApp precompilato va bene così, o preferisci che chieda **anche il giorno**
   (martedì/giovedì) per smistare subito?
5. La microcopy *"Ti risponde {referente} in persona"* usa `scuola-referente`: il valore attuale
   su Airtable è un **nome proprio** utilizzabile in pubblico?
6. Se un genitore scrive su WhatsApp **fuori orario o in alta stagione**, vuoi che la porta A
   dichiari un tempo di risposta? Oggi non lo dichiaro, perché non è un fatto verificato.
