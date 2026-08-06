# Proposte — messaggio della home

Tre proposte concorrenti e indipendenti, prodotte in parallelo da autori diversi che non si sono
letti fra loro, ognuna con una tesi diversa da difendere. Sono state valutate **in cieco**: il critico
le ha lette senza sapere chi le avesse scritte, e l'attribuzione è stata rivelata solo dopo il
verdetto.

I documenti integrali stanno in `proposte/`. La valutazione sta in `VERDETTO.md`. Le decisioni prese
stanno in `DECISIONI.md`, e il disegno che ne deriva in
`docs/superpowers/specs/2026-08-06-messaggio-home-triono-design.md`.

---

## Le tre proposte

### A — *Il palcoscenico con una regia* → [`proposte/proposta-A.md`](proposte/proposta-A.md)

**Tesi:** separazione netta fra livello di marca e livello operativo. La hero resta alta, ariosa e
puramente di marca; tutto ciò che ha una data, un orario o un numero scende in una **fascia di regia**
persistente che sostituisce il ticker morto. Il messaggio non si contende la hero: si stratifica.

**Mossa centrale:** la hero smette di ruotare, perché solo un'altezza deterministica permette di
garantire dove cade la piega. Fascia a tre slot, di cui quello della prova cablato nel codice e
indistruttibile.

**Esito:** **vincitrice.** Passa sei test su otto. L'unica in cui la porta della prova non può sparire
in nessuno scenario, l'unica che mostra il calendario giorno per giorno, l'unica che non chiede al
titolare di imparare nulla di nuovo, l'unica con un MVP da due file.

---

### B — *La porta bassa* → [`proposte/proposta-B.md`](proposte/proposta-B.md)

**Tesi:** la prova è la CTA primaria assoluta. *Iscrivi tuo figlio* retrocede a porta secondaria in
tutti i punti di atterraggio. Argomento decisivo: senza prove sociali, l'unica prova che possiamo dare
è l'esperienza — novanta minuti al ciclodromo fanno salire tutta la belief ladder in un pomeriggio.

**Mossa centrale:** l'unica ad avere il coraggio di dire che questo contraddice `PRODUCT.md`, e a
proporre l'emendamento testuale che distingue obiettivo da CTA. L'unica falsificabile, con tre misure
a sessanta giorni.

**Esito:** **seconda, a poca distanza.** La tesi migliore del fascicolo, ed è stata innestata sulla
vincitrice. Penalizzata da un'affermazione tecnica falsa e dal non essersi accorta che `CtaFinale` è
condivisa con `/chi-siamo` e `/gli-amatori-triono`.

---

### C — *Due porte dichiarate* → [`proposte/proposta-C.md`](proposte/proposta-C.md)

**Tesi:** alla mamma non mancava la porta bassa, mancava un **criterio dichiarato** per capire quale
porta fosse la sua. La home mostra due porte etichettate con domande fattuali — *"Tuo figlio non ha
mai provato?"* / *"Hai già deciso?"* — non due intensità dello stesso atto.

**Mossa centrale:** ogni porta dichiara il proprio **prezzo d'ingresso**. Componente unico che non
può rendere una terza CTA.

**Esito:** **terza.** La diagnosi e il copy migliori del fascicolo, entrambi innestati sulla
vincitrice. Penalizzata da una contraddizione interna sulla regola che dà il titolo alla proposta, e
da uno scambio sistematico fra altezza schermo e altezza viewport che invalida le sue misure.

---

## La sintesi

### D — *La porta si vede, e si vede cosa c'è dietro* → [`proposte/proposta-D.md`](proposte/proposta-D.md)

Struttura di A, tesi ed emendamento di B, grammatica delle porte di C ridotta alla forma minima — «la
grammatica di C al costo di A». Più le tre correzioni chieste dal critico: un'idea visiva dichiarata,
le misure della piega riprese sul dev server, e la consegna a WhatsApp progettata come momento invece
che come link.

Giudizio del critico al secondo giro: parte strategica, architetturale e operativa **chiusa**; il
confronto col reference resta aperto su un solo asse, l'art direction — e la distanza era una
fotografia che non esisteva ancora.

Le decisioni prese sopra e oltre la sintesi sono in `DECISIONI.md`.
