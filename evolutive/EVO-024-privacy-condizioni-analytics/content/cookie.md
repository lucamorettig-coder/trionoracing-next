# Cookie Policy

> Contenuto definitivo EVO-024 per `src/app/(public)/cookie/page.tsx`. **Rimuovere** banner "Bozza" e `robots: { index: false }`. La tabella cookie sostituisce quella attuale. Aggiungere il bottone "Gestisci preferenze" (`CookiePreferencesButton`) nel §3.

**Sottotitolo:** Informativa sull'uso dei cookie ai sensi del Provv. Garante 10 giugno 2021 ("Linee guida cookie") e degli artt. 13-14 GDPR.

---

## 1. Cosa sono i cookie

I cookie sono piccoli file salvati sul tuo dispositivo dai siti che visiti. Servono a far funzionare il sito, a ricordare le preferenze e — solo con il tuo consenso — a produrre statistiche o a mostrare contenuti di terze parti. Usiamo anche tecnologie analoghe (es. `localStorage`). Distinguiamo tre categorie.

## 2. Cookie utilizzati

### Necessari (sempre attivi — esenti da consenso)
| Nome | Origine | Finalità | Durata |
|------|---------|----------|--------|
| `__session` | Clerk (autenticazione) | Mantiene la sessione di login dell'area riservata | Sessione / fino a 7 giorni |
| `__client_uat` | Clerk | Rinnovo automatico della sessione | 1 anno |
| `__vercel_*` / deployment | Vercel (hosting) | Routing, sicurezza, prevenzione abusi | Sessione / minuti |
| `tr_consent` | Triono Racing | Memorizza le tue preferenze sui cookie | 6 mesi |

### Statistici (richiedono consenso)
| Nome | Origine | Finalità | Durata |
|------|---------|----------|--------|
| `_ga`, `_ga_<ID>`, `_gid` | Google Analytics 4 | Statistiche aggregate e anonime sulle visite (IP anonimizzato) | fino a 13 mesi / 24 h |

Google Analytics è attivato **solo dopo il tuo consenso** (Google Consent Mode v2): prima del consenso non viene impostato alcun cookie statistico. Google LLC tratta i dati negli USA sulla base dell'EU-US Data Privacy Framework.

### Terze parti — Mappe (richiedono consenso)
| Nome | Origine | Finalità | Durata |
|------|---------|----------|--------|
| `NID`, `SOCS`, `AEC` | Google Maps | Funzionamento della mappa "Come raggiungerci" sulla Home | Variabile (Google) |

La mappa di Google Maps **non viene caricata** finché non presti il consenso: al suo posto trovi un segnaposto con il pulsante "Carica la mappa".

## 3. Come gestire il consenso e le preferenze

Al primo accesso compare un banner con cui puoi **Accettare tutti**, **Rifiutare** o **Personalizzare** le scelte per categoria. Puoi modificare le tue preferenze in qualsiasi momento dal pulsante **"Preferenze cookie"** presente nel footer di ogni pagina *(rendere qui il componente `CookiePreferencesButton`)*.

Puoi inoltre gestire o eliminare i cookie dalle impostazioni del browser:
- [Chrome](https://support.google.com/chrome/answer/95647) · [Safari](https://support.apple.com/it-it/guide/safari/sfri11471/mac) · [Firefox](https://support.mozilla.org/it/kb/Eliminare%20i%20cookie) · [Edge](https://support.microsoft.com/it-it/topic/eliminare-e-gestire-i-cookie-168dab11-0753-043d-7c16-ede5947fc64d)

Disattivando i cookie necessari l'area riservata non potrà mantenere il login.

## 4. Durata del consenso

La tua scelta viene ricordata per **6 mesi**; allo scadere, o in caso di modifiche rilevanti a questa policy, ti chiederemo nuovamente il consenso. Revocare o modificare il consenso non pregiudica la liceità dei trattamenti effettuati prima della revoca.

## 5. Riferimenti

Per il trattamento dei dati personali vedi l'[Informativa privacy](/privacy). Ultima revisione: **{DATA_GO_LIVE}**.
