export default {
  status: 'info',
  eyebrow: 'Tesseramento FCI',
  title: 'Modulo Tesseramento FCI',
  titleAccent: 'FCI',
  intro: [
    'Buongiorno <strong style="color:#04091C;">{{1.NOME_GENITORE}}</strong>,',
    'in allegato trovi il <strong style="color:#04091C;">Modulo di Tesseramento FCI</strong> per <strong style="color:#04091C;">{{1.NOME_BAMBINO}} {{1.COGNOME_BAMBINO}}</strong> relativo alla stagione <strong style="color:#04091C;">{{1.`ANNO_ISCRIZIONE (from TABELLA_TARIFFE)`[]}}</strong>.',
  ],
  steps: [
    'Scarica il modulo allegato e firmalo.',
    '<strong>Rispondi a questa email</strong> allegando il modulo firmato.',
  ],
  banner: { tone: 'success', text: 'Il tesseramento sarà completato solo dopo la ricezione del modulo firmato.' },
  note: 'Per facilitare la gestione, ti chiediamo di mantenere questo oggetto email e di inviare un unico file, se possibile.',
  signature: 'Segreteria Triono Racing',
  footerContact: '<p style="margin:0;font-family:\'Inter\',Arial,sans-serif;font-size:12px;line-height:1.6;color:#5B6472;">A.S.D. CIEMME – Via Cavour 1, Terni<br /><a href="mailto:segreteria.scuola@trionoracing.it" style="color:#04091C;font-weight:600;">segreteria.scuola@trionoracing.it</a></p>',
};
