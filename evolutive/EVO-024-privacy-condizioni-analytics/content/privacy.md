# Informativa sulla Privacy

> Contenuto definitivo EVO-024 da rendere nel componente `src/app/(public)/privacy/page.tsx` mantenendo il pattern `Section` / `DataBlock` esistente. **Rimuovere** il banner "Bozza tecnica" e `robots: { index: false }`. Data ultima revisione: impostare alla data di go-live.

**Sottotitolo pagina:** Informativa resa ai sensi degli artt. 13-14 del Regolamento (UE) 2016/679 (GDPR) e del D.Lgs. 196/2003 e s.m.i. (Codice Privacy).

---

## 1. Titolare del trattamento

Il Titolare del trattamento è **A.S.D. CIEMME** (Associazione Sportiva Dilettantistica; marchio commerciale: *Triono Racing*), con sede legale in **Via Cavour 1, 05100 Terni (TR)** — sede operativa presso il Ciclodromo Renato Perona, Terni.

- Partita IVA: **01535700551** — Codice Fiscale: **91069070554**
- Legale rappresentante: **Giorgio Roselli**
- E-mail: **trionoracingteam@hotmail.com** — PEC: **trionoracingteam@pec.it**

Il Titolare **non ha nominato un Responsabile della Protezione dei Dati (DPO/RPD)**, non ricorrendone gli obblighi di legge (art. 37 GDPR): il trattamento non costituisce attività principale né avviene su larga scala. Per ogni questione relativa ai dati personali è possibile usare i recapiti indicati sopra.

## 2. Tipologie di dati, finalità e basi giuridiche

Trattiamo dati personali nei contesti seguenti.

### a) Modulo di contatto pubblico (`/contatti`)
- **Dati:** nome, cognome (facoltativo), e-mail, telefono (facoltativo), motivo della richiesta, testo del messaggio, consenso al trattamento; per sicurezza e anti-spam: User-Agent e URL di provenienza.
- **Finalità:** rispondere alla richiesta e gestire il follow-up.
- **Base giuridica:** art. 6.1.b GDPR (riscontro a tua richiesta / misure precontrattuali); per il messaggio libero, art. 6.1.a (consenso).
- **Conservazione:** 24 mesi dall'ultimo contatto, salvo che ne derivi un'iscrizione (vedi lett. b).

### b) Area riservata e iscrizione alla Scuola di Ciclismo (`/portale`)
- **Dati:** credenziali di accesso (e-mail e password gestite dal fornitore di autenticazione); dati anagrafici del genitore/tutore; dati anagrafici dei figli minori iscritti; **certificato medico sportivo** (categoria particolare, vedi §3); taglie per il kit; ricevute e stato dei pagamenti; eventuali foto caricate.
- **Finalità:** costituzione e gestione del rapporto associativo e dell'iscrizione ai corsi, tesseramento federale, gestione di quote e documenti, adempimenti amministrativi e fiscali.
- **Base giuridica:** art. 6.1.b GDPR (esecuzione del contratto/rapporto associativo); art. 6.1.c (obblighi di legge, es. fiscali e federali); per i dati sanitari art. 9.2.a (consenso esplicito).
- **Conservazione:** per la durata dell'iscrizione e, successivamente, per il tempo richiesto dagli obblighi fiscali e federali (di norma 10 anni); i certificati medici sono conservati per il periodo di validità e comunque non oltre quanto necessario.

### c) Pagamenti
- **Dati:** importo, causale, stato e riferimenti della transazione, trattati tramite il fornitore di pagamento (vedi §6). Il Titolare **non** memorizza i dati completi della carta.
- **Finalità:** incasso di quote e rate.
- **Base giuridica:** art. 6.1.b (contratto) e art. 6.1.c (obblighi contabili/fiscali).

### d) Navigazione e cookie
- **Dati:** cookie tecnici necessari (sessione, sicurezza, preferenze di consenso); con il tuo consenso, cookie statistici (Google Analytics) e cookie di terze parti (Google Maps).
- **Finalità:** funzionamento del sito; misurazione statistica anonima; visualizzazione mappa.
- **Base giuridica:** art. 6.1.f (legittimo interesse) ed esenzione consenso per i soli cookie tecnici; **art. 6.1.a (consenso)** per cookie statistici e di terze parti.
- Dettagli e durate nella [Cookie policy](/cookie).

## 3. Categorie particolari di dati (dati relativi alla salute dei minori)

