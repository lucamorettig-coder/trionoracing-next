import * as React from "react";
import { ApexFooter } from "trionoracing-next";

// Scaffolding con stili inline (vedi NOTES.md): mai utility Tailwind qui.

/**
 * Il footer del sito pubblico, sempre in livrea Racing (il brand padre firma
 * tutto): brand + social, colonne "L'associazione" ed "Eventi", newsletter e
 * riga legale con P.IVA, C.F. e le preferenze cookie.
 *
 * Una sola cella di proposito: `ApexFooter` non ha assi di variante
 * renderizzabili. L'unica prop, `onNewsletterSubmit`, cambia solo il
 * comportamento DOPO l'invio (provider reale al posto del mailto onesto) e
 * lascia il rendering iniziale identico; gli stati del form (`opened`, `done`,
 * `error`) vivono in uno `useState` interno e non sono pilotabili dall'esterno.
 * Due story qui sarebbero due copie della stessa immagine.
 */
export const Base = () => <ApexFooter />;
