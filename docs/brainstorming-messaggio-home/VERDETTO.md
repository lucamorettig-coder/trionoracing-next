# Verdetto — architettura del messaggio della home

Valutazione in cieco di tre proposte indipendenti. Ogni affermazione tecnica citata dalle
proposte è stata riverificata nel codice: le verifiche sono elencate in §0 e richiamate dentro
i singoli test.

Data della valutazione: 6 agosto 2026. Branch `chore/design-sync-apex`, `main` come riferimento.

---

## 0 · Verifiche nel codice — cosa regge e cosa no

Ho controllato riga per riga tutte le affermazioni tecniche verificabili. Sintesi.

### Affermazioni confermate (tutte e tre, dove le fanno)

| Affermazione | Esito |
|---|---|
| `HeroCampagne.tsx:253` → `const TitleTag = i === 0 ? "h1" : "p"` | ✅ esatto |
| Il claim brand degradato a `<p>` 15px (`HeroCampagne.tsx:240-243`) | ✅ esatto |
| `HomeTicker.tsx:11` → `28 GIU 2026` cablato a mano, data passata | ✅ esatto |
| `Ticker` è `aria-hidden="true"` (`Ticker.tsx:21`), marquee | ✅ esatto |
| `apex.css:78` navbar `height: 60px` · `apex.css:131` ticker `height: 34px` | ✅ esatti entrambi i numeri di riga |
| `apex.css:276` ghost = `box-shadow: inset 0 0 0 1px var(--accent)` su `--stage-ink` | ✅ esatto |
| `.apex-cta` = `padding: 15px 26px` | ✅ esatto |
| racing `--accent` ciano `#37C8FF` / `--accent-2` giallo `#F4E718`; scuola `--accent` giallo / `--accent-2` arancio `#FF8A3D` | ✅ esatti tutti e quattro gli hex |
| Contrasti: giallo 15.5:1 · ciano 10.3:1 · `stage-muted` 6.7:1 · `stage-faint` 2.7:1 | ✅ combaciano con DS-APEX §8.1; ho ricalcolato 15.5 / 6.68 / 2.74 in modo indipendente |
| `isComunicazioneInCorso` pura, `oggi` iniettata, estremi inclusi, riga 64 | ✅ esatto |
| `getSiteSettings()` SAFE → `{}` · `phoneHref` / `formatPhoneIT` esistenti | ✅ esatto |
| `revalidatePath("/")` nel CRUD admin comunicazioni (`actions.ts:22`) | ✅ esatto |
| Nessun `wa.me` in tutto `src/` | ✅ esatto (grep: zero occorrenze) |
| `SezioneScuola.tsx:124`, `CtaFinale.tsx:43`, `ApexNavBar.tsx:79`, drawer ~156 | ✅ esatti |
| Navbar mobile: oggi **nessuna CTA**, solo hamburger | ✅ esatto |
| `ContactForm.tsx:21` `MOTIVI` (4 valori) duplicati in `api/contatti/route.ts:25` | ✅ esatto |
| "Rispondiamo entro 2–3 giorni" (4 occorrenze, incluso il messaggio di successo `:115`) | ✅ esatto |
| `CtaScuola.tsx:18` telefono · `:42` paragrafo prova · eyebrow `ISCRIZIONI APERTE` | ✅ esatti |
| `LinkProva` riga 253 → `/contatti?motivo=scuola`, link soft non bottone | ✅ esatto |
| `HeroCampagne` usa `<a href>` (284, 289) invece di `next/link` | ✅ esatto |
| `line-clamp-2` sul sottotitolo slide (`:277`) → troncamento silenzioso | ✅ esatto |
| `priority` su foto sotto la piega in `SezioneScuola` (riga 77) | ✅ esatto (citata `:78`, off-by-one) |
| Sei link di navigazione nel layout pubblico | ✅ esatto |
| `id="come-raggiungerci"` esiste; `id="come-iscriversi"` non esiste | ✅ esatti entrambi |
| `scripts/dev-shot.mjs` esiste | ✅ esatto |
| DS-APEX §4 L+2 "Regia — chrome broadcast, sempre sopra"; §1.7 "il brand padre firma tutto"; principi 1 e 3 | ✅ citazioni corrette (§1.7 è citato alla lettera anche nel commento di `ApexNavBar`) |
| Limite API Airtable sulle choice dei singleSelect / 422 `INVALID_MULTIPLE_CHOICE_OPTIONS` | ✅ coerente con le lezioni EVO-011/018/026 in `AGENTS.md` |

Il livello di accuratezza tecnica è alto in tutte e tre. Nessuna proposta ha inventato numeri,
testimonianze o prove sociali. Il test 8 è superato da tutte, e non è scontato.

### Errori verificati — penalità

**Proposta A**

1. **«La funzione esiste già, è pura ed è testata» (§11)** — ❌ **falso.** Nel repo non esiste
   nessun file di test (`find src -name "*.test.*"` → zero risultati; nessuna cartella
   `__tests__`). La funzione *è* pura e testabile, ma non è testata. Errore minore, ma è
   proprio nella sezione dove A promette solidità.
2. **Aritmetica del wireframe mobile (§7)** — ❌ **non regge.** A colloca lo slot ① da 458 a
   546px, cioè **88px**, e dentro ci mette: etichetta mono + titolo su 2 righe + sottotitolo su
   2 righe + un bottone CTA da 44px. Il minimo fisico è ~150–160px. Il bottone "Scrivi su
   WhatsApp" finisce quindi **65–80px sotto la piega** su iPhone SE, non sopra come A afferma
   («lo slot ① della fascia per intero, **WhatsApp incluso**»). Il *criterio* dichiarato da A
   (bordo superiore della fascia ≥72px sopra la piega) regge; è la promessa più forte del
   wireframe a non reggere — ed è quella che A usa per superare il test 2.
3. **Le quattro celle HUD spariscono senza essere nominate.** A propone una hero statica, ma la
   hero statica reale (`HomeHero.tsx:78-86`) ha un `Hud` con 4 metriche. Il wireframe e la
   tabella di densità di A non le contengono e A non dice mai che le rimuove né dove vanno.
   B e C lo dichiarano entrambi esplicitamente.
4. **Ha mancato la card `/contatti` p.97.** Vedi sotto: è uno dei due reperti che il committente
   ha indicato come meritevoli di credito.
5. Forzatura retorica minore: A rivendica che la sua fascia «è già nel sistema, si chiama L+2
   Regia». Il DS definisce L+2 come **Fixed/sticky**; la fascia di A è nel flusso del documento
   (cosa che A stessa dichiara altrove, correttamente, per non violare "L0 sacro"). L'idea è
   giusta, l'appropriazione della sigla è un po' generosa.

**Proposta B**

1. **«Esce *Accedi all'area genitori* (già in navbar auth-aware e nel footer)» (§5)** — ❌
   **falso sul footer.** `ApexFooter.tsx` non ha nessun link a `/portale*`: i link sono
   `/la-scuola`, `/gli-amatori-triono`, `/chi-siamo`, `/diventa-maestro`, `/marathon-209`,
   `/contatti`, più le legali. Lo stesso errore regge in parte la mitigazione di §15.1 («cinque
   punti di atterraggio … più il footer»), che è il contrappeso alla decisione più costosa
   della proposta (togliere "Iscrivi tuo figlio" dalla navbar desktop).
2. **`CtaFinale` è condivisa e B non se ne accorge.** ❌ Verificato: `CtaFinale` è importata da
   `/`, `/chi-siamo` e `/gli-amatori-triono`. B ne ricabla la CTA primaria su "Prenota una
   prova" senza prop di variante: risultato, la pagina **Amatori & Agonisti** chiuderebbe con
   un invito a prenotare una lezione di prova per bambini. È una regressione che B spedirebbe.
   A e C rilevano entrambe il problema e aggiungono una prop `variant` (A conta correttamente
   i tre call site).
3. **Caratterizzazione eccessiva della card `/contatti`.** B ha *trovato* il problema — merito
   reale, è l'unica — ma lo definisce «una cosa falsa» che «contraddice frontalmente» il fatto
   accertato. La card parla di **venire a guardare** una lezione, non di provare in sella. Il
   difetto vero è che la distinzione non è dichiarata da nessuna parte, esattamente come
   inquadrato nei fatti accertati. Il rimedio proposto da B (riscrivere la card imponendo di
   scrivere prima) rischia di **chiudere una porta ancora più bassa** invece di nominarla.
4. Aritmetica della piega senza chrome del browser (§6, «iPhone X 812 meno navbar 60 = 752
   utili»): metodologicamente sbagliata, ma la conclusione **sopravvive** perché lo stack di B
   è corto (~536px fino alla microcopy): anche con ~553px utili reali su SE entrambe le CTA
   restano sopra la piega.

**Proposta C**

1. **«L'`<h1>` … ruota ogni 7 secondi» (§5.2)** — ❌ **falso.** Il tag `h1` è assegnato a
   `i === 0`, cioè sempre allo stesso `<article>` (la comunicazione a priorità più alta). La
   rotazione cambia solo opacità/`aria-hidden`/`inert`: l'elemento `<h1>` e il suo testo non
   cambiano mai dopo il render. Il *messaggio visivo* ruota — e su questo C ha ragione nella
   sostanza — ma l'affermazione tecnica com'è scritta è sbagliata. B è precisa («il titolo
   della **prima** comunicazione»); A cita il codice e si autocorregge.
2. **Contraddizione interna sulla regola cardine.** ❌ §11.1: «**Regola di livrea unica, valida
   ovunque:** porta A = `primary` (fill accento) · porta B = `ghost`. **Sempre, anche in
   navbar.**» §11.2, tabella, due righe dopo: NavBar desktop `Prova gratis` → **ghost sm**;
   NavBar desktop `Iscrivi tuo figlio` → **primary sm**. È l'inverso esatto. E non è un
   dettaglio: la navbar è l'unica superficie presente nel primo viewport di **ogni** pagina, e
   su mobile è l'**unica** CTA che C introduce come mitigazione per iPhone SE. Nella proposta
   che fa della "grammatica apprendibile" la propria tesi, la grammatica si rompe proprio dove
   il committente ha il problema.
3. **Aritmetica della piega: altezza dello schermo scambiata per altezza del viewport.** ❌
   Sistematico. Desktop: «1440×900, navbar 60 → **840px visibili**». Mobile: somma 758px e
   piega dichiarata a **812**. Il chrome del browser (barre desktop ~90–120px; Safari iOS
   ~100–115px) non è mai sottratto. Corretto: su desktop il margine di 108px diventa ~20–50px
   e la promessa che «la fascia 3 sbircia sotto la piega» svanisce; su 375×812 la somma di 758
   supera i ~700–712px realmente utili, quindi **la CTA di porta B finisce sotto la piega
   proprio sul viewport che C dichiara superato senza riserve**. A è l'unica delle tre a
   modellare esplicitamente l'altezza *usable* e a usare `svh` come ipotesi peggiore.

