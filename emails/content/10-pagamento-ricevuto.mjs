export default {
  status: 'success',
  eyebrow: 'Pagamento ricevuto',
  title: 'Pagamento ricevuto',
  intro: [
    'Ciao {{7.NOME_GENITORE}},',
    'ti confermiamo di aver ricevuto in data <strong style="color:#0A1024;">{{formatDate(2.data.date; "DD/MM/YYYY")}}</strong> il pagamento di <strong style="color:#0A1024;">€ {{4.IMPORTO}}</strong>, relativo all\'iscrizione di <strong style="color:#0A1024;">{{7.NOME_BAMBINO}}</strong> per l\'anno <strong style="color:#0A1024;">{{7.`ANNO_ISCRIZIONE (from TABELLA_TARIFFE)`}}</strong>.',
  ],
  banner: { tone: 'success', text: 'Il pagamento è stato registrato correttamente.' },
  infoRows: [
    { label: 'Data pagamento', value: '{{formatDate(2.data.date; "DD/MM/YYYY")}}' },
    { label: 'Tipologia', value: '{{4.TIPO_TITOLO}}' },
    { label: 'Importo', value: '€ {{4.IMPORTO}}' },
    { label: 'Iscrizione', value: '{{7.ID_ISCRIZIONE}}' },
    { label: 'Anno', value: '{{7.`ANNO_ISCRIZIONE (from TABELLA_TARIFFE)`}}' },
  ],
  note: 'Grazie per la fiducia.',
  signature: 'Scuola di Ciclismo Triono Racing',
};
