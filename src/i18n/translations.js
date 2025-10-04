export const SUPPORTED_LANGUAGES = ["es", "en", "de"];
export const DEFAULT_LANG = "es";
export const LANG_COOKIE = "exo_lang";
export const LANG_EVENT = "exo:lang-change";

const dictionaries = {
  es: {
    meta: {
      title: "MixTechDevs | Explorador de Exoplanetas",
      description: "Analiza archivos CSV para confirmar y visualizar exoplanetas con MixTechDevs."
    },
    notFound: {
      title: "404 – Página no encontrada",
      heading: "Perdido en la galaxia",
      description: "404 – La página que buscas no existe.",
      ctaHome: "Volver al inicio",
      ctaExplore: "Explorar datos"
    },
    layout: {
      badge: "MixTechDevs",
      nav: {
        home: "Inicio",
        analyze: "Analizar CSV",
        team: "Equipo"
      },
      languageSwitcher: {
        label: "Idioma",
        options: {
          es: "Español",
          en: "Inglés",
          de: "Alemán"
        }
      },
      footer: "© {year} MixTechDevs"
    },
    hero: {
      badge: "MixTechDevs · Exoplanetas",
      title: "Descubre exoplanetas a partir de tus CSV",
      subtitle: {
        leading: "Una suite de ",
        highlight: "herramientas MixTechDevs",
        trailing: " que analiza archivos CSV para detectar y comprender nuevos mundos."
      },
      ctaPrimary: "Importar CSV",
      ctaSecondary: "Ver guías",
      hints: [
        "Carga un CSV y valida exoplanetas al instante",
        "Detecta patrones en catálogos observacionales",
        "Clasifica por método, masa o habitabilidad"
      ],
    },
    sections: {
      methods: {
        cards: [
          {
            title: "Método de Tránsitos",
            description: "Detecta eclipses periódicos interpretando curvas de luz almacenadas en tus CSV."
          },
          {
            title: "Velocidad Radial",
            description: "Analiza series temporales en CSV para revelar desplazamientos Doppler y confirmar señales."
          },
          {
            title: "Imagen Directa",
            description: "Cruza metadatos espectrales y posiciones guardadas en CSV para aislar candidatos observacionales."
          }
        ]
      },
      resources: {
        cards: [
          {
            title: "Catálogos",
            description: "Integra CSV propios o APIs como el NASA Exoplanet Archive y sincroniza filtros personalizados."
          },
          {
            title: "Visualizaciones",
            description: "Genera gráficos interactivos a partir de columnas CSV: curvas de luz, masa-radio y más."
          },
          {
            title: "Documentación",
            description: "Configura rutas adicionales con flujos paso a paso para importar, depurar y validar tus CSV."
          }
        ]
      }
    },
    summary: {
      ariaLabel: "Resumen de exoplanetas",
      loading: "Procesando exoplanetas desde tu CSV…",
      errorPrefix: "Error cargando datos del CSV",
      nullLabel: "Null",
      cards: {
        total: {
          title: "Total",
          description: "Registros detectados tras la importación del CSV."
        },
        timeRange: {
          title: "Rango temporal",
          description: "Primer y último año reportado en el CSV."
        },
        topMethods: {
          title: "Métodos principales"
        },
        nearest: {
          title: "Más cercanos",
          note: "Valores normalizados desde las columnas de distancia del CSV."
        }
      }
    },
    search: {
      title: "Explorador de CSV",
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
      summary: "Mostrando {shown} de {total} filas procesadas."
    },
    analyze: {
      title: "Analizar CSV",
      message: "La ruta /analizar está lista. Carga tus archivos CSV cuando gustes."
    },
    analyzeUI: {
      uploadHeading: "1) Cargar CSV",
      dropHint: "Arrastra y suelta tu CSV aquí, o haz clic para elegir",
      headersHint: "El CSV debe incluir encabezados en la primera fila.",
      selectFile: "Elegir archivo",
      fileInfo: {
        name: "Archivo",
        rows: "Filas",
        cols: "Columnas"
      },
      mappingHeading: "2) Mapeo de columnas",
      metricsHeading: "3) Métricas y visualizaciones",
      previewHeading: "4) Vista previa del resultado del modelo (futuro)",
      clear: "Reiniciar",
      showMetrics: "Mostrar métricas",
      showCharts: "Mostrar gráficos",
      downloadExample: "Descargar ejemplo JSON"
    },
    team: {
      title: "MixTechDevs · Equipo",
      message: "Conoce a las personas detrás de MixTechDevs.",
      roles: {
        pm: "Gerente de proyecto",
        ds: "Científico de Datos",
        be: "Ingeniero BackEnd",
        uiux: "Líder de Negocios",
        content: "Creadora de contenido",
        felead: "Líder FrontEnd"
      }
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
      jupiterLabel: "Júpiter",
      nullLabel: "Null",
      modes: {
        earthExo: "Tierra + Seleccionado",
        jupiterExo: "Júpiter + Seleccionado",
        all: "Los tres"
      },
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
      disclaimer: "Nota: visualización derivada de valores estimados en tus CSV; \"not to scale\". Para radios físicos, utiliza mediciones directas o relaciones masa–radio especializadas.",
      context: {
        title: "¿Por qué comparar?",
        body: "Este módulo contrasta los datos extraídos del CSV con parámetros terrestres para validar la detección."
      }
    },
    stats: {
      ariaLabel: "Escala MixTechDevs del descubrimiento",
      heading: "Escala MixTechDevs del descubrimiento",
      intro: "Resumimos los indicadores clave detectados automáticamente a partir de tus CSV de exoplanetas.",
      loading: "Calculando métricas desde el CSV…",
      errorPrefix: "Error al generar métricas",
      cards: {
        planets: {
          kicker: "🪐",
          title: "Exoplanetas confirmados",
          description: "Planetas identificados tras las rutinas de validación de MixTechDevs."
        },
        systems: {
          kicker: "⭐️",
          title: "Sistemas planetarios",
          description: "Estrellas anfitrionas agrupadas desde el CSV procesado."
        },
        multi: {
          kicker: "🖼️",
          title: "Sistemas multi-planeta",
          description: "Hosts con ≥ 2 señales después del análisis de filas."
        },
        tempered: {
          kicker: "🌍",
          title: "Candidatos “templados”",
          description: "Selección heurística basada en temperatura o insolación dentro del CSV."
        }
      }
    }
  },
  en: {
    meta: {
      title: "MixTechDevs | Exoplanet Explorer",
      description: "Analyze CSV files to confirm and visualize exoplanets with MixTechDevs."
    },
    notFound: {
      title: "404 – Page not found",
      heading: "Lost in the galaxy",
      description: "404 – The page you’re looking for doesn’t exist.",
      ctaHome: "Go home",
      ctaExplore: "Explore data"
    },
    layout: {
      badge: "MixTechDevs",
      nav: {
        home: "Home",
        analyze: "Analyze CSV",
        team: "Team"
      },
      languageSwitcher: {
        label: "Language",
        options: {
          es: "Spanish",
          en: "English",
          de: "German"
        }
      },
      footer: "© {year} MixTechDevs"
    },
    hero: {
      badge: "MixTechDevs · Exoplanets",
      title: "Discover exoplanets from your CSVs",
      subtitle: {
        leading: "A suite of ",
        highlight: "MixTechDevs tools",
        trailing: " that parses CSV files to detect and understand new worlds."
      },
      ctaPrimary: "Import CSV",
      ctaSecondary: "View guides",
      hints: [
        "Upload a CSV and validate exoplanets instantly",
        "Spot patterns in observational catalogues",
        "Classify by method, mass, or habitability"
      ],
    },
    sections: {
      methods: {
        cards: [
          {
            title: "Transit Method",
            description: "Detect periodic dips by interpreting light curves stored in your CSV files."
          },
          {
            title: "Radial Velocity",
            description: "Analyze time-series data in CSV format to uncover Doppler shifts and confirm signals."
          },
          {
            title: "Direct Imaging",
            description: "Cross-match spectral metadata and positions recorded in CSVs to isolate observational candidates."
          }
        ]
      },
      resources: {
        cards: [
          {
            title: "Catalogues",
            description: "Ingest your own CSVs or public APIs like NASA’s Exoplanet Archive and sync tailored filters."
          },
          {
            title: "Visualisations",
            description: "Generate interactive plots from CSV columns: light curves, mass–radius charts, and more."
          },
          {
            title: "Documentation",
            description: "Create extra routes with step-by-step flows to import, clean, and validate your CSV data."
          }
        ]
      }
    },
    summary: {
      ariaLabel: "Exoplanet summary",
      loading: "Processing exoplanets from your CSV…",
      errorPrefix: "Error loading CSV data",
      nullLabel: "Null",
      cards: {
        total: {
          title: "Total",
          description: "Records detected after importing the CSV."
        },
        timeRange: {
          title: "Time range",
          description: "Earliest and latest discovery year reported in the CSV."
        },
        topMethods: {
          title: "Top methods"
        },
        nearest: {
          title: "Closest",
          note: "Values normalised from the CSV distance columns."
        }
      }
    },
    search: {
      title: "CSV explorer",
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
      summary: "Showing {shown} of {total} processed rows."
    },
    analyze: {
      title: "Analyze CSV",
      message: "Route /analizar is live. Drop your CSV files here when you're ready."
    },
    analyzeUI: {
      uploadHeading: "1) Upload CSV",
      dropHint: "Drag & drop your CSV here, or click to choose",
      headersHint: "The CSV must include headers in the first row.",
      selectFile: "Choose file",
      fileInfo: {
        name: "File",
        rows: "Rows",
        cols: "Columns"
      },
      mappingHeading: "2) Column mapping",
      metricsHeading: "3) Metrics & visualizations",
      previewHeading: "4) Model output preview (future)",
      clear: "Reset",
      showMetrics: "Show metrics",
      showCharts: "Show charts",
      downloadExample: "Download example JSON"
    },
    team: {
      title: "MixTechDevs · Team",
      message: "Meet the people behind MixTechDevs.",
      roles: {
        pm: "Project Manager",
        ds: "Data Scientist",
        be: "Backend Engineer",
        uiux: "Business Lead",
        content: "Content Creator",
        felead: "FrontEnd Lead"
      }
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
      jupiterLabel: "Jupiter",
      nullLabel: "Null",
      modes: {
        earthExo: "Earth + Selected",
        jupiterExo: "Jupiter + Selected",
        all: "All three"
      },
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
      disclaimer: "Note: visualization derives from estimates in your CSV and is not to scale. For physical radii, rely on measured values or specialised mass–radius relations.",
      context: {
        title: "Why compare?",
        body: "The module contrasts CSV-derived data with Earth baselines to validate detections."
      }
    },
    stats: {
      ariaLabel: "MixTechDevs discovery scale",
      heading: "MixTechDevs discovery scale",
      intro: "Key indicators automatically extracted from your exoplanet CSV.",
      loading: "Calculating metrics from the CSV…",
      errorPrefix: "Error generating metrics",
      cards: {
        planets: {
          kicker: "🪐",
          title: "Confirmed exoplanets",
          description: "Planets identified after MixTechDevs validation routines."
        },
        systems: {
          kicker: "⭐️",
          title: "Planetary systems",
          description: "Host stars grouped from the processed CSV."
        },
        multi: {
          kicker: "🖼️",
          title: "Multi-planet systems",
          description: "Hosts with ≥ 2 signals after row analysis."
        },
        tempered: {
          kicker: "🌍",
          title: "Tempered candidates",
          description: "Heuristic selection based on temperature or insolation columns in the CSV."
        }
      }
    }
  },
  de: {
    meta: {
      title: "MixTechDevs | Exoplaneten-Explorer",
      description: "Analysiere CSV-Dateien, um Exoplaneten mit MixTechDevs zu bestätigen und zu visualisieren."
    },
    notFound: {
      title: "404 – Seite nicht gefunden",
      heading: "Verloren in der Galaxie",
      description: "404 – Die gesuchte Seite existiert nicht.",
      ctaHome: "Zur Startseite",
      ctaExplore: "Daten erkunden"
    },
    layout: {
      badge: "MixTechDevs",
      nav: {
        home: "Startseite",
        analyze: "CSV analysieren",
        team: "Team"
      },
      languageSwitcher: {
        label: "Sprache",
        options: {
          es: "Spanisch",
          en: "Englisch",
          de: "Deutsch"
        }
      },
      footer: "© {year} MixTechDevs"
    },
    hero: {
      badge: "MixTechDevs · Exoplaneten",
      title: "Entdecke Exoplaneten aus deinen CSV-Dateien",
      subtitle: {
        leading: "Ein Set von ",
        highlight: "MixTechDevs-Werkzeugen",
        trailing: " das CSV-Dateien auswertet, um neue Welten aufzuspüren und zu verstehen."
      },
      ctaPrimary: "CSV importieren",
      ctaSecondary: "Leitfäden ansehen",
      hints: [
        "Lade ein CSV hoch und prüfe Exoplaneten sofort",
        "Erkenne Muster in Beobachtungskatalogen",
        "Klassifiziere nach Methode, Masse oder Habitabilität"
      ],
    },
    sections: {
      methods: {
        cards: [
          {
            title: "Transitmethode",
            description: "Erkenne periodische Abdunklungen, indem du Lichtkurven aus deinen CSV-Dateien interpretierst."
          },
          {
            title: "Radialgeschwindigkeit",
            description: "Analysiere Zeitreihen im CSV-Format, um Dopplerverschiebungen aufzuspüren und Signale zu bestätigen."
          },
          {
            title: "Direktabbildung",
            description: "Vernetze spektrale Metadaten und Positionen aus CSVs, um Beobachtungskandidaten zu isolieren."
          }
        ]
      },
      resources: {
        cards: [
          {
            title: "Kataloge",
            description: "Binde eigene CSVs oder APIs wie das NASA Exoplanet Archive ein und synchronisiere maßgeschneiderte Filter."
          },
          {
            title: "Visualisierungen",
            description: "Erzeuge interaktive Diagramme aus CSV-Spalten: Lichtkurven, Masse-Radius-Plots und mehr."
          },
          {
            title: "Dokumentation",
            description: "Plane zusätzliche Routen mit Schritt-für-Schritt-Abläufen zum Importieren, Bereinigen und Validieren deiner CSVs."
          }
        ]
      }
    },
    summary: {
      ariaLabel: "Exoplaneten-Übersicht",
      loading: "Exoplaneten aus deinem CSV werden verarbeitet…",
      errorPrefix: "Fehler beim Laden der CSV-Daten",
      nullLabel: "Null",
      cards: {
        total: {
          title: "Gesamt",
          description: "Einträge, die nach dem CSV-Import erkannt wurden."
        },
        timeRange: {
          title: "Zeitspanne",
          description: "Frühestes und spätestes im CSV gemeldetes Entdeckungsjahr."
        },
        topMethods: {
          title: "Wichtigste Methoden"
        },
        nearest: {
          title: "Nächste",
          note: "Werte normalisiert aus den Distanzspalten des CSV."
        }
      }
    },
    search: {
      title: "CSV-Explorer",
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
      summary: "Es werden {shown} von {total} verarbeiteten Zeilen angezeigt."
    },
    analyze: {
      title: "CSV analysieren",
      message: "Die Route /analizar ist aktiv. Lade deine CSV-Dateien hier, sobald du bereit bist."
    },
    analyzeUI: {
      uploadHeading: "1) CSV hochladen",
      dropHint: "Ziehe deine CSV hierher oder klicke zur Auswahl",
      headersHint: "Die CSV-Datei muss Kopfzeilen in der ersten Zeile enthalten.",
      selectFile: "Datei wählen",
      fileInfo: {
        name: "Datei",
        rows: "Zeilen",
        cols: "Spalten"
      },
      mappingHeading: "2) Spaltenzuordnung",
      metricsHeading: "3) Metriken & Visualisierungen",
      previewHeading: "4) Modellvorschau (zukünftig)",
      clear: "Zurücksetzen",
      showMetrics: "Metriken anzeigen",
      showCharts: "Diagramme anzeigen",
      downloadExample: "Beispiel-JSON herunterladen"
    },
    team: {
      title: "MixTechDevs · Team",
      message: "Lerne die Menschen hinter MixTechDevs kennen.",
      roles: {
        pm: "Projektmanager",
        ds: "Data Scientist",
        be: "Backend Engineer",
        uiux: "Business Lead",
        content: "Content Creator",
        felead: "FrontEnd Lead"
      }
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
      jupiterLabel: "Jupiter",
      nullLabel: "Null",
      modes: {
        earthExo: "Erde + Auswahl",
        jupiterExo: "Jupiter + Auswahl",
        all: "Alle drei"
      },
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
      disclaimer: "Hinweis: Visualisierung basiert auf Schätzungen aus deinem CSV und ist nicht maßstabsgetreu. Für reale Radien nutze Messwerte oder spezialisierte Masse-Radius-Relationen.",
      context: {
        title: "Warum vergleichen?",
        body: "Das Modul stellt CSV-basierte Daten den Erdreferenzen gegenüber, um Entdeckungen zu validieren."
      }
    },
    stats: {
      ariaLabel: "MixTechDevs-Entdeckungsskala",
      heading: "MixTechDevs-Entdeckungsskala",
      intro: "Schlüsseleindikatoren, die automatisch aus deinem Exoplaneten-CSV extrahiert wurden.",
      loading: "Metriken werden aus dem CSV berechnet…",
      errorPrefix: "Fehler beim Erstellen der Metriken",
      cards: {
        planets: {
          kicker: "🪐",
          title: "Bestätigte Exoplaneten",
          description: "Planeten, die nach MixTechDevs-Validierung erkannt wurden."
        },
        systems: {
          kicker: "⭐️",
          title: "Planetensysteme",
          description: "Zentralsterne, gruppiert aus dem verarbeiteten CSV."
        },
        multi: {
          kicker: "🖼️",
          title: "Mehrplanetensysteme",
          description: "Sterne mit ≥ 2 Signalen nach der Zeilenanalyse."
        },
        tempered: {
          kicker: "🌍",
          title: "Gemäßigte Kandidaten",
          description: "Heuristische Auswahl basierend auf Temperatur- oder Insolationsspalten des CSV."
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