---

## 1 · Valutazione — Proposta A

> *"La home come palcoscenico, con una regia."* Tesi: hero permanente e deterministica, tutto
> ciò che ha una data scende in una fascia di regia sotto la hero.

### Test 1 — Dieci secondi · **PASSA**

È l'unica proposta che porta **entrambe le metà** della riga di `PRODUCT.md` nel primo viewport
con parole vere. Il sottotitolo — *«Bambini dai 4 anni, maestri federali, al Ciclodromo Renato
Perona di Terni. Si comincia con due lezioni di prova gratuite; chi cresce continua con la
squadra»* — è 156 caratteri, cinque fatti tutti verificati, zero aggettivi, e chiude con la
seconda metà della riga che B e C dichiarano entrambe di non riuscire a portare. La parola
"gratuita/e" compare tre volte nel primo viewport senza mai ripetersi nella stessa frase. Il
claim torna a essere l'`<h1>` reale.

### Test 2 — La mamma · **PASSA**

La porta è nel primo viewport come **CTA primaria della hero** ("Prenota una prova gratuita",
accento pieno), quindi il test è superato indipendentemente dalla fascia. Due clic per la via
informata (hero → `/prova` → WhatsApp), uno per la via veloce. I momenti di dubbio sono
smontati uno per uno e nel posto giusto: *«Serve solo una bici qualsiasi e il casco. Si concorda
prima, su WhatsApp»*. La scelta di "**Prenota**" invece di "Vieni a provare" è argomentata sul
fatto accertato n. 2 ed è corretta: "vieni a provare" produrrebbe esattamente il comportamento
che oggi non funziona.

**Riserva:** la via veloce (bottone WhatsApp nella fascia) **non è** sopra la piega su iPhone SE,
contrariamente a quanto A afferma — vedi §0. Il test passa lo stesso perché la porta vera è
nella hero, ma A vende una garanzia che i suoi numeri non sostengono.

### Test 3 — Quattro pubblici · **PASSA**

La separazione più rigorosa delle tre, e l'unica espressa come **regola di sistema
verificabile**: la porta bassa è sempre `primary` (accento pieno), la porta alta sempre
`support` (accent-2 pieno), le gare sono etichetta mono + data, gli amatori sono navigazione.
Quattro canali visivi diversi, non quattro intensità dello stesso. La regola poggia sul
principio 3 del DS («i componenti sono ciechi ai colori», verificato) e si controlla con un
grep. Il pubblico ③ è sotto la piega su iPhone SE: dichiarato e accettato con una motivazione
sensata (è l'unico pubblico che arriva già sapendo cosa cerca).

### Test 4 — Densità · **PASSA CON RISERVA**

Il conteggio per **peso** (T1 dominante / T2 azione / T3 contesto / T4 chrome) invece che per
numero è il modo giusto di contare, e la conclusione — «decisioni reali offerte: due» su desktop
e su mobile — è quella che conta. Riserva: A non nomina mai le quattro celle HUD della hero
statica che sta proponendo di ripristinare (§0, errore 3), quindi il conteggio del primo
viewport è incompleto per costruzione. E A non dichiara un punto di rottura esplicito come fanno
B e C.

### Test 5 — Scadenza · **PASSA — la migliore delle tre**

È l'unica che mostra **cosa vede un visitatore giorno per giorno**, dal 19 agosto al 27
settembre, in una tabella con il numero di colonne per ogni finestra temporale. La griglia
`auto-fit minmax(260px, 1fr)` collassa da 3 a 2 slot senza buchi — è degradazione di layout, non
un caso da gestire. Gli slot ① e ③ sono cablati nel codice, quindi **non possono sparire** per
un errore di configurazione. E c'è una seconda tabella con cinque modalità di guasto (Airtable
irraggiungibile, telefono mancante, video assente, JS spento, reduced-motion) con l'esito di
ciascuna. Nessuna riga richiede che una persona faccia qualcosa in una certa data.

### Test 6 — Operatività · **PASSA — la migliore delle tre**

Riusa la tabella esistente **e la schermata admin esistente** (`revalidatePath("/")` verificato):
il titolare non deve imparare niente di nuovo. Un solo campo nuovo (`SLOT`), con la trappola API
di Airtable sui singleSelect dichiarata correttamente. Una sola regola operativa da ricordare, e
sta in una riga: *«`VALIDO_A` è il giorno dell'evento. Il resto si spegne da solo.»* Costo
ricorrente zero. E la disciplina di rifiutare la complessità non necessaria — *«orari da Airtable
già adesso: complessità per un problema che non abbiamo»*, con la via tracciata se servirà — è
esattamente il giudizio che ci si aspetta a questo livello.

Il principio di ripartizione delle responsabilità è la frase migliore di tutto il fascicolo sul
piano operativo: **«Il codice garantisce la presenza. Airtable modula l'enfasi.»**

### Test 7 — Coerenza di sistema · **PASSA**

Tabella di conformità completa e corretta su tutti i vincoli: `<h1>` unico ripristinato (oggi
violato, verificato), un solo fondale vivo, un solo prop L+1 su mobile, L0 mai coperto (la
fascia è nel flusso, non sticky né dismissible), contrasti giusti con divieto esplicito di
`stage-faint` su testo piccolo, SC 2.2.2 risolto **per sottrazione** (oggi il ticker scorre senza
controlli). È anche l'unica ad aver notato che `ApexCta` usa sempre `next/link` e non espone
`target`, quindi il link `wa.me` richiede un `<a target="_blank" rel="noopener noreferrer">` con
le classi — dettaglio che B e C non vedono. Piccola forzatura sull'etichetta L+2 (§0).

### Test 8 — Onestà · **PASSA CON RISERVA**

Zero prove sociali inventate, dichiarato esplicitamente. Otto rischi ordinati per gravità, con
il primo che ammette *«rischio residuo: reale — è il punto in cui questa architettura può
degradare silenziosamente»* sulla propria garanzia centrale. Cinque alternative valutate e
scartate con motivo. La riserva è il «è testata» falso e l'aritmetica mobile che promette più di
quanto i numeri diano.

**Extra di valore reale:** §17, *«se si potesse fare una cosa sola»* — due file toccati, nessun
campo Airtable, nessuna route nuova, e il problema della mamma è chiuso in giornata. È l'unica
proposta che si taglia da sola in un MVP onesto.

---

## 2 · Valutazione — Proposta B

> *"La porta bassa."* Tesi: la lezione di prova diventa la CTA primaria assoluta della home;
> "Iscrivi tuo figlio" retrocede a porta di chi ha già deciso.

### Test 1 — Dieci secondi · **PASSA CON RISERVA**

La metà che il test rende eliminatoria — *sa che può provare gratis* — passa in modo
schiacciante: l'`<h1>` **è** quella frase. Ma B dichiara essa stessa (§15.8) che la prima metà
della riga di `PRODUCT.md` — *«chi cresce può diventare atleta della squadra»* — **non passa nei
primi dieci secondi**, e la compensa con una voce di ticker e una riga di chiusura due schermi
più in basso. Onesto, e il test formalmente lo supera. Ma il costo è alto: la home di un club che
si posiziona come «un unico percorso» rinuncia a dire il percorso proprio nel viewport in cui
tutti guardano.

### Test 2 — La mamma · **PASSA — la più robusta delle tre**

La porta è l'unico elemento giallo pieno del primo viewport e l'`<h1>` la nomina. Zero momenti di
dubbio prima del clic: le tre obiezioni (costa? serve una bici da corsa? devo iscrivermi?) sono
disinnescate rispettivamente da h1, microcopy e sottotitolo. Ed è l'unica che **sopravvive alla
correzione della propria aritmetica**: ricalcolando con l'altezza utile reale di un iPhone SE
(~553px invece dei 607px dichiarati), entrambe le CTA restano sopra la piega, perché lo stack è
corto e non c'è nient'altro che compete. Sul viewport peggiore, è la proposta che regge meglio.

### Test 3 — Quattro pubblici · **PASSA CON RISERVA**

Quattro porte distinguibili, con la scelta più intelligente sul pubblico ③: pastiglie mono con
data in accento, *«il linguaggio APEX della telemetria, che l'occhio legge come "dato", non come
"pubblicità"»*. La riserva è il pubblico ②: B toglie "Iscrivi tuo figlio" dalla navbar desktop.
Lo dichiara come il costo più concreto (§15.1) e lo mitiga con cinque punti di atterraggio — ma
uno dei cinque (il footer) **oggi non esiste** (§0), e la navbar è l'unica superficie presente
in ogni viewport di ogni pagina. Il genitore già deciso che arriva su `/chi-siamo` perde la sua
porta a un clic.

### Test 4 — Densità · **PASSA — la migliore delle tre**

È l'unico conteggio fatto sui **tre stati reali** (oggi con campagne attive / oggi con hero
statica / proposta) e sul numero che conta davvero: **9 elementi cliccabili contro 2**. E, unica
delle tre, nomina un punto di rottura manutenibile — *«a 8 elementi / 3 CTA: oltre quella soglia
la CTA gialla smette di essere l'unico fuoco visivo»* — con l'istruzione di scriverlo nel
commento del componente «non lasciato all'intuito di chi lo toccherà fra un anno». Questa è
disciplina di sistema, non di documento.

### Test 5 — Scadenza · **PASSA**

La mossa migliore di tutto il fascicolo su questo test è di collocazione, non di meccanica: la
sezione *Settembre* sta **dopo** `ComeRaggiungerci` proprio perché, quando sparisce, la sequenza
superstite è **identica a quella di oggi** (verificato su `page.tsx`: Hero → Ticker → Scuola →
Dove → Amatori → Marathon → CTA). *«Non degrada con eleganza: degrada nella sua forma
naturale.»* Componenti condizionali che si portano dietro il proprio contenitore (niente bordo
orfano, niente titolo senza contenuto), e la regola *nessuna data nel ticker, mai*, che rende
strutturalmente impossibile ripetere il bug che oggi è in produzione.

### Test 6 — Operatività · **PASSA**

