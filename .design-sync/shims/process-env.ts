// Polyfill minimo di `process.env` per il bundle delle preview.
//
// Perché serve: esbuild sostituisce solo `process.env.NODE_ENV` (lo fa il converter
// via `define`). Qualunque ALTRA lettura — nel sito sono le `NEXT_PUBLIC_*`, es.
// `GoogleAnalytics` che legge NEXT_PUBLIC_GA_MEASUREMENT_ID — esplode a runtime con
// "ReferenceError: process is not defined". Il guaio è che fallisce in modo muto: il
// render check vede solo un root vuoto, senza un errore che punti alla causa.
//
// `env` resta VUOTO di proposito: è lo stesso stato del sito quando la variabile non è
// configurata, cioè lo script di terze parti semplicemente non parte — che è il
// comportamento giusto dentro una preview.
//
// Importato per primo da .design-sync/entry.tsx, quindi gira al caricamento del bundle,
// prima che qualsiasi componente renda.

const g = globalThis as unknown as { process?: { env: Record<string, string | undefined> } };
g.process ??= { env: {} };
g.process.env ??= {};

export {};