Per l'idoneità alla pratica sportiva trattiamo il **certificato medico** dei minori iscritti, che costituisce dato relativo alla salute (categoria particolare, art. 9 GDPR). Tale trattamento avviene **sulla base del consenso esplicito** prestato dal genitore/tutore esercente la responsabilità genitoriale (art. 9.2.a), è limitato alle finalità di idoneità e tesseramento, ed è accessibile solo al personale autorizzato. Il documento è conservato in forma protetta presso il fornitore di storage indicato al §6 e cancellato quando non più necessario.

## 4. Minori

I servizi della Scuola sono rivolti a minori, ma **gli account e i consensi sono gestiti esclusivamente dai genitori/tutori**. I dati dei minori sono trattati sulla base del contratto/rapporto associativo e, per i dati sanitari, del consenso esplicito del genitore. Non effettuiamo profilazione dei minori né marketing rivolto a essi.

## 5. Modalità del trattamento e sicurezza

Il trattamento avviene con strumenti elettronici, adottando misure tecniche e organizzative adeguate (controllo degli accessi, autenticazione, cifratura in transito, conservazione su infrastrutture con accesso limitato). I dati sono accessibili solo a soggetti autorizzati e ai responsabili esterni di seguito indicati.

## 6. Destinatari e responsabili esterni (data processor)

Per erogare i servizi ci avvaliamo di fornitori che trattano dati per nostro conto, nominati Responsabili del trattamento ex art. 28 GDPR. Nessun dato è venduto o ceduto a terzi per finalità di marketing.

| Fornitore | Funzione | Sede | Base per l'eventuale trasferimento extra-UE |
|-----------|----------|------|----------------------------------------------|
| Vercel Inc. | Hosting del sito | USA | EU-US Data Privacy Framework (DPF) e/o SCC |
| Airtable Inc. | Database contatti e iscrizioni | USA | DPF e/o Clausole Contrattuali Standard (SCC) |
| Clerk Inc. | Autenticazione area riservata | USA | DPF e/o SCC |
| SumUp Limited | Gestione dei pagamenti | UE (Irlanda) | Trattamento nell'UE |
| Cloudflare Inc. (R2) | Storage documenti e foto | USA / UE | DPF e/o SCC |
| Cloudinary Ltd | Hosting e ottimizzazione immagini | Israele / USA | Decisione di adeguatezza (Israele) e/o SCC |
| Make (Celonis) | Automazioni amministrative | UE | Trattamento nell'UE |
| Google LLC | Google Maps (mappa) e Google Analytics (statistiche) | USA | EU-US Data Privacy Framework (DPF) |
| F.C.I. — Federazione Ciclistica Italiana | Tesseramento federale | Italia | — |

I cookie statistici e di terze parti (Google) sono attivati **solo previo consenso**.

## 7. Trasferimento dei dati fuori dall'Unione Europea

Alcuni fornitori hanno sede negli Stati Uniti. I trasferimenti avvengono in presenza di garanzie adeguate ai sensi del Capo V del GDPR: certificazione **EU-US Data Privacy Framework** del soggetto importatore e/o **Clausole Contrattuali Standard** approvate dalla Commissione europea, con misure supplementari ove necessario. Puoi richiederci copia delle garanzie adottate.

## 8. Periodi di conservazione

| Contesto | Conservazione |
|----------|----------------|
| Modulo contatti | 24 mesi dall'ultimo contatto |
| Iscrizione / dati associativi e fiscali | Durata dell'iscrizione + 10 anni (obblighi fiscali/federali) |
| Certificato medico | Periodo di validità, poi cancellazione |
| Cookie | Vedi [Cookie policy](/cookie) |

## 9. Diritti dell'interessato

Puoi esercitare in ogni momento i diritti previsti dagli artt. 15-22 GDPR: accesso, rettifica, cancellazione, limitazione, portabilità, opposizione, e revoca del consenso (senza pregiudizio per i trattamenti già svolti). Per esercitarli scrivi a **trionoracingteam@hotmail.com** (oggetto: "Richiesta dati GDPR"); risponderemo entro 30 giorni.

Hai inoltre diritto di proporre **reclamo all'Autorità Garante per la protezione dei dati personali** (Piazza Venezia 11, 00187 Roma — [www.garanteprivacy.it](https://www.garanteprivacy.it)).

## 10. Modifiche

Aggiorniamo la presente informativa quando cambiano i trattamenti o gli strumenti utilizzati. L'ultima revisione è del **{DATA_GO_LIVE}**.