Tabella chi-aggiorna-cosa completa e corretta, un campo nuovo (`POSIZIONE`) con la trappola
Airtable dichiarata su PROD+DEV, riuso della tabella e del CRUD esistenti. Dichiara senza sconti
i costi che introduce, incluso quello che di solito si nasconde: *«il sistema di rotazione della
hero perde il palcoscenico … è una retrocessione di una scelta presa da poco»*, con l'inventario
di cosa si butta (niente: `lib/` e admin restano) e cosa cambia (il componente di presentazione).
Il rilievo che gli orari restano cablati in cinque punti è onesto e la mitigazione è
correttamente marcata come tagliabile.

### Test 7 — Coerenza di sistema · **PASSA CON RISERVA**

Tecnicamente la più accurata sul design system: il ragionamento sul giallo è la cosa più fine
del fascicolo — *«in livrea racing `--accent-2` è il giallo `#F4E718`, cioè lo stesso giallo che
è `--accent` nella livrea Scuola»*, quindi usando `apex-cta--support` in hero **il giallo diventa
il colore della porta della prova in tutto il sito, a costo zero di CSS**, senza rompere la
regola "un accento più un supporto per livrea". Verificato: esatto. Nota anche la trappola
`.apex-data` unlayered che non protegge lo span figlio — una lezione presa dalla storia reale
del repo. La riserva è la regressione su `CtaFinale` condivisa con due pagine adulte (§0), che è
proprio un difetto di coerenza di sistema.

### Test 8 — Onestà · **PASSA**

Il documento più onesto dei tre su due fronti. Primo: **contraddice `PRODUCT.md` apertamente**
(§2.4), argomenta in tre punti perché la riga *"Primary CTA: Iscriviti alla scuola"* va emendata,
scrive il testo esatto dell'emendamento, e dichiara che *«se il committente non accetta
l'emendamento, questa proposta non va implementata a metà»*. A e C **demoliscono la stessa riga
senza dirlo**. Secondo: §16 è l'unica sezione in tutto il fascicolo che rende la tesi
**falsificabile** — tre misure a costo zero, con la condizione di resa scritta: *«se dopo 60
giorni la misura 1 è zero e la misura 3 è calata, questa proposta ha torto e il modo corretto di
procedere è tornare indietro, non aggiustare»*. Questo è mestiere.

**Reperto esclusivo:** è l'unica ad aver trovato la card `/contatti` p.97 («Niente prenotazione,
basta presentarsi»). Credito pieno per averla trovata; penalità minore per averla classificata
come falsità frontale invece che come ambiguità non dichiarata.

---

## 3 · Valutazione — Proposta C

> *"Due porte, dichiarate a parole."* Tesi: alla mamma non mancava la porta bassa, le mancava
> un criterio dichiarato per capire quale porta fosse la sua.

### Test 1 — Dieci secondi · **PASSA CON RISERVA**

L'`<h1>` resta il claim e il sottotitolo porta quattro fatti verificati — ma **non contiene la
parola "prova" né "gratis"**. Il messaggio della prova arriva solo nella fascia 2, cioè dopo
tutta la hero, a ~500–730px dall'alto. Sopra la piega sì (per i numeri di C), ma non *nei primi
dieci secondi* con la stessa forza. E C ammette in R9 che la metà "squadra" della riga di
`PRODUCT.md` non è nel primo viewport, affidata a una parola dell'eyebrow. Il test passa, ma è
il passaggio più debole dei tre su questo punto — e diventa fragile appena si corregge
l'aritmetica della piega (§0).

### Test 2 — La mamma · **PASSA CON RISERVA**

**Il conteggio di clic migliore delle tre: uno.** Porta A va direttamente in chat WhatsApp, e ci
arriva dopo che il genitore ha letto criterio *e* prezzo. La diagnosi di §2 è la più profonda del
fascicolo: due bottoni che sono *due intensità dello stesso atto* costringono a valutare un
grado, e valutare un grado richiede informazioni che il genitore freddo non ha — quindi le porte
non devono essere due intensità ma **due domande con risposta ovvia**. L'analogia delle due file
del controllo passaporti («richiede zero giudizio, perché il criterio è un fatto, non
un'opinione») è la cosa più intelligente scritta da chiunque qui dentro.

La riserva è pesante e riguarda proprio la condizione eliminatoria del test — *la porta deve
essere ovvia nel primo viewport*. Corretta l'aritmetica (§0), su 375×812 la CTA di porta B
scivola sotto la piega e porta A arriva a filo; su 375×667 C stessa ammette che il bottone di
porta B è ~90px sotto. La mitigazione dichiarata è il chip "Prova gratis" nell'header mobile —
che però la tabella §11.2 assegna a **ghost**, mentre la CTA piena della navbar va
all'iscrizione. Sull'unica superficie sempre visibile, la gerarchia resta quella che il brief
chiede di invertire.

### Test 3 — Quattro pubblici · **PASSA CON RISERVA**

L'idea migliore del fascicolo sul pubblico ④: *«le porte sono in livrea Scuola (giallo caldo),
lui legge "non è roba mia" in <1s e cerca altrove — il cambio di livrea fa lavoro semantico, non
decorativo»*. Usare il sistema di livree come segnale di destinatario è precisamente ciò per cui
il DS è stato costruito, e nessun altro ci arriva. Il pubblico ③ è servito da un **tabellone**
data-first con un solo link in tutta la fascia: la disciplina giusta. La riserva è la
contraddizione navbar (§0), che colpisce la distinzione fra pubblico ① e ② proprio dove è più
visibile.

### Test 4 — Densità · **PASSA**

Conteggio a tre stati come B, con il numero più forte: **15 elementi interattivi contro 5**, e il
tab order del primo viewport ridotto da quindici tappe a cinque. Ma il contributo vero è
architetturale: il "flash" di campagna è **fisicamente una riga** — *«il layout non concede un
blocco, quindi non può degenerare. È un vincolo di costruzione, non di buona volontà»* — e
`CoppiaPorte` **non ha la prop** per una terza CTA. Due garanzie nel tipo, non nella disciplina.
È il modo giusto di impedire che "quattro volte lo stesso bottone" torni sotto altra forma.

Nota non contata da C: le due porte portano sette righe di testo ciascuna. Nel primo viewport ci
sono ~20 righe di prosa. Non è una bacheca, ma è la proposta più densa sopra la piega, e C conta
blocchi e interattivi, non righe.

### Test 5 — Scadenza · **PASSA**

Il ticker come **pavimento** della fascia 3, così non c'è mai un buco; le righe datate spariscono
da sole; un tetto di 90 giorni in codice come rete di sicurezza indipendente da `VALIDO_A`. E la
formulazione più efficace del principio: *«nel modello proposto una data può solo **sparire**,
mai **restare sbagliata**»*. R8 accetta apertamente che per parte dell'anno la fascia sia solo un
ticker, perché *«una home che finge attività sarebbe peggio di una che tace»*. Giusto.

### Test 6 — Operatività · **PASSA CON RISERVA**

Qui sta l'idea singola più preziosa dell'intero fascicolo per il vincolo del committente (solo il
titolare aggiorna, "quando serve"): **in `Comunicazioni Hero` la scadenza è un campo separato che
qualcuno deve ricordarsi di compilare; nella tabella `Eventi` la scadenza *è* la data
dell'evento, quindi dimenticarsene è impossibile, perché è il dato stesso che stai inserendo.**
Questa non è una preferenza di schema: è la differenza fra una convenzione che una persona deve
rispettare e una struttura che non le chiede niente.

La riserva: è l'unica proposta che aggiunge una **tabella nuova** e **senza UI admin in v1** —
il titolare la modifica dall'interfaccia Airtable grezza. C lo difende correttamente (fa già così
per `Impostazioni Sito` e `Sfondi Video`) e dichiara il costo come differito. Ma resta l'unica
che chiede al titolare di imparare un secondo modello mentale mentre un CRUD admin per l'altra
tabella di comunicazioni esiste già ed è collaudato.

### Test 7 — Coerenza di sistema · **PASSA CON RISERVA**

La lettura più fine del DS: *«nel DS APEX la variante `ghost` non è un link debole: è
`box-shadow: inset 0 0 0 1px var(--accent)` su testo `--stage-ink` (`apex.css:276`), cioè un
bottone pieno di bordo, alto 44px, in accento. **Porta B non è nascosta: è silenziosa.**»*
Verificato alla lettera, ed è la risposta tecnica che dissolve l'obiezione "hai sepolto
l'iscrizione". Ottimi anche l'ordine di focus = DOM, la semantica `<article>` + `<h2>` che fa
sentire "criterio + promessa" a chi naviga per intestazioni, e il no-JS. La riserva è la
contraddizione §11.1 vs §11.2, che per una proposta che si intitola alla grammatica è il difetto
peggiore possibile.

### Test 8 — Onestà · **PASSA**

Zero prove inventate. Nove rischi, con R1 che ammette il residuo sulla propria tesi centrale
(*«ogni criterio binario lascia fuori una coda»*) e R5 che documenta con i numeri il punto in cui
la proposta perde. E §17 con sei domande al committente, con la regola giusta applicata: *«Non
l'ho scritto perché non è un fatto accertato»*. Le penalità sono l'errore sull'`<h1>` che ruota
e l'aritmetica della piega.

---

## 4 · Confronto diretto — chi funziona meglio

Prendo posizione. **Vince A.** B è seconda a poca distanza ed è il documento argomentativamente
migliore. C è terza e contiene le idee singole migliori.

### Perché A

Il committente ha un problema di prodotto e un problema di manutenzione, e sono lo stesso
problema: **il sito dice la cosa sbagliata e nessuno ha il tempo di accorgersene.** La prova che
questo problema è reale è già in produzione: un ticker che da sei settimane annuncia una gara del
28 giugno.

A è l'unica proposta che risponde a entrambi con una **garanzia strutturale** invece che con una
buona intenzione:

- Le due porte permanenti (prova e orari) sono **cablate nel codice**: non possono sparire per
  un flag dimenticato, per un token Airtable scaduto, per un deploy di preview senza variabili.
  Airtable può cambiarne le parole, non può cancellarle. La tabella dei cinque guasti lo dimostra
  caso per caso.
- L'unica regola operativa è una riga (`VALIDO_A` = il giorno dell'evento), su una tabella che il
  titolare **già usa**, con una schermata admin che **già esiste** e che già fa
  `revalidatePath("/")`. Costo di apprendimento: zero.
- Il calendario è mostrato **giorno per giorno**, non solo al 27 settembre, e nessuna riga della
  timeline richiede che una persona faccia qualcosa in una certa data.
- Ripristina l'`<h1>` senza spenderlo, e il sottotitolo porta nel primo viewport tutt'e due le
  metà della riga che il visitatore deve ricordare **più** la prova. È l'unica delle tre a
  riuscirci.
