export default {
  status: 'critical',
  eyebrow: 'Ultimo avviso',
  title: 'Iscrizione a rischio sospensione',
  intro: [
    'Ciao {{22.NOME_GENITORE}},',
    'il pagamento relativo all\'iscrizione di <strong style="color:#0A1024;">{{1.`NOME_BAMBINO (from ISCRIZIONE)`[]}}</strong> risulta scaduto da oltre un mese e ancora non registrato.',
  ],
  infoRows: [
    { label: 'Tipologia', value: '{{switch(1.TIPO_TITOLO; "prima_rata"; "Prima rata"; "rata"; "Rata"; "seconda_rata"; "Seconda rata"; "terza_rata"; "Terza rata"; "Abbigliamento"; "Abbigliamento"; "altro"; "Altro"; 1.TIPO_TITOLO)}} · {{capitalize(lower(1.SCADENZA_MESE))}}' },
    { label: 'Scaduto il', value: '{{1.DATA_SCADENZA_PAGAMENTO}}', tone: 'danger' },
    { label: 'Importo', value: '€ {{1.IMPORTO}}' },
  ],
  banner: { tone: 'danger', title: 'Sospensione dell\'iscrizione', text: 'In assenza del pagamento, l\'iscrizione di <strong>{{1.`NOME_BAMBINO (from ISCRIZIONE)`[]}}</strong> alla Scuola di Ciclismo <strong>verrà sospesa</strong> e non sarà possibile prendere parte alle attività e alle lezioni.' },
  cta: { label: 'Regolarizza subito', href: '{{33.`URL Area Riservata`}}', tone: 'danger' },
  note: 'Se pensi ci sia un errore o vuoi concordare una soluzione, <strong>rispondi a questa email</strong>: siamo a disposizione. Se hai già pagato, ignora pure questo messaggio.',
  signature: 'Scuola di Ciclismo Triono Racing',
};
