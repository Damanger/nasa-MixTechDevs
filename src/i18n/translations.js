export const SUPPORTED_LANGUAGES = ["es", "en", "de"];
export const DEFAULT_LANG = "es";
export const LANG_COOKIE = "exo_lang";
export const LANG_EVENT = "exo:lang-change";

const dictionaries = {
  es: {
    meta: {
      title: "Exoplanetas | Landing",
      description: "Landing moderna con glassmorphism sobre exoplanetas"
    },
    layout: {
      badge: "Exo•Lab",
      nav: {
        home: "Inicio",
        methods: "Métodos",
        resources: "Recursos"
      },
      languageSwitcher: {
        label: "Idioma",
        options: {
          es: "Español",
          en: "Inglés",
          de: "Alemán"
        }
      },
      footer: "© {year} Exo•Lab"
    },
    hero: {
      badge: "Ciencia de exoplanetas",
      title: "Explora mundos más allá del Sistema Solar",
      subtitle: {
        leading: "Un ",
        highlight: "landing",
        trailing: " veloz con UI tipo vidrio esmerilado para presentar métodos de detección, catálogos y visualizaciones interactivas."
      },
      ctaPrimary: "Ver métodos",
      ctaSecondary: "Recursos",
      hints: [
        "Tránsitos, RV, imagen directa…",
        "Espectros y curvas de luz",
        "Explora por tamaño y temperatura"
      ],
      placeholder: {
        body: "Inserta aquí un componente animado de React Bits (por ejemplo, un fondo o un título animado).",
        note: "Importa tu componente y úsalo aquí como <BitsComponent />."
      }
    },
    sections: {
      methods: {
        cards: [
          {
            title: "Método de Tránsitos",
            description: "Detección por disminuciones periódicas de brillo en la curva de luz de la estrella anfitriona."
          },
          {
            title: "Velocidad Radial",
            description: "Desplazamientos Doppler en líneas espectrales por el bamboleo gravitacional estrella–planeta."
          },
          {
            title: "Imagen Directa",
            description: "Separación angular y coronógrafos para aislar el flujo planetario de su estrella."
          }
        ]
      },
      resources: {
        cards: [
          {
            title: "Catálogos",
            description: "Integra más adelante APIs públicas, por ejemplo el NASA Exoplanet Archive, para listas y filtros."
          },
          {
            title: "Visualizaciones",
            description: "Reserva espacio para gráficos: curvas de luz, diagramas masa-radio y más."
          },
          {
            title: "Documentación",
            description: "Planea rutas adicionales como /metodos, /visualizaciones y /sobre."
          }
        ]
      }
    },
    summary: {
      ariaLabel: "Resumen de exoplanetas",
      loading: "Cargando exoplanetas…",
      errorPrefix: "Error cargando datos",
      nullLabel: "Null",
      cards: {
        total: {
          title: "Total",
          description: "Registros en el catálogo local."
        },
        timeRange: {
          title: "Rango temporal",
          description: "Primer y último año de descubrimiento."
        },
        topMethods: {
          title: "Métodos principales"
        },
        nearest: {
          title: "Más cercanos",
          note: "Unidades según tu dataset."
        }
      }
    },
    search: {
      title: "Búsqueda rápida",
      filters: {
        queryPlaceholder: "Buscar por planeta u host…",
        methodAll: "Todos",
        yearMin: "Año mín.",
        yearMax: "Año máx."
      },
      tableHeaders: {
        planet: "Planeta",
        host: "Host",
        method: "Método",
        year: "Año",
        mass: "Masa",
        distance: "Distancia"
      },
      summary: "Mostrando {shown} de {total} registros."
    },
    compare: {
      heading: "Tierra vs Exoplaneta",
      description: {
        intro: "Comparación visual (no a escala) entre la Tierra y un exoplaneta seleccionado; los radios se escalan con",
        outro: "."
      },
      formula: {
        base: "r ∝ M",
        exponent: "1/3"
      },
      inputPlaceholder: "Escribe/elige un exoplaneta…",
      toggle: {
        stop: "Detener",
        rotate: "Rotar"
      },
      earthLabel: "Tierra",
      nullLabel: "Null",
      facts: {
        mass: "Masa",
        radius: "Radio (visual)",
        tempEq: "Temp. eq.",
        method: "Método",
        year: "Año",
        host: "Estrella anfitriona",
        spectralType: "Tipo espectral",
        distance: "Distancia"
      },
      suffixes: {
        mass: " M⊕",
        radius: " R⊕",
        temp: " K",
        distance: " pc"
      },
      disclaimer: "Nota: visualización con supuestos de densidad similar; \"not to scale\". Para valores físicos de radio, usa el campo de radio cuando esté disponible o una relación masa–radio especializada.",
      context: {
        title: "¿Por qué comparar?",
        body: "Este módulo ayuda a contextualizar masa, temperatura de equilibrio y método de descubrimiento del exoplaneta frente al estándar terrestre."
      }
    },
    stats: {
      ariaLabel: "Escala del descubrimiento",
      heading: "La escala del descubrimiento",
      intro: "Nuestro conocimiento de exoplanetas crece de forma sostenida; este bloque resume tu catálogo local.",
      loading: "Calculando métricas…",
      errorPrefix: "Error cargando métricas",
      cards: {
        planets: {
          kicker: "🪐",
          title: "Exoplanetas confirmados",
          description: "Planetas fuera del Sistema Solar (dataset local)."
        },
        systems: {
          kicker: "⭐️",
          title: "Sistemas planetarios",
          description: "Estrellas anfitrionas con planetas confirmados."
        },
        multi: {
          kicker: "🖼️",
          title: "Sistemas multi-planeta",
          description: "Estrellas con ≥ 2 planetas en el catálogo."
        },
        tempered: {
          kicker: "🌍",
          title: "Candidatos “templados”",
          description: "Filtro simplificado por T_eq/insolación†"
        }
      }
    }
  },
  en: {
    meta: {
      title: "Exoplanets | Landing",
      description: "Modern glassmorphism landing page about exoplanets"
    },
    layout: {
      badge: "Exo•Lab",
      nav: {
        home: "Home",
        methods: "Methods",
        resources: "Resources"
      },
      languageSwitcher: {
        label: "Language",
        options: {
          es: "Spanish",
          en: "English",
          de: "German"
        }
      },
      footer: "© {year} Exo•Lab"
    },
    hero: {
      badge: "Exoplanet Science",
      title: "Explore worlds beyond the Solar System",
      subtitle: {
        leading: "A fast ",
        highlight: "landing",
        trailing: " page with frosted-glass UI to highlight detection methods, catalogues, and interactive visuals."
      },
      ctaPrimary: "See methods",
      ctaSecondary: "Resources",
      hints: [
        "Transits, RV, direct imaging…",
        "Spectra and light curves",
        "Filter by size and temperature"
      ],
      placeholder: {
        body: "Drop an animated React Bits component here (for example, a background or animated heading).",
        note: "Import your component and mount it here as <BitsComponent />."
      }
    },
    sections: {
      methods: {
        cards: [
          {
            title: "Transit Method",
            description: "Detect periodic dips in stellar brightness caused by a planet crossing in front."
          },
          {
            title: "Radial Velocity",
            description: "Track Doppler shifts in spectral lines from the star’s planet-induced wobble."
          },
          {
            title: "Direct Imaging",
            description: "Use angular separation and coronagraphs to isolate the planet’s light from its star."
          }
        ]
      },
      resources: {
        cards: [
          {
            title: "Catalogues",
            description: "Plug in public APIs such as the NASA Exoplanet Archive for lists and filters."
          },
          {
            title: "Visualisations",
            description: "Reserve space for plots like light curves and mass–radius diagrams."
          },
          {
            title: "Documentation",
            description: "Plan extra routes: /methods, /visualisations, and /about."
          }
        ]
      }
    },
    summary: {
      ariaLabel: "Exoplanet summary",
      loading: "Loading exoplanets…",
      errorPrefix: "Error loading data",
      nullLabel: "Null",
      cards: {
        total: {
          title: "Total",
          description: "Records in the local catalogue."
        },
        timeRange: {
          title: "Time range",
          description: "Earliest and latest discovery year."
        },
        topMethods: {
          title: "Top methods"
        },
        nearest: {
          title: "Closest",
          note: "Units follow your dataset."
        }
      }
    },
    search: {
      title: "Quick search",
      filters: {
        queryPlaceholder: "Search by planet or host…",
        methodAll: "All",
        yearMin: "Min year",
        yearMax: "Max year"
      },
      tableHeaders: {
        planet: "Planet",
        host: "Host",
        method: "Method",
        year: "Year",
        mass: "Mass",
        distance: "Distance"
      },
      summary: "Showing {shown} of {total} records."
    },
    compare: {
      heading: "Earth vs Exoplanet",
      description: {
        intro: "Visual comparison (not to scale) between Earth and a selected exoplanet; radii scale with",
        outro: "."
      },
      formula: {
        base: "r ∝ M",
        exponent: "1/3"
      },
      inputPlaceholder: "Type/select an exoplanet…",
      toggle: {
        stop: "Stop",
        rotate: "Rotate"
      },
      earthLabel: "Earth",
      nullLabel: "Null",
      facts: {
        mass: "Mass",
        radius: "Visual radius",
        tempEq: "Equilibrium temp.",
        method: "Method",
        year: "Year",
        host: "Host",
        spectralType: "Spectral type",
        distance: "Distance"
      },
      suffixes: {
        mass: " M⊕",
        radius: " R⊕",
        temp: " K",
        distance: " pc"
      },
      disclaimer: "Note: visualization assumes similar density and is not to scale. For physical radii, rely on measured radius fields or a specialised mass–radius relation.",
      context: {
        title: "Why compare?",
        body: "This module helps contextualise mass, equilibrium temperature, and discovery method relative to Earth's baseline."
      }
    },
    stats: {
      ariaLabel: "Scale of discovery",
      heading: "The scale of discovery",
      intro: "Our knowledge of exoplanets keeps growing; this block summarizes your local catalogue.",
      loading: "Calculating metrics…",
      errorPrefix: "Error loading metrics",
      cards: {
        planets: {
          kicker: "🪐",
          title: "Confirmed exoplanets",
          description: "Planets beyond the Solar System (local dataset)."
        },
        systems: {
          kicker: "⭐️",
          title: "Planetary systems",
          description: "Host stars with confirmed planets."
        },
        multi: {
          kicker: "🖼️",
          title: "Multi-planet systems",
          description: "Stars with ≥ 2 planets in the catalogue."
        },
        tempered: {
          kicker: "🌍",
          title: "Tempered candidates",
          description: "Simple filter by T_eq/insolation†"
        }
      }
    }
  },
  de: {
    meta: {
      title: "Exoplaneten | Landing",
      description: "Moderne Glassmorphism-Landingpage über Exoplaneten"
    },
    layout: {
      badge: "Exo•Lab",
      nav: {
        home: "Startseite",
        methods: "Methoden",
        resources: "Ressourcen"
      },
      languageSwitcher: {
        label: "Sprache",
        options: {
          es: "Spanisch",
          en: "Englisch",
          de: "Deutsch"
        }
      },
      footer: "© {year} Exo•Lab"
    },
    hero: {
      badge: "Exoplanetenforschung",
      title: "Entdecke Welten jenseits des Sonnensystems",
      subtitle: {
        leading: "Eine schnelle ",
        highlight: "Landingpage",
        trailing: " mit Glasoberflächen-Look, um Nachweismethoden, Kataloge und interaktive Visualisierungen zu präsentieren."
      },
      ctaPrimary: "Methoden ansehen",
      ctaSecondary: "Ressourcen",
      hints: [
        "Transits, Radialgeschwindigkeit, Direktabbildung…",
        "Spektren und Lichtkurven",
        "Filtere nach Größe und Temperatur"
      ],
      placeholder: {
        body: "Füge hier eine animierte React-Bits-Komponente ein, etwa einen Hintergrund oder einen animierten Titel.",
        note: "Importiere deine Komponente und nutze sie hier als <BitsComponent />."
      }
    },
    sections: {
      methods: {
        cards: [
          {
            title: "Transitmethode",
            description: "Erkenne periodische Helligkeitseinbrüche, wenn ein Planet vor seinem Stern vorbeizieht."
          },
          {
            title: "Radialgeschwindigkeit",
            description: "Verfolge Dopplerverschiebungen in Spektrallinien durch das planeteninduzierte Wackeln des Sterns."
          },
          {
            title: "Direktabbildung",
            description: "Nutze Winkeltrennung und Koronagraphen, um das Planetenlicht vom Stern zu trennen."
          }
        ]
      },
      resources: {
        cards: [
          {
            title: "Kataloge",
            description: "Binde öffentliche APIs wie das NASA Exoplanet Archive für Listen und Filter ein."
          },
          {
            title: "Visualisierungen",
            description: "Reserviere Platz für Diagramme wie Lichtkurven und Masse-Radius-Diagramme."
          },
          {
            title: "Dokumentation",
            description: "Plane zusätzliche Routen wie /methoden, /visualisierungen und /ueber."
          }
        ]
      }
    },
    summary: {
      ariaLabel: "Exoplaneten-Übersicht",
      loading: "Exoplaneten werden geladen…",
      errorPrefix: "Fehler beim Laden der Daten",
      nullLabel: "Null",
      cards: {
        total: {
          title: "Gesamt",
          description: "Einträge im lokalen Katalog."
        },
        timeRange: {
          title: "Zeitspanne",
          description: "Frühestes und spätestes Entdeckungsjahr."
        },
        topMethods: {
          title: "Wichtigste Methoden"
        },
        nearest: {
          title: "Nächste",
          note: "Einheiten entsprechen deinem Datensatz."
        }
      }
    },
    search: {
      title: "Schnellsuche",
      filters: {
        queryPlaceholder: "Nach Planet oder Stern suchen…",
        methodAll: "Alle",
        yearMin: "Jahr min",
        yearMax: "Jahr max"
      },
      tableHeaders: {
        planet: "Planet",
        host: "Stern",
        method: "Methode",
        year: "Jahr",
        mass: "Masse",
        distance: "Distanz"
      },
      summary: "Es werden {shown} von {total} Einträgen angezeigt."
    },
    compare: {
      heading: "Erde vs. Exoplanet",
      description: {
        intro: "Visueller Vergleich (nicht maßstabsgetreu) zwischen der Erde und einem gewählten Exoplaneten; die Radien skalieren mit",
        outro: "."
      },
      formula: {
        base: "r ∝ M",
        exponent: "1/3"
      },
      inputPlaceholder: "Wähle oder tippe einen Exoplaneten…",
      toggle: {
        stop: "Stopp",
        rotate: "Rotieren"
      },
      earthLabel: "Erde",
      nullLabel: "Null",
      facts: {
        mass: "Masse",
        radius: "Visueller Radius",
        tempEq: "Gleichgewichtstemp.",
        method: "Methode",
        year: "Jahr",
        host: "Stern",
        spectralType: "Spektraltyp",
        distance: "Distanz"
      },
      suffixes: {
        mass: " M⊕",
        radius: " R⊕",
        temp: " K",
        distance: " pc"
      },
      disclaimer: "Hinweis: Visualisierung setzt ähnliche Dichte voraus und ist nicht maßstabsgetreu. Für reale Radien nutze gemessene Werte oder spezialisierte Masse-Radius-Relationen.",
      context: {
        title: "Warum vergleichen?",
        body: "Dieses Modul hilft, Masse, Gleichgewichtstemperatur und Entdeckungsmethode im Vergleich zum irdischen Referenzwert einzuordnen."
      }
    },
    stats: {
      ariaLabel: "Skala der Entdeckung",
      heading: "Die Skala der Entdeckung",
      intro: "Unser Wissen über Exoplaneten wächst stetig; dieser Block fasst deinen lokalen Katalog zusammen.",
      loading: "Metriken werden berechnet…",
      errorPrefix: "Fehler beim Laden der Metriken",
      cards: {
        planets: {
          kicker: "🪐",
          title: "Bestätigte Exoplaneten",
          description: "Planeten außerhalb des Sonnensystems (lokaler Datensatz)."
        },
        systems: {
          kicker: "⭐️",
          title: "Planetensysteme",
          description: "Zentralsterne mit bestätigten Planeten."
        },
        multi: {
          kicker: "🖼️",
          title: "Mehrplanetensysteme",
          description: "Sterne mit ≥ 2 Planeten im Katalog."
        },
        tempered: {
          kicker: "🌍",
          title: "Gemäßigte Kandidaten",
          description: "Vereinfachter Filter nach T_eq/Insolation†"
        }
      }
    }
  }
};

export function getTranslations(lang = DEFAULT_LANG) {
  return dictionaries[SUPPORTED_LANGUAGES.includes(lang) ? lang : DEFAULT_LANG];
}

export function getLanguageSafe(lang = DEFAULT_LANG) {
  return SUPPORTED_LANGUAGES.includes(lang) ? lang : DEFAULT_LANG;
}

export function detectClientLanguage(fallback = DEFAULT_LANG) {
  if (typeof window === "undefined") return fallback;

  try {
    const urlLang = new URL(window.location.href).searchParams.get("lang");
    if (urlLang && SUPPORTED_LANGUAGES.includes(urlLang)) return urlLang;
  } catch (err) {
    // ignore URL parsing issues
  }

  try {
    const stored = window.localStorage?.getItem(LANG_COOKIE);
    if (stored && SUPPORTED_LANGUAGES.includes(stored)) return stored;
  } catch (err) {
    // ignore storage access issues
  }

  if (typeof document !== "undefined" && document.cookie) {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${LANG_COOKIE}=`));
    if (match) {
      const value = match.split("=")[1];
      if (SUPPORTED_LANGUAGES.includes(value)) return value;
    }
  }

  return fallback;
}

export default dictionaries;
