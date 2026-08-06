# Aim prompt, gauntlet loop: messaggio della home Triono

Da incollare in una sessione Claude Code aperta su `trionoracing-next`.
Metodologia: fan out di builder concorrenti, critico severo separato, confronto A/B in cieco
contro un reference irraggiungibile, loop finché non vince. Il freno sei tu.

---

## Il prompt

> Leggi `docs/brainstorming-messaggio-home/BRIEF.md`, poi `PRODUCT.md`, poi le sezioni di
> `AGENTS.md` sul design system APEX. Il brief è una ricognizione, non una verità: **riverifica
> nel codice ogni fatto** che ci trovi prima di costruirci sopra una decisione.
>
> Voglio che tu costruisca **l'architettura del messaggio della home di trionoracing.it** al
> livello delle migliori home di club sportivi al mondo: Rapha Cycling Club per il registro e
> il respiro, Red Bull Racing per l'energia, e per il funnel le academy internazionali che
> vendono la prima lezione di prova prima dell'abbonamento. Deve essere perfetta: alta e
> ariosa ma densa di informazione utile, con ogni singolo aspetto di qualità da agenzia di
> brand strategy, dalla mappa dei casi d'uso al copy della hero, dalla gerarchia visiva alla
> gestione delle informazioni a scadenza, fino a qualsiasi cosa ti venga in mente.
>
> Il problema concreto: una mamma voleva far provare il figlio, sul sito ha trovato solo
> "Iscrivi tuo figlio" ripetuto quattro volte e ha aperto l'iscrizione completa. La prova
> gratuita esiste ma è sepolta in fondo a `/la-scuola`. In parallelo la hero deve iniziare a
> portare tre informazioni a scadenza di settembre (gara strada Giovanissimi il 12, Narni
> Sport Night il 19, gara MTB Giovanissimi il 26) senza diventare una bacheca.
>
> **Fai fan out di sub-agent** e fai in modo che ognuno affronti individualmente una
> dimensione, così che il risultato sia perfetto. Almeno **tre sub-agent devono produrre
> proposte concorrenti e complete**, non tre varianti della stessa idea: ognuna con mappa dei
> casi d'uso, wireframe testuale della home schermo per schermo, copy della hero parola per
> parola, trattamento dei tre eventi, e destinazione di ogni CTA. Dai a ciascuno una tesi
> diversa da difendere (per esempio: la prova come CTA primaria assoluta; la hero come
> palcoscenico stagionale che cambia messaggio; la separazione netta tra livello brand e
> livello operativo). `/loop` su ogni proposta con un **sub-agent critico separato** che la
> valuti contro i test qui sotto. Quel critico deve essere davvero severo, e se la proposta
> non è di livello agenzia deve rimandarla indietro invece di promuoverla.
>
> **Non fermarti finché il critico non è sbalordito dalla qualità nel confronto con il
> reference.** Deve letteralmente mettere le proposte a confronto in cieco, senza sapere quale
> sub-agent le ha scritte, dire quale funziona meglio e perché, e solo dopo rivelare
> l'attribuzione. Se nessuna batte il reference, `/loop` di nuovo con quello che hai imparato.
>
> ### I test del critico
>
> 1. **Dieci secondi.** Dopo dieci secondi in home un genitore che non ci conosce ricorda la
>    riga di `PRODUCT.md` ("qui i bambini iniziano in sicurezza, e chi cresce può diventare
>    atleta della squadra") **e** sa che può provare gratis prima di iscriversi? Se il secondo
>    pezzo non passa, bocciata.
> 2. **La mamma.** Simula il percorso di un genitore che vuole far provare il figlio e non
>    vuole iscriversi. Conta i clic e i momenti di dubbio fino alla porta giusta. Se la porta
>    non è ovvia nel primo viewport, bocciata.
> 3. **Quattro pubblici.** Genitore curioso, genitore già deciso, società o famiglia
>    interessata alle gare di settembre, amatore o agonista. Ognuno deve avere una porta
>    visibile e distinguibile entro il secondo schermo, senza che le porte si confondano.
> 4. **Densità.** Conta gli elementi che competono per l'attenzione nel primo viewport, su
>    desktop e su mobile a 375px. La hero regge tre livelli di informazione o è diventata una
>    bacheca? Dove si rompe esattamente?
> 5. **Scadenza.** Cosa succede alla home il 27 settembre, quando i tre eventi sono passati?
>    La struttura degrada con eleganza o lascia un buco visibile?
> 6. **Operatività.** Chi aggiorna cosa. Ogni contenuto a scadenza deve essere modificabile da
>    Airtable senza deploy, riusando i pattern esistenti (`comunicazioni-hero.ts`,
>    `sfondi-video.ts`, `site-settings.ts`), oppure la proposta deve dichiarare esplicitamente
>    il costo di manutenzione che introduce.
> 7. **Coerenza di sistema.** Livree APEX, massimo un fondale vivo per viewport, budget di un
>    prop su mobile, contenuto della pista sacro, `<h1>` unico in home, WCAG 2.1 AA,
>    `prefers-reduced-motion`.
> 8. **Onestà.** Zero numeri, testimonianze o claim non verificati. `PRODUCT.md` dice che non
>    abbiamo prove sociali disponibili: chi le inventa viene bocciato in partenza.
>
> ### Regole della sessione
>
> - **Non scrivere codice.** Nessuna modifica ai file dell'app, nessun branch, nessuna PR.
>   L'artefatto di questa sessione è una decisione, non un rilascio.
> - Deliverable in `docs/brainstorming-messaggio-home/`: `PROPOSTE.md` con le tre proposte in
>   forma anonima, `VERDETTO.md` con il confronto in cieco e la motivazione del vincitore,
>   `DECISIONI.md` con la sintesi finale, i trade off accettati e le domande ancora aperte per
>   me.
> - **Prima di partire, fammi le domande a cui solo io posso rispondere.** Sezione 6 del brief
>   ne elenca alcune, ma se te ne servono altre chiedile: meglio dieci domande adesso che tre
>   proposte costruite su un'ipotesi sbagliata.
> - Contraddicimi quando sbaglio. Se una premessa del brief non regge alla verifica nel
>   codice, dillo e fermati invece di adattare la proposta a un fatto falso.
>
> Quando il vincitore è chiaro, proponimi il taglio in evolutive (numerazione da verificare su
> `evolutive/` e sul vault, l'ultima nel repo è EVO-044): cosa entra in una prima evolutiva
> minima che sblocca subito il problema della prova, cosa può aspettare, e cosa dipende dalle
> date di settembre. Solo allora passiamo alla skill `evolutive-workflow`.
>
> `/loop` finché non è perfetto. Fan out di sub-agent e ultracode.
