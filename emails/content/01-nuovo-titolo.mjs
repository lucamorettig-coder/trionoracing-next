export default {
  status: 'info',
  eyebrow: 'Nuovo pagamento',
  title: 'Un nuovo pagamento è disponibile',
  titleAccent: 'disponibile',
  intro: [
    'Ciao {{22.NOME_GENITORE}},',
    'puoi saldare comodamente online il nuovo pagamento relativo all\'iscrizione di <strong style="color:#04091C;">{{1.`NOME_BAMBINO (from ISCRIZIONE)`[]}}</strong>.',
  ],
  infoRows: [
    { label: 'Mese', value: '{{capitalize(lower(33.`mese corrente`))}}' },
    { label: 'Descrizione', value: '{{switch(1.TIPO_TITOLO; "prima_rata"; "Prima rata"; "rata"; "Rata"; "seconda_rata"; "Seconda rata"; "terza_rata"; "Terza rata"; "Abbigliamento"; "Abbigliamento"; "altro"; "Altro"; 1.TIPO_TITOLO)}}' },
    { label: 'Scadenza', value: '{{1.DATA_SCADENZA_PAGAMENTO}}' },
    { label: 'Importo', value: '€ {{1.IMPORTO}}' },
  ],
  cta: { label: 'Vai all\'Area Riservata', href: '{{33.`URL Area Riservata`}}', tone: 'primary' },
  note: 'Trovi il pagamento nella sezione <strong>Pagamenti</strong> della tua area. Se hai già saldato, ignora pure questo messaggio.',
  signature: 'Scuola di Ciclismo Triono Racing',
};
