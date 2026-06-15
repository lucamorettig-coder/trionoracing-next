import {
  SITE_URL,
  SITE_NAME,
  CONTACT_EMAIL,
  CICLODROMO_LAT,
  CICLODROMO_LNG,
  absUrl,
} from "@/lib/seo";

const ORG_ID = `${SITE_URL}/#organization`;
const LOCAL_BUSINESS_ID = `${SITE_URL}/#localbusiness`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const PLACE_CICLODROMO_ID = `${SITE_URL}/#ciclodromo`;

function ldScript(data: object) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Organization + LocalBusiness + WebSite + Place (Ciclodromo).
 * Da montare SOLO sulla Home — gli altri JSON-LD referenziano questi via @id.
 */
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "SportsOrganization"],
        "@id": ORG_ID,
        name: "ASD CIEMME",
        alternateName: SITE_NAME,
        email: CONTACT_EMAIL,
        url: SITE_URL,
        logo: absUrl("/assets/logo-triono-racing.png"),
        foundingDate: "2015",
        founders: [
          { "@type": "Person", name: "Ernelio Massarucci" },
          { "@type": "Person", name: "Edoardo Capotosti" },
        ],
        sport: "Cycling",
        sameAs: [
          // social media URLs da aggiungere quando confermati
        ],
      },
      {
        "@type": "Place",
        "@id": PLACE_CICLODROMO_ID,
        name: "Ciclodromo Renato Perona",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Terni",
          addressRegion: "Umbria",
          addressCountry: "IT",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: CICLODROMO_LAT,
          longitude: CICLODROMO_LNG,
        },
      },
      {
        "@type": "LocalBusiness",
        "@id": LOCAL_BUSINESS_ID,
        name: "Scuola di Ciclismo Triono · ASD CIEMME",
        email: CONTACT_EMAIL,
        url: SITE_URL,
        logo: absUrl("/assets/logo-triono-racing.png"),
        image: absUrl("/og/home.jpg"),
        address: {
          "@type": "PostalAddress",
          addressLocality: "Terni",
          addressRegion: "Umbria",
          addressCountry: "IT",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: CICLODROMO_LAT,
          longitude: CICLODROMO_LNG,
        },
        areaServed: ["Terni", "Umbria"],
        priceRange: "€€",
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: "Tuesday",
            opens: "17:00",
            closes: "18:30",
            description: "Corso di bici da strada",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: "Thursday",
            opens: "17:00",
            closes: "18:30",
            description: "Corso di mountain bike",
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "it-IT",
        publisher: { "@id": ORG_ID },
      },
    ],
  };

  return ldScript(data);
}

/**
 * Course schema per la Scuola di Ciclismo. Modella i 2 corsi attivi 2026 come
 * istanze ricorrenti settimanali. Provider referenzia ASD CIEMME via @id.
 */
export function CourseJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": absUrl("/la-scuola#course"),
    name: "Scuola di Ciclismo Triono",
    description:
      "Scuola di ciclismo per bambini a partire da 4 anni di età. Maestri federali. Due formule di iscrizione: il corso completo strada + mountain bike (martedì e giovedì) oppure il Corso MTB del giovedì. Ambiente sicuro, gruppi piccoli, principi della Carta UNESCO 1992 sui diritti dei bambini nello sport.",
    url: absUrl("/la-scuola"),
    inLanguage: "it-IT",
    provider: { "@id": ORG_ID },
    educationalLevel: "Beginner",
    audience: {
      "@type": "EducationalAudience",
      audienceType: "Children",
      suggestedMinAge: 5,
    },
    courseCode: "TRIONO-SCUOLA-2026",
    hasCourseInstance: [
      {
        "@type": "CourseInstance",
        name: "Corso di bici da strada",
        courseMode: "Onsite",
        location: { "@id": PLACE_CICLODROMO_ID },
        courseSchedule: {
          "@type": "Schedule",
          byDay: "https://schema.org/Tuesday",
          startTime: "17:00",
          endTime: "18:30",
          scheduleTimezone: "Europe/Rome",
          repeatFrequency: "P1W",
        },
        instructor: {
          "@type": "Person",
          name: "Maestri federali Triono Racing",
        },
      },
      {
        "@type": "CourseInstance",
        name: "Corso di mountain bike",
        courseMode: "Onsite",
        location: { "@id": PLACE_CICLODROMO_ID },
        courseSchedule: {
          "@type": "Schedule",
          byDay: "https://schema.org/Thursday",
          startTime: "17:00",
          endTime: "18:30",
          scheduleTimezone: "Europe/Rome",
          repeatFrequency: "P1W",
        },
        instructor: {
          "@type": "Person",
          name: "Maestri federali Triono Racing",
        },
      },
    ],
  };
  return ldScript(data);
}

/**
 * SportsEvent schema per la Marathon MTB 209.
 * Sport: Mountain biking. organizer referenzia ASD CIEMME via @id.
 * Riceve i dati edizione corrente (numero, data, claim, urlIscrizione, fotoHero, ...)
 * dal getter Airtable. Se il consumer non passa una edizione, il componente
 * ritorna null (no JSON-LD invalido).
 */
interface EventEdizioneShape {
  numero: number;
  anno: number;
  nome: string;
  claim?: string;
  descrizione?: string;
  dataGara: string;
  dataChiusura?: string;
  statoIscrizioni: string;
  urlIscrizione?: string;
  fotoHero?: string;
  ogImage?: string;
}

export function EventJsonLd({ edizione }: { edizione?: EventEdizioneShape }) {
  if (!edizione) return null;

  const isRegistrationOpen =
    edizione.statoIscrizioni === "aperte" ||
    edizione.statoIscrizioni === "early" ||
    edizione.statoIscrizioni === "in chiusura";

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "@id": absUrl("/marathon-209#event"),
    name: edizione.nome
      ? `Marathon MTB 209 · ${edizione.nome}`
      : "Marathon MTB 209",
    description:
      edizione.descrizione ||
      `Edizione ${edizione.numero} della MTB Marathon 209 organizzata da ASD CIEMME / Triono Racing.`,
    url: absUrl("/marathon-209"),
    startDate: edizione.dataGara,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    sport: "Mountain biking",
    inLanguage: "it-IT",
    organizer: { "@id": ORG_ID },
    location: {
      "@type": "Place",
      name: "Arrone (TR)",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Arrone",
        addressRegion: "Umbria",
        addressCountry: "IT",
      },
    },
  };

  const image = edizione.ogImage || edizione.fotoHero;
  if (image) data.image = [image];

  if (edizione.urlIscrizione) {
    data.offers = {
      "@type": "Offer",
      url: edizione.urlIscrizione,
      availability: isRegistrationOpen
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      ...(edizione.dataChiusura ? { validThrough: edizione.dataChiusura } : {}),
    };
  }

  return ldScript(data);
}

/**
 * BreadcrumbList per ogni pagina interna. Home è sempre l'item 1.
 * items = [{ name: "La Scuola", url: "/la-scuola" }] → genera 2 entries
 * (Home + La Scuola).
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const itemListElement = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
    ...items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 2,
      name: it.name,
      item: absUrl(it.url),
    })),
  ];
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };
  return ldScript(data);
}
