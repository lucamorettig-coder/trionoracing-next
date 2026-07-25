export default {
  status: 'success',
  eyebrow: 'Ricevuta',
  title: 'Pagamento ricevuto',
  titleAccent: 'ricevuto',
  intro: [
    'Ciao {{7.NOME_GENITORE}},',
    'ti confermiamo di aver ricevuto in data <strong style="color:#04091C;">{{formatDate(2.data.date; "DD/MM/YYYY")}}</strong> il pagamento di <strong style="color:#04091C;">€ {{4.IMPORTO}}</strong>, relativo all\'iscrizione di <strong style="color:#04091C;">{{7.NOME_BAMBINO}}</strong> per l\'anno <strong style="color:#04091C;">{{7.`ANNO_ISCRIZIONE (from TABELLA_TARIFFE)`}}</strong>.',
  ],
  infoRows: [
    { label: 'Data pagamento', value: '{{formatDate(2.data.date; "DD/MM/YYYY")}}' },
    { label: 'Tipologia', value: '{{4.TIPO_TITOLO}}' },
    { label: 'Iscrizione', value: '{{7.ID_ISCRIZIONE}}' },
    { label: 'Anno', value: '{{7.`ANNO_ISCRIZIONE (from TABELLA_TARIFFE)`}}' },
    { label: 'Importo', value: '€ {{4.IMPORTO}}', tone: 'success' },
  ],
  note: 'Conserva questa email come ricevuta del pagamento.',
  signature: 'Scuola di Ciclismo Triono Racing',
};
