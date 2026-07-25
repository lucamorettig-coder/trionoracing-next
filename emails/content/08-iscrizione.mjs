export default {
  status: 'success',
  eyebrow: 'Documento da firmare',
  title: 'Iscrizione ricevuta',
  titleAccent: 'ricevuta',
  intro: [
    'Ciao {{1.NOME_GENITORE}},',
    'abbiamo ricevuto correttamente l\'iscrizione di <strong style="color:#04091C;">{{1.NOME_BAMBINO}}</strong>. Manca un ultimo passaggio per completarla.',
  ],
  steps: [
    'Apri il documento allegato a questa email e firmalo.',
    '<strong>Rispondi a questa email</strong> allegando il documento firmato.',
  ],
  banner: { tone: 'success', text: 'Alla ricezione del documento firmato l\'iscrizione sarà completa.' },
  note: 'Diamo il benvenuto a {{1.NOME_BAMBINO}} nella nostra scuola.',
  signature: 'Scuola di Ciclismo Triono Racing',
};
