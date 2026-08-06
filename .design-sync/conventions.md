# APEX — come costruire con questo design system

APEX è il design system del sito pubblico di **Triono Racing** (scuola di ciclismo, squadra
amatori, evento Marathon MTB 209). È **dark-first**: un "palco" notturno su cui i contenuti
stanno come elementi illuminati. Un telaio immutabile, quattro livree.

## 1. Il wrapper è obbligatorio

**Tutti i token vivono sotto `[data-stage]`, gli accenti sotto `[data-livery]`.** Fuori dal
wrapper le CSS var sono vuote e ogni componente rende senza stile — niente errori, solo testo
nero su bianco. Avvolgi sempre l'albero in `ApexStage`:

```jsx
<ApexStage livery="racing">
  <SectionHead kicker="Chi siamo" title={<>Undici anni <span className="accent-word">in sella.</span></>} />
</ApexStage>
```

`livery` cambia solo `--accent` / `--accent-2`, mai le superfici:
`racing` (azzurro, default) · `scuola` (giallo) · `marathon` (rosso) · `ciclocross`.
Sezioni diverse della stessa pagina possono cambiare livrea: annidando un
`<div data-livery="scuola">` tutto ciò che sta dentro adotta quell'accento.

## 2. L'idioma: utility Tailwind + classi componente `.apex-*`

Si usano **utility Tailwind v4**, con i colori presi dai token del palco — mai hex a mano:

| Famiglia | Nomi reali |
|---|---|
| Superfici | `bg-stage-bg` (fondo), `bg-stage-surface`, `bg-stage-surface-2`, `bg-stage-navy` |
| Testo | `text-stage-ink`, `text-stage-ink-dim`, `text-stage-muted`, `text-stage-faint` |
| Bordi | `border-stage-line`, `border-stage-line-soft` |
| Accento | `text-accent`, `bg-accent`, `text-accent-2`, `bg-accent-2` |

⚠️ **`text-stage-faint` non passa il contrasto AA su testo piccolo.** È per elementi
decorativi (tracce, ghost, disabilitati). Per qualsiasi testo piccolo che si deve leggere —
attribuzioni, metadati, hint sotto le CTA — usa `text-stage-muted`.

Accanto alle utility ci sono le **classi componente** in `_ds_bundle.css`, da usare così come
sono (i componenti le applicano già; servono a te per la colla di layout):

- struttura: `apex-section`, `apex-section--edge`, `apex-section--hero`, `apex-wrap`, `stage-scene`
- tipografia: `apex-display`, `apex-eyebrow`, `apex-data`, `apex-lede`, `apex-mark`, `apex-badge-mono`
- enfasi nei titoli: `accent-word` (parola piena nel colore di livrea), `stroke-word` (in outline)
- superfici e decoro: `apex-card--warm` (card avorio, linguaggio della livrea Scuola),
  `apex-duotone`, `apex-grain`, `apex-slashes`, `apex-float`

⚠️ **`apex-wrap` ha un `max-width` in CSS unlayered**: aggiungerci sopra una utility
`max-w-*` non ha alcun effetto. Per restringere una colonna di lettura, mettila su un figlio.

## 3. Regole di composizione che il sistema si aspetta

- **Le intestazioni di sezione si variano, non si stampano in serie.** `SectionHead` ha il
  `kicker` opzionale proprio per questo: non mettere un eyebrow su ogni sezione. Usa
  `variant="h2"` (quieto) quando il titolo è una frase informativa o supera ~8 parole;
  `variant="display"` (default, monumentale) solo per i claim brevi.
- **Numerare solo le sequenze vere.** L'`index` di `ApexCard` (`/ 01`) è per passi realmente
  ordinati, non come decorazione.
- **Sulle CTA la label non si tronca mai.** `ApexCta` ha tre varianti: `primary` (accento
  pieno), `support` (accento-2 pieno), `ghost` (bordo). La freccia è automatica su `primary`.
- **Gli elementi del propkit** (`Sticker`, `Toppa`, `Doodle`, `RacingLine`, `TargaDorsale`,
  `Monolite209`, `EchoStack`, `TelemetriaGhost`, `Waveform`) sono **decorativi**: vanno dentro
  un contenitore posizionato, spesso via `StageProp` dentro una `StageScene`. Non portano
  informazione e non vanno usati al posto di un contenuto.

## 4. Le fondamenta sono token, non componenti

In APEX gli "atomi" — tipografia, colori, spaziature — **non esistono come componenti
React**: sono token CSS e classi. L'unico atomo che è davvero un componente è `ApexCta`.
Le quattro schede del gruppo **`fondamenta`** (`FondamentaTipografia`,
`FondamentaColori`, `FondamentaSpaziature`, `FondamentaAtomi`) rendono quei token visibili
— sono **pannelli di riferimento da consultare, non mattoncini da comporre**: non
inserirle in un design.

## 5. Dove sta la verità

Prima di inventare uno stile, leggi le fonti vere: **`styles.css`** e i file che importa
(`_ds_bundle.css` per le classi componente, i token del palco e delle livree). Per ogni
componente, **`<Nome>.prompt.md`** ha l'uso e **`<Nome>.d.ts`** il contratto delle props.
Valgono più di qualunque riassunto.

## 6. Voce

Italiano, diretto, senza hype. Il pubblico sono genitori e ciclisti: si promette quello che si
può mantenere. Non inventare numeri, date o claim di scarsità — se un dato non c'è, si riformula
la frase, non si riempie il buco.