- È l'unica che si taglia da sola in un MVP di due file (§17) che chiude il problema della mamma
  in giornata, e l'unica con una checklist di accettazione eseguibile prima del merge.

**Dove A perde.** Non ha una tesi strategica: instrada verso la prova senza mai argomentare
*perché* la prova converte. Il copy è corretto ma non ha nessuna riga memorabile. Ha mancato il
reperto `/contatti`. E ha una promessa mobile che i suoi stessi numeri smentiscono.

### Perché B è seconda

B ha la cosa che ad A manca del tutto: **una tesi che si difende in una riunione.** «`PRODUCT.md`
dice che non abbiamo prove sociali. Ma una prova ce l'abbiamo, ed è la migliore possibile:
novanta minuti al ciclodromo. Quindi la prova non è una concessione al genitore indeciso, è il
nostro unico asset di prova disponibile.» Questo è il ragionamento che trasforma un vincolo
dichiarato in argomento per la ristrutturazione, ed è il pezzo di brand strategy migliore del
fascicolo. §2.2 lo completa: il sito compete con un funnel che non esiste (estraneo →
iscrizione) invece di mettersi dentro quello che già funziona (persona → prova → iscrizione).

B è anche l'unica che dice ad alta voce di star contraddicendo il documento di brand, scrive
l'emendamento, e si rende falsificabile a 60 giorni.

**Dove B perde contro A.** Tre cose concrete. Primo, l'`<h1>`: *"PRIMA DI ISCRIVERTI, VIENI A
PROVARE."* è la frase esatta di cui la mamma aveva bisogno, ma è un'istruzione di funnel messa
nell'asset tipografico più prezioso del sito, e riproduce esattamente la degradazione che B
stessa critica (§3.2) — il claim di brand torna a essere un `<p>` da 15px, solo con un occupante
diverso. B ammette che non contiene né "ciclismo" né "Terni". Un club che si posiziona su «un
unico percorso» non può avere per titolo un'istruzione condizionale. Secondo, toglie
"Iscrivi tuo figlio" dalla navbar desktop e sostiene la mitigazione anche su un footer che non
esiste. Terzo, spedirebbe una regressione: `CtaFinale` è condivisa con `/chi-siamo` e
`/gli-amatori-triono`, e B non se ne accorge.

### Perché C è terza

C ha la diagnosi più profonda (§2), il copy migliore (*«Due modi per cominciare. Il primo è
gratis.»*), l'idea più intelligente sul pubblico adulto (la livrea come segnale semantico), la
garanzia architetturale più forte (`CoppiaPorte` senza prop per una terza CTA), e l'intuizione
operativa più preziosa (`DATA` = scadenza, dimenticarsene è impossibile).

E perde su tre difetti di esecuzione che in un pitch verrebbero trovati nella stanza: una
contraddizione fra §11.1 e §11.2 sulla regola che dà il titolo alla proposta; un'aritmetica della
piega che scambia l'altezza dello schermo per l'altezza del viewport, proprio nella proposta che
mette la porta più in basso di tutte; e un'affermazione tecnica falsa sull'`<h1>`.

C è la proposta da cui rubare di più. Non è la proposta da costruire.

### Sintesi per dimensione

| Dimensione | 1° | 2° | 3° |
|---|---|---|---|
| Tesi strategica | **B** | C | A |
| Diagnosi del problema | **C** | B | A |
| Copy della hero | **A** | C | B |
| Riga singola migliore | **C** | B | A |
| Robustezza sul viewport peggiore | **B** | A | C |
| Clic alla porta | **C** (1) | A/B (2) | — |
| Densità e punto di rottura | **B** | C | A |
| Degrado al 27 settembre | **A** | B/C | — |
| Operatività e costo per il titolare | **A** | B | C |
| Modello dati | **C** | A | B |
| Coerenza col DS | **A** | B | C |
| Accuratezza tecnica verificata | **B** | A | C |
| Rigore verificabile prima del merge | **A** | B | C |
| Onestà intellettuale | **B** | C | A |

---

## 5 · Confronto col reference

La domanda non è se il vincitore batte il sito di oggi: lo batte largamente, e sarebbe un
confronto vile. La domanda è se reggerebbe in un pitch davanti a un cliente esigente, con Rapha
Cycling Club per il registro, Red Bull Racing per l'energia e le academy internazionali per il
funnel della prima lezione.

**Risposta: la strategia reggerebbe. Il craft no, non ancora.** Cinque mancanze specifiche e
azionabili, e valgono per tutte e tre.

**1. Nessuna delle tre ha un'idea visiva.** Sono tre architetture dell'informazione disegnate in
ASCII. La home di Rapha funziona per una fotografia e una frase con l'aria intorno; quella di Red
Bull per il movimento e un oggetto dominante. Qui si discute di quanti slot ha una fascia. Il
sistema APEX è già costruito ed è buono — ma **nessuna proposta dice che immagine si vede nel
primo viewport**: quale fotografia, quale posa della mascotte, cosa fa l'occhio nei primi 300ms,
dove cade il silenzio. A mette il duo mascotte e la telemetria ghost perché ci sono già. B ha
l'unica riga che assomiglia a un argomento visivo — *«il salto cromatico da palco freddo a card
calde avorio è volutamente netto: è la cosa che l'occhio trova per prima scrollando»* — e finisce
lì. Questa è la distanza principale dal reference.

**2. La prova è descritta, non progettata come momento.** Le academy che il brief cita vincono
sull'**esperienza di prenotazione**: scegli una data, vedi la faccia del maestro, ricevi una
conferma. Tutte e tre finiscono su `wa.me` con una stringa precompilata. Per un club dove
risponde il titolare in persona è la mossa giusta — ma nessuna progetta la consegna: cosa risponde
il titolare, in quanto tempo, cosa riceve il genitore prima di presentarsi. Un blocco *"cosa
succede dopo che ci scrivi"*, con nome e faccia di chi risponde, vale più di tutte e tre le
pagine `/prova` messe insieme. C ci arriva più vicino con *«Ti risponde {referente} in persona»*
e poi si ferma.

**3. Il vicolo cieco di WhatsApp su desktop non è risolto da nessuno.** A lo dichiara come rischio
n. 5 e mette telefono e modulo accanto; B e C accennano al fallback. A livello di agenzia questo è
un bivio progettato, non una nota a piè di pagina: una quota reale di visitatori desktop sbatterà
contro un QR code, e quel momento è la prima impressione del club.

**4. La fascia è la parte meno progettata di tutte e tre.** "Fascia regia" (A), "bandella avvisi"
(B), "In programma" (C) sono tre nomi per lo stesso oggetto, ed è la superficie che porta due dei
quattro pubblici. Riceve un decimo dell'attenzione che riceve la hero, in tutte e tre.

**5. Il registro.** Il reference è sicurezza tranquilla. Due headline su tre stanno ancora
vendendo: *"PRIMA DI ISCRIVERTI, VIENI A PROVARE"* è un'istruzione, *"Prenota una prova
gratuita"* è una transazione. Rapha direbbe la cosa e lascerebbe che la porta fosse ovvia. *«Due
modi per cominciare. Il primo è gratis.»* è l'unica riga del fascicolo che ha quel registro — e
sta nella proposta arrivata terza.

---

## 6 · Idee da graftare sul vincitore

### Da B su A

1. **§2.1 per intero — la prova è il nostro unico asset di prova disponibile.** `PRODUCT.md`
   dichiara *"Proof on hand: nessuna prova disponibile"*: è precisamente il motivo per cui i
   novanta minuti al ciclodromo devono essere il bottone primario. A instrada verso la prova
   senza mai argomentarlo. Questo paragrafo diventa l'apertura della motivazione dell'evolutiva.
2. **§2.4 e l'emendamento a `PRODUCT.md`, testualmente**, incluso *«l'obiettivo primario non è
   automaticamente la CTA primaria»*. A retrocede "Iscrivi tuo figlio" a `support` senza toccare
   il documento di brand: è una contraddizione nascosta. O si emenda, o non si fa.
