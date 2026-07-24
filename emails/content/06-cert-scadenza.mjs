import { PORTAL_URL } from '../tokens.mjs';

export default {
  status: 'warning',
  eyebrow: 'Certificato medico',
  title: 'Certificato medico in scadenza',
  intro: [
    'Gentile genitore,',
    'il certificato medico di <strong style="color:#0A1024;">{{4.NOME_BAMBINO}}</strong> risulta in scadenza il <strong style="color:#0A1024;">{{4.CERTIFICATO_MEDICO_SCADENZA}}</strong>.',
  ],
  banner: { tone: 'warning', text: 'Ti chiediamo di procedere quanto prima al rinnovo e di caricare il nuovo certificato nella tua Area Riservata.' },
  infoRows: [{ label: 'Importante', value: 'Senza certificato valido {{4.NOME_BAMBINO}} non potrà partecipare alle lezioni' }],
  cta: { label: 'Accedi all\'Area Riservata', href: PORTAL_URL, tone: 'primary' },
  note: 'Se hai già rinnovato il certificato, ti invitiamo semplicemente a caricarlo per evitare eventuali sospensioni dalle attività.',
  signature: 'Scuola di Ciclismo Triono Racing',
};
