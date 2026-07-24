export default {
  status: 'warning',
  eyebrow: 'In scadenza',
  title: 'La rata scade tra 5 giorni',
  titleAccent: '5 giorni',
  intro: [
    'Ciao {{22.NOME_GENITORE}},',
    'ti ricordiamo che la rata della quota annuale relativa all\'iscrizione di <strong style="color:#04091C;">{{1.`NOME_BAMBINO (from ISCRIZIONE)`}}</strong> scadrà tra <strong style="color:#04091C;">5 giorni</strong>.',
  ],
  infoRows: [
    { label: 'Mese', value: '{{capitalize(lower(1.SCADENZA_MESE))}}' },
    { label: 'Scadenza', value: '{{1.DATA_SCADENZA_PAGAMENTO}}' },
    { label: 'Importo', value: '€ {{1.IMPORTO}}' },
  ],
  banner: { tone: 'warning', text: 'Salda entro la scadenza per evitare solleciti: bastano pochi istanti dall\'Area Riservata.' },
  cta: { label: 'Salda ora', href: '{{33.`URL Area Riservata`}}', tone: 'primary' },
  note: 'Se hai già effettuato il pagamento, ignora pure questo messaggio.',
  signature: 'Scuola di Ciclismo Triono Racing',
};
