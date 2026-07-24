import { PORTAL_URL } from '../tokens.mjs';

export default {
  status: 'warning',
  eyebrow: 'Scade il {{4.CERTIFICATO_MEDICO_SCADENZA}}',
  title: 'Certificato medico in scadenza',
  titleAccent: 'in scadenza',
  intro: [
    'Gentile genitore,',
    'il certificato medico sportivo di <strong style="color:#04091C;">{{4.NOME_BAMBINO}}</strong> è in scadenza. Per continuare a partecipare alle lezioni serve un certificato valido.',
  ],
  banner: { tone: 'warning', text: 'Rinnova il certificato e caricalo nella tua Area Riservata prima della scadenza: così eviti qualsiasi interruzione delle attività.' },
  cta: { label: 'Accedi all\'Area Riservata', href: PORTAL_URL, tone: 'primary' },
  note: 'Hai già rinnovato? Ti basta caricare il nuovo documento. Per qualsiasi dubbio, rispondi pure a questa email.',
  signature: 'Scuola di Ciclismo Triono Racing',
};