3. **La correzione di `/contatti` p.97** — reperto esclusivo di B, verificato. Ma il rimedio va
   corretto: la card parla di **venire a guardare**, non di provare in sella. Non cancellare
   l'accoglienza; **dichiarare la distinzione**, che oggi non sta scritta da nessuna parte
   (*"Venire a guardare una lezione: quando vuoi. Provare in sella: si concorda prima, così il
   maestro vi aspetta."*). Fatto così, `/contatti` diventa una porta ancora più bassa della
   prova, invece di un'ambiguità che brucia una prima impressione.
4. **La tabella di densità a tre stati e il punto di rottura nominato** (*8 elementi / 3 CTA*),
   da scrivere nel commento del componente. E **§16, il protocollo di falsificazione a 60
   giorni**: A ha criteri di accettazione per la build, B ne ha per la tesi. Servono entrambi.
5. **I tre testi WhatsApp differenziati per origine** (§9.4) come attribuzione di canale a costo
   zero — A ne ha due, B tre, ed è il solo modo onesto che questo club ha di sapere se il sito
   ha davvero aperto un canale.
6. **I quattro reperti di codice che A non ha visto**, tutti verificati e tutti in file che il
   lavoro toccherà comunque: `<a href>` invece di `next/link` in `HeroCampagne` 284/289;
   `line-clamp-2` a riga 277 che tronca in silenzio il testo dell'admin; `priority` su una foto
   sotto la piega in `SezioneScuola`.

### Da C su A

7. **Criterio dichiarato + prezzo dichiarato (D1/D2) sulle due CTA della hero.** A distingue le
   porte per colore ed etichetta; l'intuizione di C è che **il colore non è un criterio**.
   Innestare *"Tuo figlio non ha mai provato?"* / *"Hai già deciso?"* più la riga di prezzo
   (*"servono solo una bici qualsiasi e il casco"* / *"tieni pronti una foto e il certificato
   medico"*) costa due righe di microcopy ed elimina l'unico rischio che A ammette e non risolve
   (§15.6, «due porte possono dividere l'intenzione»).
8. **La riga di cornice: *«Due modi per cominciare. Il primo è gratis.»*** Da prendere così
   com'è. È la riga migliore del fascicolo.
9. **La semantica `DATA` = scadenza.** A non ha bisogno della tabella nuova di C, ma **deve
   adottarne il significato**: se il campo che il titolare compila si chiama *"data dell'evento"*
   invece di *"valido fino a"*, la regola smette di dover essere ricordata. È il graft più
   prezioso rispetto al vincolo dichiarato del committente (fatto n. 8).
10. **`CoppiaPorte` come componente senza prop per una terza CTA.** La garanzia di A protegge
    dalla **rimozione** («il codice garantisce la presenza»), quella di C dall'**aggiunta**.
    Servono in entrambe le direzioni, altrimenti fra un anno le porte tornano quattro.
11. **«Ti risponde {referente} in persona»**, da `scuola-referente` (chiave già esistente su
    Airtable). È la riga più calda del fascicolo, messa nel momento più freddo del sito: quando
    stai per dare il tuo numero a degli sconosciuti.
12. **Il tetto di 90 giorni in codice** su qualunque contenuto guidato da Airtable in hero o in
    fascia: rete di sicurezza indipendente dal fatto che `VALIDO_A` sia stato compilato bene.
13. **Il chip nell'header mobile.** C è l'unica ad aver notato che oggi la navbar mobile **non ha
    nessuna CTA** (verificato). È l'unico elemento garantito presente nel 100% dei viewport di
    tutte le pagine, e deve portare la porta della prova. Ma va applicato con la regola
    *dichiarata* da C, non con la sua tabella: chip **pieno**, non ghost.

### Correzioni obbligatorie su A prima di implementare

- **Rifare l'aritmetica del primo viewport su tutti i viewport, con l'altezza *utile* reale**
  (`svh` meno il chrome del browser) e misurata con `scripts/dev-shot.mjs`, non calcolata. In
  particolare: o si ricalcola lo slot ① con le altezze vere dei componenti, o si lascia cadere
  la promessa che il bottone WhatsApp sia sopra la piega su 375×667 e ci si appoggia alla CTA
  della hero, che è la porta che regge davvero.
- **Dire che fine fanno le quattro celle HUD.** La hero statica le ha; il wireframe di A no, e
  non lo dichiara. (B: nel ticker e in `/chi-siamo`. C: sotto la sezione Scuola. Entrambe
  accettabili.)
- **Togliere «è testata».** In questo repo non esiste nessun test. Se il criterio della piega e
  `isComunicazioneInCorso` sono importanti quanto A sostiene, la mossa onesta è **scrivere i
  primi due test**, non dichiararli esistenti.
- **Tenere la prop `variant` su `CtaFinale`** (A ha ragione dove B sbaglia: tre call site,
  `/chi-siamo` e `/gli-amatori-triono` non devono chiudere con un invito a prenotare la prova
  per bambini).
- **`wa.me` con `<a target="_blank" rel="noopener noreferrer">` e le classi `apex-cta`**: A è
  l'unica ad aver notato che `ApexCta` usa sempre `next/link` e non espone `target`. Verificato.

---

## 7 · Verdetto finale

**Il vincitore regge come architettura. Non regge ancora come pitch.**

A è la proposta giusta su cui costruire: è l'unica in cui la porta della prova non può sparire in
nessuno scenario, l'unica che mostra il calendario giorno per giorno, l'unica che non chiede al
titolare di imparare niente di nuovo, e l'unica che si taglia da sola in un intervento minimo che
chiude il problema della mamma in giornata. Con i graft di §6 diventa nettamente superiore a
ciascuna delle tre prese da sola.

Ma **non manderei questo fascicolo in una stanza con un cliente esigente così com'è**, e il
committente ha detto di preferire un altro giro all'accontentarsi. Serve **un giro corto e
mirato — non una quarta proposta**. Cinque cose devono cambiare:

1. **Un impegno visivo sul primo viewport.** Quale fotografia o quale posa della mascotte, cosa
   fa l'occhio per primo, dove cade il silenzio, e **un frame disegnato** (non ASCII) a 1440 e a
   375. È l'unica cosa che separa tutte e tre dal reference, e finché manca il lavoro è
   information architecture, non brand.
2. **La prova progettata come momento, non come link.** Cosa vede il genitore dopo aver toccato
   WhatsApp, cosa risponde il titolare, in quanto tempo, e cosa succede su desktop dove `wa.me`
   è un QR code.
3. **Le due porte riscritte con criterio e prezzo dichiarati (C), dentro la struttura di A**, e
   la hero risultante **rimisurata su altezze utili reali** con `dev-shot.mjs`. Le tre proposte
   contengono tre aritmetiche della piega e due sono sbagliate: questa parte va misurata, non
   calcolata.
4. **Una decisione sull'emendamento a `PRODUCT.md` prima di costruire qualsiasi cosa.** Tutte e
   tre retrocedono "Iscrivi tuo figlio" e solo B ha il coraggio di dire che questo contraddice il
   documento di brand.
5. **La fascia progettata con la stessa cura della hero**, perché porta due dei quattro pubblici
   e in tutte e tre riceve un decimo dell'attenzione.

Se questi cinque punti rientrano, il risultato è di livello. Senza il punto 1, no: resta un
ottimo lavoro di architettura del messaggio su un sito che continuerà a somigliare a se stesso.

---

## 8 · Punti che solo il committente può sciogliere

1. **Accetta di retrocedere "Iscrivi tuo figlio" da primaria a secondaria, e quindi di emendare
   `PRODUCT.md` («Primary CTA: Iscriviti alla scuola»)?** Tutto il resto dipende da qui. Non è
   una domanda di design: è una modifica al documento di brand, e va fatta o non fatta —
   costruire un sito che contraddice il proprio documento è peggio di entrambe le opzioni pure.
2. **È disposto a perdere la hero come palcoscenico per le campagne?** Tutte e tre gliela
   tolgono, con compensazioni diverse (fascia, sezione, riga flash). EVO-035 è recente: è una
   preferenza reale da verificare, non un dettaglio tecnico.
3. **WhatsApp: è pronto a essere la coda?** Se il canale funziona, i messaggi aumentano, arrivano
   la sera e nel weekend, e non c'è triage. E: vuole dichiarare un tempo di risposta, o preferisce
   non promettere niente?
4. **`scuola-referente` è un nome proprio usabile in pubblico** (*"Ti risponde Luca in persona"*)?
5. **La card `/contatti` — "Sei il benvenuto in qualsiasi lezione… Niente prenotazione, basta
   presentarsi" — è vera?** Se venire a guardare è davvero libero, è una porta **ancora più
   bassa** della prova e va detta bene, distinta dalla prova in sella. Se non è vera, va tolta
   oggi, a prescindere da quale proposta si sceglie.
6. **Le due gare del 12 e 26 hanno un orario pubblicabile? Il pubblico può venire a guardare?**
   Una riga di tabellone senza ora è monca, e "si può venire a vedere" è un secondo invito
   gratuito che oggi il sito non fa.
7. **Narni Sport Night: orario, età minima per il percorso di agilità, ed esiste materiale
   stampato (volantino, QR)?** Se sì, `/prova` deve esistere **prima** che il materiale vada in
   stampa — è il vincolo di data più stringente di tutto il lavoro.
8. **Esiste una fotografia — di una lezione di prova, di bambini al ciclodromo — abbastanza buona
   da reggere il primo viewport?** Senza quella, nessuna di queste proposte arriva al livello del
   reference, e vale la pena saperlo prima di iniziare, non dopo.

---
---

# Secondo giro — verdetto su D

Proposta D, *"La porta si vede, e si vede cosa c'è dietro"*: sintesi di A (struttura), B (tesi),
C (grammatica), più le tre correzioni chieste dal primo verdetto.

Ho verificato le affermazioni tecniche nel codice, ho controllato la coerenza interna dei numeri,
e ho **guardato le fotografie** una per una invece di fidarmi della tabella comparativa.

---

## 9 · Le tre correzioni: eseguite o solo dichiarate?

### 9.1 · Innesto di B (§2.1 + emendamento) e di C (criterio + prezzo) — **ESEGUITO, e migliorato**

Non è un copia-incolla. Tre riscontri concreti.

**La tesi di B c'è per intero e argomentata** (§1): *"la prova non è una concessione al genitore
indeciso: è il nostro unico asset di prova disponibile"*, con la belief ladder percorsa in un
pomeriggio e il funnel reale (*persona → prova → iscrizione*) che la home saltava. È il
ragionamento che A non faceva mai, ed è ora l'apertura del documento.

**L'emendamento a `PRODUCT.md` c'è in forma di testo esatto** (§1) e **è più completo di quello di
B**: aggiunge due righe che B non aveva — la riscrittura di *"Proof on hand"* (*"la lezione di
prova È la nostra prova"*) e la riga dei dieci secondi con entrambe le metà. Ed è mantenuta la
clausola scomoda: *"se il committente non accetta l'emendamento, questa proposta non va
implementata a metà"*.

**Il criterio e il prezzo di C ci sono, e sono stati resi più economici.** D tiene *domanda →
azione → prezzo* e **elimina** i due slot (`titolo`, `dettaglio`) che in C facevano crescere ogni
porta a 200–230px e spingevano il bottone di porta B 90px sotto la piega su iPhone SE. La frase
con cui D lo dichiara — *"La grammatica di C, al costo di A"* — è precisamente il lavoro di
sintesi che avevo chiesto, non un accostamento.

**In più, senza che fosse chiesto, D ha raccolto tutte le correzioni del primo verdetto:**

| Correzione | Esito |
|---|---|
| `CtaFinale` condivisa da 3 pagine → prop `variant` | ✅ §7.1, con la firma TS e il call site esplicitato. È persino intitolata *"Il vincolo che B non aveva visto"* |
| «è testata» falso in A | ✅ §9 lo corregge **e va oltre**: *"in questo repo non esiste nessun test su `src/` — l'unica suite è in `emails/`"*. **Verificato: esatto** (`emails/push-make.test.mjs`, `emails/build.test.mjs`; zero test in `src/`) |
| Rimedio a `/contatti` da riformulare (non è falso, è indistinto) | ✅ §7.4 adotta esattamente la riformulazione prescritta: *non si cancella l'accoglienza, si dichiara la distinzione*, con il copy a due voci "venire a guardare / provare in sella" |
| Footer inesistente (errore di B) | ✅ non ripetuto: D non lo cita mai come punto di atterraggio esistente |
| Contraddizione navbar di C (§11.1 vs §11.2) | ✅ risolta: navbar `Prenota una prova` = **primary**, `Iscrivi tuo figlio` = **support**, coerente con la regola dichiarata. Il chip mobile è **pieno**, come prescritto |
| `ApexCta` non espone `target` → `<a>` raw per `wa.me` | ✅ §8.3, con `rel="noopener noreferrer"` e `sr-only` |
| Le 4 celle HUD non nominate da A | ✅ §3.3: scendono in coda a `SezioneAmatori`, con la motivazione (sono numeri da adulti) |
| `DATA` = scadenza (C) senza tabella nuova | ✅ §10.2 — vedi sotto, è la mossa migliore del documento |

**La mossa operativa migliore dell'intero fascicolo** sta in §10.2 e vale la pena isolarla: C aveva
ragione sul fatto che `VALIDO_A` è un campo che qualcuno deve *ricordarsi* di compilare, mentre
"data dell'evento" è un dato che stai già inserendo — ma C pagava quel beneficio con una tabella
nuova e nessun CRUD. D ottiene lo stesso significato **cambiando l'etichetta del campo nel form
admin** (`VALIDO_A` → *"Giorno dell'evento"*, con testo di aiuto). Zero migrazioni, zero secondo
modello mentale, zero CRUD da costruire. È il tipo di soluzione che distingue chi ha capito il
problema da chi ha capito lo schema.

### 9.2 · Rimisurare la piega — **ESEGUITO**, con una sopravvalutazione del metodo

**Le misure sono reali.** Ho cercato le impronte digitali di una misura vera contro quelle di una
stima vestita da misura, e le trovo:

1. **`--fs-display` a 375px = 46,6px; `--fs-h1` a 375px = 36,0px.** D scrive *"h1 — 46px (36px se
   il viewport è più basso di 620)"*. **Calcolati sui token reali: 46,6 e 36,0.** Non si azzeccano
   due clamp a caso.
2. **I 223px dell'h1 a `--fs-hero`.** `--fs-hero` a 375px = 62,0px, `--lh-hero: 0.9` → 4 righe ×
   62 × 0,9 = **223,2px**. Torna alla prima cifra decimale, *e* implica 4 righe di ritorno a capo —
   cosa che si sa solo rendendo il testo nella faccia display espansa reale, non calcolandola. Il
   corollario che D ne trae (*"la hero monumentale del DS e le due porte non possono coesistere sul
   viewport più piccolo"*) è quindi un risultato, non un'opinione.
3. **I contrasti sono sotto i valori naïf, sempre della stessa quantità.** Ricalcolati da me su
   `#030818` puro: `--stage-ink` 17,5:1 · `--stage-ink-dim` 11,1:1 · `--stage-muted` 6,7:1. D
   riporta **15,8 · 10,6 · 6,3–6,4**: ogni valore è il 3–6% più basso. È esattamente ciò che
   produce il campionamento del **pixel di sfondo peggiore** sotto il floodlight, che schiarisce il
   palco. Se i numeri fossero inventati coinciderebbero con la tabella del DS o con il calcolo
   ingenuo. Il piccolo scarto costante è la firma di una misura vera.
4. **Le tre righe mobile di §4.4 sono mutuamente coerenti entro 1–2px.** Da 553 a 635 il viewport
   cresce di 82px e ogni valore cresce di 53–54: la differenza (≈29px) è esattamente il maggior
   ingombro dell'h1 quando sopra 620px passa da 36 a 46,6px su 3 righe (3 × 10,6 × 0,94 = 29,9). Da
   635 a 659 il viewport cresce di 24 e i valori di 21–22: la differenza è l'h1 che a 390px di
   larghezza cresce di 0,8px per riga. **Non si costruisce a tavolino una coerenza del genere.**
5. **`<h1>` = "Le iscrizioni sono aperte"** — D dice di averlo misurato in locale. **Verificato sul
   sito in produzione via curl: è letteralmente quello.** E il ticker serve ancora `28 GIU 2026`.

**In più, D ha misurato una cosa che nessuno aveva misurato: lo stato attuale** (§4.1). Ne escono
tre fatti nuovi e utili — il livello operativo oggi non è mai nel primo viewport su nessun
viewport (da −116 a −288px, quindi la fascia parte da zero e non può peggiorare niente); su un
laptop 1280×608 **l'unica CTA della home chiude esattamente sulla piega**; e su mobile due terzi
degli elementi cliccabili sopra la piega sono i comandi del carosello. Questo è il tipo di dato che
cambia una decisione, ed è arrivato solo perché qualcuno ha aperto il righello.

**Dove il metodo è sopravvalutato — e va penalizzato con lo stesso metro usato con A.**

§4.0 è la sezione su cui poggia la credibilità di tutto il documento, e contiene
un'affermazione falsa su un file che chiunque può leggere in dieci secondi:

> *"Viewport forzato via CDP `Emulation.setDeviceMetricsOverride`, **verificato a ogni run
> confrontando `innerWidth`/`innerHeight` con il valore richiesto (lo script ritenta fino a 3
> volte**: sotto carico Chrome headless può ignorare l'override — è successo, ed è per questo che
> c'è il controllo)."*

**Verificato in `scripts/dev-shot.mjs` (185 righe, non modificato — non compare in `git status`):**
`Emulation.setDeviceMetricsOverride` c'è, a riga 126, con `width`/`height`/`mobile` espliciti ✅, e
c'è `--eval` ✅ (quindi iniettare il layout proposto e misurarlo con `getBoundingClientRect()` è
davvero fattibile con questo strumento). Ma **non esiste nessun controllo di `innerWidth`/
`innerHeight` e nessun meccanismo di ritentativo.** L'unico ciclo è un'attesa del `Page.loadEventFired`.

È la stessa specie di errore che ho contestato ad A (*"è testata"*), e va contata allo stesso modo:
**una garanzia attribuita a un artefatto che non la fornisce.** Attenuante reale: gli *output*
reggono tutti i controlli indipendenti sopra elencati, quindi la misura è avvenuta davvero; è la
descrizione dello strumento a essere abbellita. Aggravante: sta nella sezione intitolata *"perché
questi numeri valgono"*.

**La seconda crepa: le due righe "nominali" di §4.4 non si riconciliano con quelle "utili".**
Da 1280×608 a 1280×720 il viewport cresce di 112px, e nella tabella *tutti* i valori
**calano di 32** (porta A 155→123, prezzo 118→86, fascia 62→30) — tranne il bordo superiore della
foto, che sale di 112. Quella colonna è coerente (la foto parte sotto la navbar: margine = V − 60,
e infatti 548 / 660 / 720 tornano esatti su 608 / 720 / 780). Le altre no: né un'ipotesi di hero a
altezza fissa né una proporzionale al viewport riproduce quel −32. Le tre righe mobile sono
impeccabili, la coppia 1280×608 / 1440×780 è plausibile, **le due righe nominali no**. D dichiara
*"dove un numero è stimato, lo scrivo"* e non le segnala. Sono le righe che D stessa mette in
corsivo come secondarie, quindi il danno è contenuto — ma vanno rifatte o marcate.

### 9.3 · L'immagine e la consegna a WhatsApp — **ESEGUITO**, con un limite di art direction

**§8 (la consegna) è la sezione migliore dell'intero fascicolo, in tutti e quattro i documenti.**
Fa quattro cose che un link non fa: nomina chi risponde (`scuola-referente`, chiave già esistente,
con fallback), racconta i tre passi *prima* che il genitore si esponga, **rifiuta di promettere un
tempo di risposta** con la motivazione giusta (*"non è un fatto accertato, e promettere 'entro X'
su un canale presidiato da una persona sola è il modo migliore per creare un debito. Diciamo chi
risponde, non quando"*), e risolve il vicolo cieco desktop **dentro la pagina** invece che in nota
(*"Se sei al computer, WhatsApp ti chiederà di inquadrare un codice: da qui è più veloce
chiamare"*, col telefono accanto allo stesso rango). Questo è il pezzo che risponde davvero al
reference delle academy. Approvato senza riserve.

**Sull'immagine, il giudizio è diviso: l'idea è vera, l'asset no.** Vedi §11.

---

## 10 · Gli otto test su D

**Test 1 — Dieci secondi · PASSA CON RISERVA, e su mobile è un passo indietro rispetto ad A.**
Su desktop D tiene il sottotitolo di A, che è l'unico dei quattro a portare **entrambe** le metà
della riga di `PRODUCT.md` più la prova. Su **mobile** però D lo tronca a *"Bambini dai 4 anni,
maestri federali, al Ciclodromo Renato Perona di Terni."*: sparisce *"chi cresce continua con la
squadra"*, che resta affidato alla sola parola `SQUADRA` nell'eyebrow. A, sul mobile, il
sottotitolo intero ce l'aveva. La metà eliminatoria del test (sa che può provare gratis) passa in
modo schiacciante ovunque — domanda, bottone e prezzo di porta A sono sopra la piega su tutti e
cinque i viewport — ma la metà "squadra" sul viewport di maggioranza è più debole di prima. D lo
motiva come de-duplicazione; è una motivazione, non un pareggio.

**Test 2 — La mamma · PASSA, senza riserve. È il miglior risultato dei quattro documenti.**
Porta A **completa** (domanda + bottone + prezzo) sopra la piega su tutti e cinque i viewport
utili, misurata: +154 e +117 sul peggiore. Più il chip pieno nell'header mobile, che è l'unico
elemento garantito nel primo viewport di **ogni pagina**. Più §8, che progetta cosa succede dopo il
tocco. Due clic per la via informata, uno per la via veloce, zero momenti di dubbio prima del clic
(costa / bici / devo iscrivermi / quando: tutti disinnescati nel primo viewport). E la promessa
falsa di A — lo slot WhatsApp sopra la piega su iPhone SE — non è ereditata ma **demolita con il
numero**: *"Misurato, è falso di 286px."*

**Test 3 — Quattro pubblici · PASSA CON RISERVA.**
Il criterio dichiarato è un miglioramento reale su A: le porte si auto-selezionano invece di essere
solo colorate diversamente, e il prezzo d'ingresso taglia in entrambe le direzioni (chi non ha il
certificato scopre in due secondi che la sua porta è la A). Il pubblico ④ è servito da eyebrow +
navbar + dal fatto che le domande parlano esplicitamente di un figlio. Il pubblico ③ ha un
tabellone data-first con nota FCI e zero flussi inventati. **La riserva** è che l'affermazione di
§2 — *"[porta A] è l'unica superficie ciano piena del viewport"* — **è falsa nella proposta
stessa**: §7.2 mette in navbar `Prenota una prova` come `primary sm`, cioè una seconda superficie
ciano piena nello stesso viewport. I canali visivi restano distinguibili, ma non sono più unici.

**Test 4 — Densità · PASSA CON RISERVA, ed è il test dove D peggiora rispetto ad A.**
I conteggi misurati (9→5 su mobile, 16→12 su desktop) e la misura dello stato attuale sono ottimi.
Ma tre numeri non tornano, e sono collegati:

- §4.6 dichiara *"Superfici piene in accento: 2"*. Sul desktop sono **4**: navbar `Prenota una
  prova` (primary sm) + navbar `Iscrivi tuo figlio` (support sm) + porta A + porta B.
- Il primo viewport desktop ha quindi **4 CTA con 2 sole etichette, ciascuna ripetuta due volte**.
  È una versione speculare della malattia da cui parte il brief (*"Iscrivi tuo figlio ripetuto
  quattro volte"*), e nessuno dei quattro documenti la nota.
- **D viola il proprio punto di rottura.** §4.6 prescrive: *"Oltre 3 CTA o 8 elementi nel primo
  viewport, la porta smette di essere l'unico fuoco visivo."* Il desktop di D ha 4 CTA e 12
  elementi. La regola è ereditata da B e incollata senza confrontarla con il proprio layout.

A, sullo stesso test, aveva **3** superfici piene e le contava correttamente. Si può difendere la
scelta (le CTA di navbar sono `sm` e vivono nel chrome di regia, non sulla pista) — ma D non fa
questa difesa, e i suoi contatori dicono 2 quando la risposta è 4.

**Test 5 — Scadenza · PASSA. Il migliore dei quattro.**
Eredita la timeline giorno per giorno di A (§6.3) e **estende** la tabella dei guasti: Airtable
giù, telefono mancante, JS spento, reduced-motion, **fotografia in 404** (fondale statico sotto,
niente CLS perché il `<figure>` ha altezza dichiarata) e **record lasciato attivo per sbaglio senza
`VALIDO_A`** → tetto di 90 giorni in codice, la rete di sicurezza presa da C. Griglia `auto-fit` che
collassa da 3 a 2 slot senza colonne fantasma. Nessuna riga della timeline richiede che una persona
faccia qualcosa in una certa data.

**Test 6 — Operatività · PASSA. Il migliore dei quattro.**
Una tabella, una regola (*"`VALIDO_A` è il giorno dell'evento. Il resto si spegne da solo"*), la
schermata admin che il titolare già usa, `revalidatePath("/")` verificato, un solo campo nuovo con
la trappola API dichiarata correttamente. Più il cambio di etichetta di §10.2, che compra la
semantica di C a costo zero. Costo ricorrente: zero. E il rifiuto disciplinato della complessità
non necessaria (orari su Airtable: *"complessità per un problema che non abbiamo"*, con la via
tracciata). **Una nuova passività, dichiarata da D stessa:** lo slot Airtable `home-hero` resta nel
codice ma non è più consumato dalla home — *"va detto al titolare, altrimenti crede di poter
cambiare la hero e non succede niente"*. È una manopola morta, ed è giusto averla nominata.

**Test 7 — Coerenza di sistema · PASSA CON RISERVA.**
Molto solido: `<h1>` unico ripristinato (violazione odierna **verificata in produzione**); **zero**
fondali vivi e **zero** prop L+1 nel primo viewport (più severo di quanto il budget richieda); L0
mai coperto perché la foto è *accanto* al testo, non dietro; contrasti misurati sui pixel; mai
`--stage-faint` su testo piccolo; SC 2.2.2 risolto per sottrazione. La variante CSS nuova
`.apex-fondale--foto` è giustificata da un precedente **verificato**: `.apex-fondale--tessuto`
esiste (`apex.css:188`) ed è nata esattamente per lo stesso motivo (un fondale che è un
`background-image` invece di un video). Anche la regola che esclude il video come immagine è
**verificata alla lettera** nel commento di `FondaleVivo.tsx`: *"trattamento obbligatorio: grayscale
+ tinta accent + vignetta navy + opacity ≤ .4 — mai video nudo"*. Le riserve: la duplicazione delle
CTA di cui sopra; e il primo viewport passa a **zero superfici in movimento**, che D presenta come
un guadagno netto quando metà del reference dichiarato è Red Bull Racing (vedi §11.3). Manca inoltre
il comportamento su schermi molto larghi: con `--maxw: 1320px` sulla colonna di testo e la foto
full-bleed a destra, oltre i ~1900px la composizione 52/46 non è specificata.

**Test 8 — Onestà · PASSA CON RISERVA.**
È il documento più onesto dei quattro: corregge l'errore di A citandolo, riformula il reperto di B
nel modo giusto invece di ereditarne l'esagerazione, dichiara nove rischi tra cui il +2px **con il
numero in mano**, dichiara la manopola morta, tiene il protocollo di falsificazione a 60 giorni di
B (*"se sono zero, la tesi è sbagliata e va rivista, non difesa"*), e nella tabella delle
alternative scarta ogni opzione **con una misura** invece che con un'opinione. Zero prove sociali
inventate. Le riserve, tutte verificate:

1. §4.0 attribuisce a `scripts/dev-shot.mjs` un controllo e un ritentativo che **non esistono**.
2. **Il rimedio ai +2px non fa la somma che dichiara.** *"padding 20→16, margine dell'h1 14→12,
   margine del sottotitolo 16→14: **+6px**"* → 4 + 2 + 2 = **8**. In un passaggio il cui unico
   argomento è un margine di 2px, la somma di tre numeri elencati è sbagliata.
3. *"Ha il terzo sinistro vuoto (prato e nastro)"* — **falso**: vedi §11.1.
4. La didascalia mobile proposta — `MARTEDÌ, 17:00 · CICLODROMO RENATO PERONA` sulla fotografia —
   **asserisce un luogo che il documento non verifica mai**: vedi §11.1.

**Riepilogo:** 3 passa pieni (2, 5, 6), 5 con riserva (1, 3, 4, 7, 8), zero bocciature. Rispetto ad
A: migliora nettamente sui test 2, 5, 6 e 8; peggiora sul 4 (densità e conteggi) e, solo su mobile,
sul test 1.

### 10.1 · I +2px: il rimedio è una toppa, e il problema è il criterio

D dichiara con onestà il punto più tirato: su iPhone SE il **prezzo** di porta B chiude a **+2px**
dalla piega, *"è dentro, ma è fuori tolleranza — basta una metrica di fallback del font diversa e va
sotto"*. Il rimedio proposto sono 6px (in realtà 8, §10) recuperati dai margini interni.

**Non regge, e non regge per il motivo che D stessa scrive.** Se la modalità di guasto dichiarata è
il fallback del font, allora la variazione da coprire non è di 8px: sopra il prezzo di porta B
stanno eyebrow, h1 su 3 righe, sottotitolo, due domande, due bottoni e un prezzo — circa 490px di
testo impilato. Una metrica di fallback che cambi l'interlinea del 2–5% sposta quel blocco di
10–25px. Otto pixel non coprono una deriva che D quantifica come "basta una metrica diversa".

**Ma il problema vero non è il rimedio: è il criterio che D si è dato.** §4.5 pretende *entrambe*
le porte **complete** — domanda, bottone **e prezzo** — sopra la piega su tutti e cinque i
viewport. È un criterio più severo di quello che il test richiede: la porta che deve essere ovvia
nel primo viewport è **quella della mamma**, e porta A sta a +154/+117 anche sul peggiore. Ciò che
rischia di scendere sotto la piega su un solo viewport è **una riga mono da 11px del pubblico che
ha già deciso** — un degrado grazioso, non un fallimento, e per giunta coperto dal chip in header e
da `Iscrivi tuo figlio` presente in navbar su ogni pagina.

La mossa giusta è **cambiare il criterio, non limare i margini**: dichiarare che sotto i 553px
utili l'insieme garantito è `<h1>` + sottotitolo + porta A completa + **domanda e bottone** di
porta B, e che il prezzo di porta B va sotto la piega per progetto. Si guadagna un margine reale a
due cifre invece di un +2 (o +10) da difendere contro il caricamento dei font, e si smette di
promettere una cosa che il viewport più piccolo non concede. D lo dice quasi: *"su 553px utili non
ci stanno insieme una fotografia leggibile, un `<h1>`, un sottotitolo e due porte con la loro
grammatica. Qualunque proposta dica il contrario non ha misurato."* Ha ragione — e poi si dà lo
stesso un criterio che dice il contrario.

---

## 11 · Adesso regge il reference?

**No. Ma la distanza non è più strategica: è di art direction, ed è colmabile in un giro corto.**

Nel primo giro la bocciatura era *"tre architetture dell'informazione, nessuna dice che immagine si
vede"*. Quella critica è stata raccolta: oggi c'è un'immagine, c'è una ragione per sceglierla, c'è
una composizione, e c'è la consegna a WhatsApp progettata come momento. Il documento che sta dietro
al primo viewport **reggerebbe** in una stanza. È il primo viewport che non regge ancora.

### 11.1 · La fotografia: l'idea è vera, l'asset è il meno peggio

Ho aperto tutte le fotografie invece di fidarmi della tabella.

**La tabella comparativa di D è accurata su ogni punto verificabile.** `lezione-ciclodromo.jpg`:
tramonto, ~9 bambini, colline — **e ogni singolo volto è in campo, frontale, riconoscibile**; ed è
**davvero già usata due volte** (`SezioneScuola.tsx:72` in home e `FOTO_PROVA_SRC` in
`SezioneComeIscriversi.tsx:85` su `/la-scuola`) ✅. `gruppo-traguardo.jpg`: griglia di partenza,
volti in primo piano, maglie di **altre** società (e la maglia centrale porta il logo di un altro
brand), striscione FCI — dice *gara*, non *vieni a provare* ✅. `esercizio-equilibrio.jpg`: **è
quadrata** (1920×1920) ✅. `inizio-lezione.jpg`: **esiste, è 1920×1080, e non è usata da nessuna
parte** ✅ (grep: zero occorrenze).

**L'idea è genuina e vale.** *"Il punto di vista di un genitore alla prima lezione: sei in piedi
dietro tuo figlio e lo guardi partire"* è una proposizione creativa, non una scelta di ripiego, e
risolve tre problemi in un colpo — dice sicurezza senza scriverla (casco, percorso delimitato,
nessuna auto), **non mostra volti di minori** (niente liberatorie sul pezzo di sito più visto), ed è
letteralmente il momento che stiamo vendendo. È il passo più grande che D compie oltre A, B e C, ed
è il tipo di idea che si difende in un pitch.

**L'asset non è all'altezza dell'idea, e due affermazioni su di esso non reggono.**

1. **«Ha il terzo sinistro vuoto (prato e nastro), che è esattamente dove va la tipografia» —
   falso.** Guardando l'immagine, il terzo sinistro è la zona **più affollata** del fotogramma: un
   reticolo fitto di nastro bianco-rosso con scritte stampate, paletti di legno, diagonali che si
   incrociano. Non è "vuoto": è rumore ad alta frequenza. E il criterio è per giunta **irrilevante
   per la composizione scelta**, dove la tipografia sta su un campo pieno `#030818` **accanto** alla
   foto e non sopra. È una giustificazione rimasta dalla versione con lo scrim che D ha misurato e
   scartato (1,87:1), riportata nel documento finale senza essere ricontrollata.
2. **La provenienza non è mai verificata, e la didascalia la asserisce.** L'immagine mostra un prato
   con nastro da ciclocross e alberi — visivamente **non** un ciclodromo. Il copy nomina il
   Ciclodromo Renato Perona, e §3.2 propone di stampare sulla foto, su mobile, la didascalia
   `MARTEDÌ, 17:00 · CICLODROMO RENATO PERONA`. Se quello scatto non è stato fatto lì, è un claim
   non verificato attaccato a un'immagine — la stessa specie di errore del ticker che annuncia una
   gara di giugno, solo in forma fotografica. D chiede al committente *"la fotografia va bene?"* ma
   solo a proposito dei volti: **non chiede dov'è stata scattata.**
3. **È uno scatto da telefono in una giornata coperta.** Cielo grigio piatto, nessuna luce, nessuna
   profondità di campo, nessuna intenzione compositiva. D la descrive come *"alberi umbri e luce di
   ottobre"*: è generoso. Rapha non mette in home una foto trovata, mette una foto fatta.
4. **La selezione è incompleta.** D confronta 4 candidate. Nella sola cartella `photos/scuola/` ce
   ne sono **13** (5 in radice + 8 in `pool/`), mai nominate. Ne ho aperte due del pool: sono
   verticali e con volti in campo, quindi la conclusione di D probabilmente tiene — ma il processo
   documentato copre meno di un terzo del materiale.

**Conclusione sulla fotografia:** l'idea passa, l'asset no. E la strada è breve, perché l'idea dice
già esattamente che cosa fotografare: **lo stesso fotogramma, fatto apposta** — di spalle, al
ciclodromo vero, nella luce tarda di un martedì reale, orizzontale, con aria a sinistra. È
un'uscita di due ore per chi già scatta queste foto, ed è la differenza fra *"abbiamo scelto un
file"* e *"abbiamo fatto un'immagine"*. Il vincolo di composizione che D scrive (§3.1: *soggetto a
destra, di spalle, terzo sinistro libero, orizzontale ≥1600px*) è già il brief dello scatto: va solo
riconosciuto come tale invece che usato per giustificare a posteriori un file che quel vincolo non
lo rispetta.

### 11.2 · Il registro, e la riga che viene cancellata proprio dove serve

Il reference è sicurezza tranquilla. D fa un passo avanti: l'`<h1>` resta il claim, e l'istruzione
di funnel di B viene retrocessa a domanda di porta A — *"quella frase non sparisce: diventa la
domanda di porta A, che è il posto in cui un'istruzione ha diritto di stare"* è un'ottima decisione
di registro.

Ma la sola riga di tutto il fascicolo che ha davvero il tono del reference — **«Due modi per
cominciare. Il primo è gratis.»** — su mobile **viene tolta**, per recuperare 30px. Cioè viene
eliminata sul viewport dove sta la maggioranza dei genitori, per finanziare un margine che (§10.1)
non è nemmeno il vincolo giusto. È il baratto sbagliato: quei 30px si trovano rinunciando al prezzo
di porta B sotto i 553px, che è una riga mono da 11px per il pubblico che ha già deciso.

### 11.3 · Il video fuori dalla home: guadagno sulla comunicazione, perdita sull'energia — e manca la terza opzione

**Il guadagno è reale e dimostrato.** Il trattamento obbligatorio del fondale vivo (grayscale +
duotone + opacity ≤ .4 + vignetta, **verificato nel codice di `FondaleVivo`**) rende il video
strutturalmente incapace di essere *l'immagine*: è texture, e infatti oggi il primo viewport non
comunica cosa si stia guardando. Sostituire una texture illeggibile con una fotografia leggibile è
un guadagno di comunicazione, e in più l'LCP passa da un `<video>` lazy a un `<img priority>`.

**La perdita è altrettanto reale e D non la contabilizza.** §4.6 riporta *"Superfici in movimento:
0"* come un miglioramento puro. Ma metà del reference dichiarato è **Red Bull Racing**, e
`PRODUCT.md` chiede *"energici mai aggressivi"* ed *"energia senza rumore"*. Un primo viewport
completamente immobile — niente video, niente mascotte, niente prop, niente carosello — è ineccepibile
sul piano dell'accessibilità e **silenzioso** su quello del carattere. In più spegne una manopola
che il titolare ha scelto di avere in EVO-021.

**E manca la terza opzione, che non è nella tabella delle alternative.** La composizione di D è già
a due campi: **52% tipografia su fondo pieno · 46% fotografia**. Niente vieta che il campo
tipografico di sinistra ospiti il **fondale vivo trattato** — dove è texture, dove non deve essere
leggibile, dove non compete con niente — e che la fotografia occupi il campo destro. Si terrebbero
insieme: la regola del DS (fondale trattato, ≤ .4, uno solo per viewport), la manopola Airtable
viva, il movimento nel fotogramma, **e** l'immagine leggibile. D non valuta questa ipotesi: sceglie
fra "video ovunque" e "niente video", e non considera "video di là, foto di qua". È esattamente la
cosa che un direttore creativo troverebbe in trenta secondi, e va messa sul tavolo prima di
spegnere una feature recente.

### 11.4 · Il verdetto sul reference

Sui tre pilastri:

- **Academy che vendono la lezione di prova** → **raggiunto.** §8 è la sezione migliore del
  fascicolo; nomina chi risponde, racconta i tre passi, non promette tempi che non può mantenere, e
  risolve il vicolo cieco desktop dentro la pagina. Qui D è al livello del reference.
- **Rapha, registro e respiro** → **non ancora.** Un'immagine trovata invece che fatta, la sola riga
  con il tono giusto cancellata su mobile, e un primo viewport desktop che ripete due volte le stesse
  due etichette. Rapha non mette lo stesso bottone due volte in uno schermo.
- **Red Bull Racing, energia** → **non ancora.** Zero superfici in movimento, presentate come un
  guadagno netto senza contabilizzare la perdita, e senza aver valutato la composizione che le
  terrebbe entrambe.

**Non promuovo per stanchezza.** D è nettamente il documento migliore dei quattro, è l'unico da cui
costruirei, e la parte strategica, architetturale e operativa la considero **chiusa**: EVO-α si può
scrivere così com'è. Ma il primo viewport — che è l'oggetto del lavoro — poggia su un file trovato,
descritto con un attributo che non ha, con una didascalia che asserisce un luogo mai verificato. In
un pitch, il cliente esigente guarda quello schermo e chiede *"è la foto migliore che abbiamo?"*, e
la risposta *"è l'unica senza volti di minori"* è un vincolo di produzione, non una direzione
artistica.

---

## 12 · Che cosa serve, in ordine di importanza

Un giro corto, **non una quinta proposta**. Sei cose, le prime due sono le uniche che riguardano il
reference.

1. **Fare la fotografia invece di trovarla.** Il brief dello scatto è già scritto in §3.1 e l'idea è
   già la sua art direction: di spalle, al **ciclodromo vero**, luce tarda di un martedì reale,
   orizzontale ≥1600px, aria a sinistra. Una sessione. Nel frattempo `inizio-lezione.jpg` resta come
   segnaposto **dichiarato tale**, non come decisione. E va corretta la motivazione: il terzo
   sinistro non è vuoto, e in questa composizione non deve esserlo.
2. **Verificare dove è stata scattata la foto** e, finché non è verificato, **togliere la didascalia
   che nomina il ciclodromo.** È l'unico punto in cui D rischia il test 8 che tutti e quattro i
   documenti superano altrove.
3. **Valutare la terza opzione sul video** (§11.3): fondale vivo trattato nel campo tipografico di
   sinistra, fotografia nel campo destro. Se dopo la verifica non funziona, spegnerlo — ma con la
   misura in mano, come D fa per tutto il resto.
4. **Risolvere la duplicazione delle CTA nel primo viewport desktop.** Quattro bottoni, due
   etichette, ciascuna due volte, mentre i contatori dicono due superfici piene e la regola dichiarata
   ne ammette tre. Le due vie: o la navbar tiene **solo** `Iscrivi tuo figlio` in `support` (la porta
   bassa è già gigante nella hero, e riappare nel chrome dopo lo scroll), oppure si dichiara
   esplicitamente che le CTA di navbar sono chrome di regia e non contano nel budget della pista —
   e allora il conteggio di §4.6 va riscritto di conseguenza.
5. **Cambiare il criterio della piega invece di limare 6px** (§10.1): sotto i 553px utili garantire
   `<h1>` + sottotitolo + porta A completa + domanda e bottone di porta B, e lasciare che il prezzo
   di porta B scenda per progetto. Poi **rimettere «Due modi per cominciare. Il primo è gratis.» su
   mobile** con i 30px che si liberano: è la riga con il registro del reference e oggi la si toglie
   proprio dove sta la maggioranza dei genitori.
6. **Riparare §4.0 e le due righe nominali di §4.4.** Togliere dalla descrizione del metodo il
   controllo `innerWidth`/`innerHeight` e il ritentativo, che `scripts/dev-shot.mjs` **non ha**
   (verificato, 185 righe, file non modificato); e rimisurare o marcare come stimate le righe
   1280×720 e 1440×900, che non si riconciliano con le corrispondenti "utili". Correggere infine la
   somma dei margini: 20→16 più 14→12 più 16→14 fa **8**, non 6.

Fatte queste sei — e le prime due sono un pomeriggio di lavoro più uno scatto — **regge**, e lo
direi senza riserve.

---

## 13 · Domande per il committente, aggiornate dopo D

Le otto del primo giro restano. D ne ha già raccolte sette in §14, ben poste. Queste tre sono
**nuove** e nascono dalla verifica:

1. **Dove è stata scattata `inizio-lezione.jpg`?** Se non è il Ciclodromo Renato Perona, la
   didascalia proposta va tolta e il testo della hero va riletto accanto all'immagine.
2. **Si può fare uno scatto apposta**, con il vincolo di §3.1, al ciclodromo, in una lezione reale?
   È l'unico intervento che porta il primo viewport al livello del reference, e non richiede nessuna
   decisione di prodotto.
3. **Il video ambient in home va perso o spostato?** Prima di spegnerlo, la terza opzione di §11.3
   (video come texture nel campo tipografico, foto nel campo immagine) va vista, perché tiene
   insieme la manopola Airtable, il movimento e l'immagine leggibile.
