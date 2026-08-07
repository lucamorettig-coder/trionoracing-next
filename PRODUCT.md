# Product

## Platform

web

## Users

Il progetto parla a due pubblici, senza gerarchia tra loro: **genitori** che valutano se iscrivere il proprio bambino alla scuola ciclismo (priorità: sicurezza, serietà del metodo), e **atleti amatoriali/agonisti** che considerano di entrare nella squadra Triono Racing (priorità: livello tecnico, risultati, community). I due pubblici convivono sullo stesso sito ma con toni distinti — caldo e rassicurante per i genitori, tecnico ed energico per gli atleti — che il sistema di design (APEX + DS v0.1) già distingue esplicitamente.

Il portale genitori/admin (`/portale`) serve una terza utenza operativa post-iscrizione (genitori loggati, maestri, staff) con un register a sé — prodotto, non brand — non coperto in profondità da questo documento; se in futuro si lavora a fondo sul portale come superficie a se stante, vale la pena un PRODUCT.md scoped separato per quell'area.

## Product Purpose

Il sito pubblico esiste per far crescere le iscrizioni: portare genitori a iscrivere i figli alla scuola ciclismo e attrarre atleti amatoriali/agonisti nella squadra. Il successo si misura in conversioni — iscrizioni scuola, candidature/adesioni squadra — non in metriche di engagement generiche. Il portale a valle (gestione iscrizioni, pagamenti, presenze, comunicazioni) esiste per rendere fluido tutto ciò che segue quella conversione, ma non è l'obiettivo primario di questo documento.

## Positioning

Triono Racing è l'unico club che accompagna un percorso di crescita continuo nel ciclismo: dalla scuola per bambini (sicurezza, metodo, mascotte Nino e Vittoria) fino all'agonismo e alla Marathon 209, dentro la stessa squadra. Non è "una scuola" e "una squadra" scollegate: è un unico percorso che ogni pagina deve rendere visibile.

## Conversion & proof

- Primary CTA: Prenota una prova (gratuita, fino a 2 lezioni)
- Secondary CTA: Iscrivi tuo figlio — per chi ha già deciso. Sempre a un clic, sempre presente nel chrome e accanto alla porta bassa, mai la prima cosa che vede un estraneo.
- Tertiary: Scopri la Scuola / Chi siamo.
- Nota: l'obiettivo di business resta l'iscrizione. La prova è il primo passo del percorso verso l'iscrizione, non un obiettivo alternativo.
- La riga che un visitatore deve ricordare dopo 10 secondi: *"Qui i bambini iniziano in sicurezza e chi cresce diventa atleta della squadra — e si può venire a provare prima di decidere."*
- Proof on hand: la lezione di prova È la nostra prova. In assenza di testimonianze, numeri e loghi, l'esperienza diretta è l'unica evidenza che possiamo offrire, e va trattata come tale.
- Belief ladder: Sicurezza → Metodo → Community → Azione. Prima il genitore deve credere che sia sicuro per il figlio; poi che ci sia un metodo/progressione seria; poi che dietro ci sia una vera community/famiglia; solo allora l'iscrizione diventa un passo naturale.

## Brand Personality

Cinque principi già in uso nel design system esistente, confermati come guida:
- **Ariosi mai vuoti**: respiro nella composizione, mai pagine che sembrano incomplete.
- **Energici mai aggressivi**: energia visiva e di movimento senza diventare invadenti o stressanti.
- **Caldi per i genitori**: tono rassicurante, umano, mai distaccato, quando ci si rivolge a chi decide per un bambino.
- **Tecnici per gli atleti**: precisione, dati, linguaggio da sport agonistico quando ci si rivolge a chi corre.
- **Una squadra due voci**: stesso club, due registri comunicativi coerenti tra loro, non due brand separati.

## Anti-references

Non deve mai somigliare a un sito da club sportivo generico o dozzinale: niente template amatoriali, foto di scarsa qualità, aria da "accozzaglia locale" invece che da club organizzato e professionale. La cura visiva (fotografia, mascotte, sistema APEX) è parte della credibilità del club, non un vezzo estetico.

## Design Principles

- **Il percorso prima della pagina**: ogni sezione deve rendere visibile la continuità scuola → squadra → agonismo, non trattarle come prodotti separati.
- **Sicurezza prima di tutto, sempre visibile**: per il pubblico genitori, ogni pagina che precede una CTA deve prima rassicurare, mai vendere a freddo.
- **Due toni, una squadra**: mantenere la distinzione caldo/tecnico intenzionale (già codificata in APEX + DS v0.1), non appiattirla né confonderla.
- **Energia senza rumore**: motion e composizione trasmettono dinamismo sportivo restando ariosi — mai la pagina che sembra gridare.
- **La cura è credibilità**: fotografia, mascotte e dettaglio visivo comunicano serietà del club tanto quanto il copy.

## Accessibility & Inclusion

WCAG 2.1 AA come standard: contrasto adeguato su tutti i testi (inclusi placeholder), navigazione da tastiera, alt text su fotografia e mascotte, rispetto di `prefers-reduced-motion` per le animazioni del sistema APEX.
