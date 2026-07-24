import { PORTAL_URL, SUPPORT_EMAIL } from '../tokens.mjs';

export default {
  status: 'danger',
  eyebrow: 'Certificato medico',
  title: 'Certificato medico scaduto',
  intro: [
    'Gentile genitore,',
    'il certificato medico di <strong style="color:#0A1024;">{{4.NOME_BAMBINO}}</strong> risulta <strong style="color:#0A1024;">scaduto</strong> (scadenza: <strong style="color:#0A1024;">{{4.CERTIFICATO_MEDICO_SCADENZA}}</strong>).',
  ],
  banner: { tone: 'danger', text: 'Per riprendere la partecipazione alle attività è necessario rinnovare il certificato e caricare il documento aggiornato quanto prima nell\'Area Riservata.' },
  infoRows: [{ label: 'Importante', value: 'Senza certificato valido {{4.NOME_BAMBINO}} non potrà partecipare a lezioni e allenamenti' }],
  steps: [
    'Prenota il rinnovo del certificato medico sportivo.',
    'Accedi all\'Area Riservata.',
    'Carica il nuovo certificato nel profilo di {{4.NOME_BAMBINO}}.',
  ],
  cta: { label: 'Accedi all\'Area Riservata', href: PORTAL_URL, tone: 'danger' },
  note: `Hai bisogno di supporto? Rispondi a questa email oppure scrivici a <a href="mailto:${SUPPORT_EMAIL}" style="color:#0A1024;font-weight:600;">${SUPPORT_EMAIL}</a>.`,
  signature: 'Scuola di Ciclismo Triono Racing',
};
