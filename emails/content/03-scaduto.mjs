export default {
  status: 'danger',
  eyebrow: 'Pagamento scaduto',
  title: 'Un pagamento risulta scaduto',
  titleAccent: 'scaduto',
  intro: [
    'Ciao {{22.NOME_GENITORE}},',
    'un pagamento relativo all\'iscrizione di <strong style="color:#04091C;">{{1.`NOME_BAMBINO (from ISCRIZIONE)`[]}}</strong> risulta scaduto.',
  ],
  infoRows: [
    { label: 'Tipologia', value: '{{switch(1.TIPO_TITOLO; "prima_rata"; "Prima rata"; "rata"; "Rata"; "seconda_rata"; "Seconda rata"; "terza_rata"; "Terza rata"; "Abbigliamento"; "Abbigliamento"; "altro"; "Altro"; 1.TIPO_TITOLO)}} · {{capitalize(lower(1.SCADENZA_MESE))}}' },
    { label: 'Scaduto il', value: '{{1.DATA_SCADENZA_PAGAMENTO}}', tone: 'danger' },
    { label: 'Importo', value: '€ {{1.IMPORTO}}' },
  ],
  banner: { tone: 'danger', text: 'Ti invitiamo a regolarizzare il pagamento quanto prima per mantenere attiva l\'iscrizione.' },
  cta: { label: 'Regolarizza ora', href: '{{33.`URL Area Riservata`}}', tone: 'primary' },
  note: 'Se hai già effettuato il pagamento, ignora pure questo messaggio.',
  signature: 'Scuola di Ciclismo Triono Racing',
};
