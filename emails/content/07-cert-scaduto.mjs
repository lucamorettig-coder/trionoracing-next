import { PORTAL_URL, SUPPORT_EMAIL } from '../tokens.mjs';

export default {
  status: 'danger',
  eyebrow: 'Scaduto il {{4.CERTIFICATO_MEDICO_SCADENZA}}',
  title: 'Certificato medico scaduto',
  titleAccent: 'scaduto',
  intro: [
    'Gentile genitore,',
    'il certificato medico sportivo di <strong style="color:#04091C;">{{4.NOME_BAMBINO}}</strong> risulta <strong style="color:#04091C;">scaduto</strong>.',
  ],
  banner: { tone: 'danger', title: 'Partecipazione sospesa', text: 'Senza un certificato valido, {{4.NOME_BAMBINO}} non può partecipare a lezioni e allenamenti. Per riprendere l\'attività, rinnova il certificato e carica il documento aggiornato in Area Riservata.' },
  steps: [
    'Prenota il rinnovo del certificato medico sportivo.',
    'Accedi all\'Area Riservata.',
    'Carica il nuovo certificato nel profilo di {{4.NOME_BAMBINO}}.',
  ],
  cta: { label: 'Accedi all\'Area Riservata', href: PORTAL_URL, tone: 'danger' },
  note: `Hai bisogno di supporto? Rispondi a questa email oppure scrivici a <a href="mailto:${SUPPORT_EMAIL}" style="color:#04091C;font-weight:600;">${SUPPORT_EMAIL}</a>.`,
  signature: 'Scuola di Ciclismo Triono Racing',
};
