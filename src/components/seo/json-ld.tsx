const SITE_URL = "https://trionoracing.it";

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "SportsOrganization"],
        "@id": `${SITE_URL}/#organization`,
        name: "ASD CIEMME",
        alternateName: "Triono Racing",
        email: "info@trionoracing.it",
        url: SITE_URL,
        logo: `${SITE_URL}/assets/logo-triono-racing.png`,
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
        "@type": "LocalBusiness",
        "@id": `${SITE_URL}/#localbusiness`,
        name: "Scuola di Ciclismo Triono — ASD CIEMME",
        email: "info@trionoracing.it",
        url: SITE_URL,
        logo: `${SITE_URL}/assets/logo-triono-racing.png`,
        image: `${SITE_URL}/og/home.jpg`,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Terni",
          addressRegion: "Umbria",
          addressCountry: "IT",
        },
        // Ciclodromo Renato Perona, Terni
        geo: {
          "@type": "GeoCoordinates",
          latitude: 42.550632,
          longitude: 12.636542,
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
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Triono Racing",
        inLanguage: "it-IT",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
