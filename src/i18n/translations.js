export const SUPPORTED_LANGUAGES = ["es", "en", "de"];
export const DEFAULT_LANG = "es";
export const LANG_COOKIE = "exo_lang";
export const LANG_EVENT = "exo:lang-change";

const dictionaries = {
  es: {
    meta: {
      title: "MixTechDevs | Explorador de Exoplanetas",
      description:
        "Analiza archivos CSV para confirmar y visualizar exoplanetas con MixTechDevs.",
    },
    notFound: {
      title: "404 – Página no encontrada",
      heading: "Perdido en la galaxia",
      description: "404 – La página que buscas no existe.",
      ctaHome: "Volver al inicio",
      ctaExplore: "Explorar datos",
    },
    layout: {
      badge: "MixTechDevs",
      nav: { home: "Inicio", analyze: "Analizar CSV", team: "Equipo", apod: "Imagen del día", moon: "Fase lunar" },
      languageSwitcher: {
        label: "Idioma",
        options: { es: "Español", en: "Inglés", de: "Alemán" },
      },
      footer: "© {year} MixTechDevs",
    },
    apod: {
      title: "Imagen del día (NASA APOD)",
      subtitle: "Imágenes y videos astronómicos seleccionados por la NASA.",
      error: "No pudimos cargar la imagen del día. Intenta nuevamente más tarde.",
      mediaFallback: "Este contenido no se puede mostrar.",
      noImageForDate: "No se encontró una foto de ese día.",
      dateLabel: "Fecha",
      go: "Ver",
      minDateHint: "No hay imágenes anteriores al 16/06/1995.",
      prev: "Anterior",
      next: "Siguiente",
      today: "Hoy",
      videoBadge: "Video",
      openOriginalAria: "Abrir imagen original",
      monthPrevAria: "Mes anterior",
      monthNextAria: "Mes siguiente",
      altFallback: "Imagen APOD",
    },
    moon: {
      title: "Fase lunar",
      subtitle: "Calcula la fase lunar e imagen aproximada para una fecha.",
      modeLabel: "Personas",
      modeOne: "1 persona",
      modeTwo: "2 personas",
      dateLabel: "Fecha",
      illumination: "Iluminación",
      compareTitle: "Comparar dos fechas",
      dateA: "Persona 1",
      dateB: "Persona 2",
      match: "Concordancia",
      compareCta: "Comparar",
      combined: "Combinada",
      note: "Aproximación visual; puede variar ±1 día según efemérides y zona horaria.",
      phaseNames: [
        "Luna nueva",
        "Creciente iluminante",
        "Cuarto creciente",
        "Gibosa creciente",
        "Luna llena",
        "Gibosa menguante",
        "Cuarto menguante",
        "Creciente menguante"
      ]
    },
    hero: {
      badge: "MixTechDevs · Exoplanetas",
      title: "Descubre exoplanetas a partir de tus CSV",
      subtitle: {
        leading: "Una suite de ",
        highlight: "herramientas MixTechDevs",
        trailing:
          " que analiza archivos CSV para detectar y comprender nuevos mundos.",
      },
      ctaPrimary: "Importar CSV",
      ctaSecondary: "Ver guías",
      hints: [
        "Carga un CSV y valida exoplanetas al instante",
        "Detecta patrones en catálogos observacionales",
        "Clasifica por método, masa o habitabilidad",
      ],
    },
    sections: {
      methods: {
        cards: [
          {
            title: "Método de Tránsitos",
            description:
              "Detecta eclipses periódicos interpretando curvas de luz almacenadas en tus CSV.",
          },
          {
            title: "Velocidad Radial",
            description:
              "Analiza series temporales en CSV para revelar desplazamientos Doppler y confirmar señales.",
          },
          {
            title: "Imagen Directa",
            description:
              "Cruza metadatos espectrales y posiciones guardadas en CSV para aislar candidatos observacionales.",
          },
        ],
      },
      resources: {
        cards: [
          {
            title: "Catálogos",
            description:
              "Integra CSV propios o APIs como el NASA Exoplanet Archive y sincroniza filtros personalizados.",
          },
          {
            title: "Visualizaciones",
            description:
              "Genera gráficos interactivos a partir de columnas CSV: curvas de luz, masa-radio y más.",
          },
          {
            title: "Documentación",
            description:
              "Configura rutas adicionales con flujos paso a paso para importar, depurar y validar tus CSV.",
          },
        ],
      },
    },
    summary: {
      ariaLabel: "Resumen de exoplanetas",
      loading: "Procesando exoplanetas desde tu CSV…",
      errorPrefix: "Error cargando datos del CSV",
      nullLabel: "Null",
      cards: {
        total: {
          title: "Total",
          description:
            "Registros detectados tras la importación del CSV.",
        },
        timeRange: {
          title: "Rango temporal",
          description: "Primer y último año reportado en el CSV.",
        },
        topMethods: { title: "Métodos principales" },
        nearest: {
          title: "Más cercanos",
          note: "Valores normalizados desde las columnas de distancia del CSV.",
        },
      },
    },
    search: {
      title: "Explorador de CSV",
      filters: {
        queryPlaceholder: "Buscar por planeta u host…",
        methodAll: "Todos",
        yearMin: "Año mín.",
        yearMax: "Año máx.",
      },
      tableHeaders: {
        planet: "Planeta",
        planetHint: "Nombre oficial o designación del planeta detectado.",
        host: "Estrella",
        hostHint: "Estrella anfitriona sobre la que orbita el exoplaneta.",
        method: "Método",
        methodHint: "Técnica observacional utilizada para confirmar el planeta.",
        year: "Año",
        yearHint: "Año de anuncio/confirmación reportado en el catálogo.",
        mass: "Masa",
        massHint: "Masa aproximada expresada en masas terrestres (M⊕).",
        distance: "Distancia",
        distanceHint:
          "Distancia al sistema en pársecs (pc). 1 pc ≈ 3,26 años luz.",
      },
      legend: {
        planet: "Planeta: designación registrada en el catálogo.",
        planetHint:
          "Nombre oficial o designación del exoplaneta detectado.",
        host: "Host: estrella anfitriona.",
        hostHint: "Estrella alrededor de la que orbita el planeta.",
        method: "Método: técnica de detección.",
        methodHint:
          "Tránsitos, velocidad radial, imagen directa, etc.",
        year: "Año: reporte oficial.",
        yearHint:
          "Año de anuncio o confirmación en la base consultada.",
        mass: "Masa: magnitud en M⊕.",
        massHint: "M⊕ indica cuántas veces la masa de la Tierra.",
        distance: "Distancia: separación en pc.",
        distanceHint: "1 pc ≈ 3,26 años luz.",
      },
      summary: "Mostrando {shown} de {total} filas procesadas.",
      footerHint:
        "Datos del NASA Exoplanet Archive (extracto). Actualiza tu CSV para ampliar la muestra.",
      backTop: "Volver arriba",
      emptyValue: "—",
    },
    analyze: {
      title: "Analizar CSV",
      message:
        "La ruta /analizar está lista. Carga tus archivos CSV cuando gustes.",
    },
    analyzeUI: {
      uploadHeading: "1) Cargar CSV",
      dropHint: "Arrastra y suelta tu CSV aquí, o haz clic para elegir",
      headersHint: "El CSV debe incluir encabezados en la primera fila.",
      selectFile: "Elegir archivo",
      fileInfo: { name: "Archivo", rows: "Filas", cols: "Columnas" },
      mappingHeading: "2) Mapeo de columnas",
      metricsHeading: "3) Métricas y visualizaciones",
      previewHeading: "4) Vista previa del resultado del modelo (futuro)",
      clear: "Reiniciar",
      showMetrics: "Mostrar métricas",
      showCharts: "Mostrar gráficos",
      downloadExample: "Descargar ejemplo JSON",
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
        felead: "Líder FrontEnd",
      },
    },
    settings: {
      title: "Ajustes de cuenta",
      message: "Personaliza tu perfil, preferencias y seguridad en MixTechDevs.",
      comingSoon: "Próximamente",
      background: {
        title: "Fondos personalizados",
        description: "Elige un ambiente visual diferente para MixTechDevs.",
        loading: "Cargando preferencia…",
        signedOut: "Inicia sesión con Google para elegir tu fondo.",
        statusSaving: "Guardando…",
        statusSaved: "Preferencia guardada",
        statusError: "No se pudo guardar la preferencia.",
        saveError: "Intenta de nuevo más tarde.",
        options: {
          default: {
            label: "Gradiente MixTechDevs",
            description: "Mantiene el degradado espacial clásico.",
          },
          matrix: {
            label: "Lluvia digital",
            description: "Texto verde cayendo al estilo Matrix sobre fondo negro.",
          },
        },
      },
      cards: [
        {
          title: "Perfil",
          description: "Edita tu nombre para mostrar y sincroniza tu foto de Google.",
        },
        {
          title: "Preferencias",
          description: "Configura idioma, notificaciones y comportamiento por defecto.",
        },
        {
          title: "Seguridad",
          description: "Revisa sesiones activas y cierra sesión en todos tus dispositivos.",
        },
      ],
    },
    compare: {
      heading: "Tierra vs Exoplaneta",
      description: {
        intro:
          "Comparación visual (no a escala) entre la Tierra y un exoplaneta seleccionado; los radios se escalan con",
        outro: ".",
      },
      formula: { base: "r ∝ M", exponent: "1/3" },
      inputPlaceholder: "Escribe/elige un exoplaneta…",
      toggle: { stop: "Detener", rotate: "Rotar" },
      earthLabel: "Tierra",
      jupiterLabel: "Júpiter",
      nullLabel: "Null",
      modes: {
        earthExo: "Tierra + Seleccionado",
        jupiterExo: "Júpiter + Seleccionado",
        all: "Los tres",
      },
      facts: {
        mass: "Masa",
        radius: "Radio (visual)",
        tempEq: "Temp. eq.",
        method: "Método",
        year: "Año",
        host: "Estrella anfitriona",
        spectralType: "Tipo espectral",
        distance: "Distancia",
      },
      suffixes: { mass: " M⊕", radius: " R⊕", temp: " K", distance: " pc" },
      disclaimer:
        "Nota: visualización derivada de valores estimados en tus CSV; \"not to scale\". Para radios físicos, utiliza mediciones directas o relaciones masa–radio especializadas.",
      context: {
        title: "¿Por qué comparar?",
        body:
          "Este módulo contrasta los datos extraídos del CSV con parámetros terrestres para validar la detección.",
      },
    },
    stats: {
      ariaLabel: "Escala MixTechDevs del descubrimiento",
      heading: "Escala MixTechDevs del descubrimiento",
      intro:
        "Resumimos los indicadores clave detectados automáticamente a partir de tus CSV de exoplanetas.",
      loading: "Calculando métricas desde el CSV…",
      errorPrefix: "Error al generar métricas",
      cards: {
        planets: {
          kicker: "🪐",
          title: "Exoplanetas confirmados",
          description:
            "Planetas identificados tras las rutinas de validación de MixTechDevs.",
        },
        systems: {
          kicker: "⭐️",
          title: "Sistemas planetarios",
          description: "Estrellas anfitrionas agrupadas desde el CSV procesado.",
        },
        multi: {
          kicker: "🖼️",
          title: "Sistemas multi-planeta",
          description: "Hosts con ≥ 2 señales después del análisis de filas.",
        },
        tempered: {
          kicker: "🌍",
          title: "Candidatos “templados”",
          description:
            "Selección heurística basada en temperatura o insolación dentro del CSV.",
        },
      },
    },
  },

  en: {
    meta: {
      title: "MixTechDevs | Exoplanet Explorer",
      description:
        "Analyze CSV files to confirm and visualize exoplanets with MixTechDevs.",
    },
    notFound: {
      title: "404 – Page not found",
      heading: "Lost in the galaxy",
      description: "404 – The page you’re looking for doesn’t exist.",
      ctaHome: "Go home",
      ctaExplore: "Explore data",
    },
    layout: {
      badge: "MixTechDevs",
      nav: { home: "Home", analyze: "Analyze CSV", team: "Team", apod: "Image of the Day", moon: "Moon Phase" },
      languageSwitcher: {
        label: "Language",
        options: { es: "Spanish", en: "English", de: "German" },
      },
      footer: "© {year} MixTechDevs",
    },
    apod: {
      title: "NASA Astronomy Picture of the Day",
      subtitle: "Daily images and videos curated by NASA.",
      error: "We couldn't load today's image. Please try again later.",
      mediaFallback: "This content cannot be displayed.",
      noImageForDate: "No photo was found for that day.",
      dateLabel: "Date",
      go: "View",
      minDateHint: "No images before 1995-06-16.",
      prev: "Previous",
      next: "Next",
      today: "Today",
      videoBadge: "Video",
      openOriginalAria: "Open original image",
      monthPrevAria: "Previous month",
      monthNextAria: "Next month",
      altFallback: "APOD image",
    },
    moon: {
      title: "Moon Phase",
      subtitle: "Compute the lunar phase and a generated image for a date.",
      modeLabel: "People",
      modeOne: "1 person",
      modeTwo: "2 people",
      dateLabel: "Date",
      illumination: "Illumination",
      compareTitle: "Compare two dates",
      dateA: "Person 1",
      dateB: "Person 2",
      match: "Match",
      compareCta: "Compare",
      combined: "Combined",
      note: "Visual approximation; may vary by ±1 day depending on ephemerides and timezone.",
      phaseNames: [
        "New Moon",
        "Waxing Crescent",
        "First Quarter",
        "Waxing Gibbous",
        "Full Moon",
        "Waning Gibbous",
        "Last Quarter",
        "Waning Crescent"
      ]
    },
  
  de: {
    meta: {
      title: "MixTechDevs | Exoplaneten-Explorer",
      description:
        "Analysiere CSV-Dateien, um Exoplaneten zu bestätigen und zu visualisieren.",
    },
    notFound: {
      title: "404 – Seite nicht gefunden",
      heading: "In der Galaxie verirrt",
      description: "404 – Die gesuchte Seite existiert nicht.",
      ctaHome: "Zur Startseite",
      ctaExplore: "Daten erkunden",
    },
    layout: {
      badge: "MixTechDevs",
      nav: { home: "Start", analyze: "CSV analysieren", team: "Team", apod: "Bild des Tages", moon: "Mondphase" },
      languageSwitcher: {
        label: "Sprache",
        options: { es: "Spanisch", en: "Englisch", de: "Deutsch" },
      },
      footer: "© {year} MixTechDevs",
    },
    apod: {
      title: "Astronomy Picture of the Day (NASA)",
      subtitle: "Tägliche Bilder und Videos der NASA.",
      error: "Das heutige Bild konnte nicht geladen werden.",
      mediaFallback: "Dieser Inhalt kann nicht angezeigt werden.",
      noImageForDate: "Für diesen Tag wurde kein Foto gefunden.",
      dateLabel: "Datum",
      go: "Anzeigen",
      minDateHint: "Keine Bilder vor 1995-06-16.",
      prev: "Zurück",
      next: "Weiter",
      today: "Heute",
      videoBadge: "Video",
      openOriginalAria: "Originalbild öffnen",
      monthPrevAria: "Vorheriger Monat",
      monthNextAria: "Nächster Monat",
      altFallback: "APOD‑Bild",
    },
    moon: {
      title: "Mondphase",
      subtitle: "Berechne die Mondphase und ein generiertes Bild für ein Datum.",
      modeLabel: "Personen",
      modeOne: "1 Person",
      modeTwo: "2 Personen",
      dateLabel: "Datum",
      illumination: "Beleuchtung",
      compareTitle: "Zwei Daten vergleichen",
      dateA: "Person 1",
      dateB: "Person 2",
      match: "Übereinstimmung",
      compareCta: "Vergleichen",
      combined: "Kombiniert",
      note: "Visuelle Annäherung; kann je nach Ephemeriden und Zeitzone um ±1 Tag abweichen.",
      phaseNames: [
        "Neumond",
        "Zunehmende Sichel",
        "Erstes Viertel",
        "Zunehmender Dreiviertelmond",
        "Vollmond",
        "Abnehmender Dreiviertelmond",
        "Letztes Viertel",
        "Abnehmende Sichel"
      ]
    },
  },
    hero: {
      badge: "MixTechDevs · Exoplanets",
      title: "Discover exoplanets from your CSVs",
      subtitle: {
        leading: "A suite of ",
        highlight: "MixTechDevs tools",
        trailing:
          " that parses CSV files to detect and understand new worlds.",
      },
      ctaPrimary: "Import CSV",
      ctaSecondary: "View guides",
      hints: [
        "Upload a CSV and validate exoplanets instantly",
        "Spot patterns in observational catalogues",
        "Classify by method, mass, or habitability",
      ],
    },
    sections: {
      methods: {
        cards: [
          {
            title: "Transit Method",
            description:
              "Detect periodic dips by interpreting light curves stored in your CSV files.",
          },
          {
            title: "Radial Velocity",
            description:
              "Analyze time-series data in CSV format to uncover Doppler shifts and confirm signals.",
          },
          {
            title: "Direct Imaging",
            description:
              "Cross-match spectral metadata and positions recorded in CSVs to isolate observational candidates.",
          },
        ],
      },
      resources: {
        cards: [
          {
            title: "Catalogues",
            description:
              "Ingest your own CSVs or public APIs like NASA’s Exoplanet Archive and sync tailored filters.",
          },
          {
            title: "Visualisations",
            description:
              "Generate interactive plots from CSV columns: light curves, mass–radius charts, and more.",
          },
          {
            title: "Documentation",
            description:
              "Create extra routes with step-by-step flows to import, clean, and validate your CSV data.",
          },
        ],
      },
    },
    summary: {
      ariaLabel: "Exoplanet summary",
      loading: "Processing exoplanets from your CSV…",
      errorPrefix: "Error loading CSV data",
      nullLabel: "Null",
      cards: {
        total: { title: "Total", description: "Records detected after importing the CSV." },
        timeRange: {
          title: "Time range",
          description: "Earliest and latest discovery year reported in the CSV.",
        },
        topMethods: { title: "Top methods" },
        nearest: { title: "Closest", note: "Values normalised from the CSV distance columns." },
      },
    },
    search: {
      title: "CSV explorer",
      filters: {
        queryPlaceholder: "Search by planet or host…",
        methodAll: "All",
        yearMin: "Min year",
        yearMax: "Max year",
      },
      tableHeaders: {
        planet: "Planet",
        planetHint:
          "Official name or designation of the detected exoplanet.",
        host: "Host",
        hostHint: "Host star that the exoplanet orbits.",
        method: "Method",
        methodHint:
          "Observational technique used to confirm the planet.",
        year: "Year",
        yearHint:
          "Announcement/confirmation year reported in the catalogue.",
        mass: "Mass",
        massHint:
          "Approximate mass expressed in Earth masses (M⊕).",
        distance: "Distance",
        distanceHint:
          "Distance to the system in parsecs (pc). 1 pc ≈ 3.26 light-years.",
      },
      legend: {
        planet: "Planet: designation recorded in the catalogue.",
        planetHint:
          "Official name or designation of the detected exoplanet.",
        host: "Host: host star.",
        hostHint: "Star around which the planet orbits.",
        method: "Method: detection technique.",
        methodHint: "Transits, radial velocity, direct imaging, etc.",
        year: "Year: official report.",
        yearHint:
          "Announcement or confirmation year in the consulted catalogue.",
        mass: "Mass: magnitude in M⊕.",
        massHint: "M⊕ indicates how many times Earth’s mass.",
        distance: "Distance: separation in pc.",
        distanceHint: "1 pc ≈ 3.26 light-years.",
      },
      summary: "Showing {shown} of {total} processed rows.",
      footerHint:
        "Data from NASA Exoplanet Archive (excerpt). Update your CSV to broaden the sample.",
      backTop: "Back to top",
      emptyValue: "—",
    },
    analyze: {
      title: "Analyze CSV",
      message:
        "Route /analizar is live. Drop your CSV files here when you're ready.",
    },
    analyzeUI: {
      uploadHeading: "1) Upload CSV",
      dropHint: "Drag & drop your CSV here, or click to choose",
      headersHint: "The CSV must include headers in the first row.",
      selectFile: "Choose file",
      fileInfo: { name: "File", rows: "Rows", cols: "Columns" },
      mappingHeading: "2) Column mapping",
      metricsHeading: "3) Metrics & visualizations",
      previewHeading: "4) Model output preview (future)",
      clear: "Reset",
      showMetrics: "Show metrics",
      showCharts: "Show charts",
      downloadExample: "Download example JSON",
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
        felead: "FrontEnd Lead",
      },
    },
    settings: {
      title: "Account settings",
      message: "Customize your MixTechDevs profile, preferences, and security.",
      comingSoon: "Coming soon",
      background: {
        title: "Custom backgrounds",
        description: "Pick a different visual mood for MixTechDevs.",
        loading: "Loading preference…",
        signedOut: "Sign in with Google to choose your background.",
        statusSaving: "Saving…",
        statusSaved: "Preference saved",
        statusError: "Could not save the preference.",
        saveError: "Please try again later.",
        options: {
          default: {
            label: "MixTechDevs gradient",
            description: "Keep the signature space gradient.",
          },
          matrix: {
            label: "Digital rain",
            description: "Neon-green glyphs cascading over a black canvas.",
          },
        },
      },
      cards: [
        {
          title: "Profile",
          description: "Edit your display name and sync your Google photo.",
        },
        {
          title: "Preferences",
          description: "Choose language, notifications, and default behaviors.",
        },
        {
          title: "Security",
          description: "Review active sessions and sign out everywhere.",
        },
      ],
    },
    compare: {
      heading: "Earth vs Exoplanet",
      description: {
        intro:
          "Visual comparison (not to scale) between Earth and a selected exoplanet; radii scale with",
        outro: ".",
      },
      formula: { base: "r ∝ M", exponent: "1/3" },
      inputPlaceholder: "Type/select an exoplanet…",
      toggle: { stop: "Stop", rotate: "Rotate" },
      earthLabel: "Earth",
      jupiterLabel: "Jupiter",
      nullLabel: "Null",
      modes: {
        earthExo: "Earth + Selected",
        jupiterExo: "Jupiter + Selected",
        all: "All three",
      },
      facts: {
        mass: "Mass",
        radius: "Visual radius",
        tempEq: "Equilibrium temp.",
        method: "Method",
        year: "Year",
        host: "Host",
        spectralType: "Spectral type",
        distance: "Distance",
      },
      suffixes: { mass: " M⊕", radius: " R⊕", temp: " K", distance: " pc" },
      disclaimer:
        "Note: visualization derives from estimates in your CSV and is not to scale. For physical radii, rely on measured values or specialised mass–radius relations.",
      context: {
        title: "Why compare?",
        body:
          "The module contrasts CSV-derived data with Earth baselines to validate detections.",
      },
    },
    stats: {
      ariaLabel: "MixTechDevs discovery scale",
      heading: "MixTechDevs discovery scale",
      intro:
        "Key indicators automatically extracted from your exoplanet CSV.",
      loading: "Calculating metrics from the CSV…",
      errorPrefix: "Error generating metrics",
      cards: {
        planets: {
          kicker: "🪐",
          title: "Confirmed exoplanets",
          description:
            "Planets identified after MixTechDevs validation routines.",
        },
        systems: {
          kicker: "⭐️",
          title: "Planetary systems",
          description: "Host stars grouped from the processed CSV.",
        },
        multi: {
          kicker: "🖼️",
          title: "Multi-planet systems",
          description: "Hosts with ≥ 2 signals after row analysis.",
        },
        tempered: {
          kicker: "🌍",
          title: "Tempered candidates",
          description:
            "Heuristic selection based on temperature or insolation columns in the CSV.",
        },
      },
    },
  },

  de: {
    meta: {
      title: "MixTechDevs | Exoplaneten-Explorer",
      description:
        "Analysiere CSV-Dateien, um Exoplaneten mit MixTechDevs zu bestätigen und zu visualisieren.",
    },
    notFound: {
      title: "404 – Seite nicht gefunden",
      heading: "Verloren in der Galaxie",
      description: "404 – Die gesuchte Seite existiert nicht.",
      ctaHome: "Zur Startseite",
      ctaExplore: "Daten erkunden",
    },
    layout: {
      badge: "MixTechDevs",
      nav: { home: "Startseite", analyze: "CSV analysieren", team: "Team", apod: "Bild des Tages" },
      languageSwitcher: {
        label: "Sprache",
        options: { es: "Spanisch", en: "Englisch", de: "Deutsch" },
      },
      footer: "© {year} MixTechDevs",
    },
    hero: {
      badge: "MixTechDevs · Exoplaneten",
      title: "Entdecke Exoplaneten aus deinen CSV-Dateien",
      subtitle: {
        leading: "Ein Set von ",
        highlight: "MixTechDevs-Werkzeugen",
        trailing:
          " das CSV-Dateien auswertet, um neue Welten aufzuspüren und zu verstehen.",
      },
      ctaPrimary: "CSV importieren",
      ctaSecondary: "Leitfäden ansehen",
      hints: [
        "Lade ein CSV hoch und prüfe Exoplaneten sofort",
        "Erkenne Muster in Beobachtungskatalogen",
        "Klassifiziere nach Methode, Masse oder Habitabilität",
      ],
    },
    sections: {
      methods: {
        cards: [
          {
            title: "Transitmethode",
            description:
              "Erkenne periodische Abdunklungen, indem du Lichtkurven aus deinen CSV-Dateien interpretierst.",
          },
          {
            title: "Radialgeschwindigkeit",
            description:
              "Analysiere Zeitreihen im CSV-Format, um Dopplerverschiebungen aufzuspüren und Signale zu bestätigen.",
          },
          {
            title: "Direktabbildung",
            description:
              "Vernetze spektrale Metadaten und Positionen aus CSVs, um Beobachtungskandidaten zu isolieren.",
          },
        ],
      },
      resources: {
        cards: [
          {
            title: "Kataloge",
            description:
              "Binde eigene CSVs oder APIs wie das NASA Exoplanet Archive ein und synchronisiere maßgeschneiderte Filter.",
          },
          {
            title: "Visualisierungen",
            description:
              "Erzeuge interaktive Diagramme aus CSV-Spalten: Lichtkurven, Masse-Radius-Plots und mehr.",
          },
          {
            title: "Dokumentation",
            description:
              "Plane zusätzliche Routen mit Schritt-für-Schritt-Abläufen zum Importieren, Bereinigen und Validieren deiner CSVs.",
          },
        ],
      },
    },
    summary: {
      ariaLabel: "Exoplaneten-Übersicht",
      loading: "Exoplaneten aus deinem CSV werden verarbeitet…",
      errorPrefix: "Fehler beim Laden der CSV-Daten",
      nullLabel: "Null",
      cards: {
        total: { title: "Gesamt", description: "Einträge, die nach dem CSV-Import erkannt wurden." },
        timeRange: {
          title: "Zeitspanne",
          description:
            "Frühestes und spätestes im CSV gemeldetes Entdeckungsjahr.",
        },
        topMethods: { title: "Wichtigste Methoden" },
        nearest: { title: "Nächste", note: "Werte normalisiert aus den Distanzspalten des CSV." },
      },
    },
    search: {
      title: "CSV-Explorer",
      filters: {
        queryPlaceholder: "Nach Planet oder Stern suchen…",
        methodAll: "Alle",
        yearMin: "Jahr min",
        yearMax: "Jahr max",
      },
      tableHeaders: {
        planet: "Planet",
        planetHint:
          "Offizieller Name oder Bezeichnung des entdeckten Exoplaneten.",
        host: "Stern",
        hostHint: "Zentralstern, den der Exoplanet umkreist.",
        method: "Methode",
        methodHint:
          "Beobachtungsverfahren zur Bestätigung des Planeten.",
        year: "Jahr",
        yearHint: "Melde-/Bestätigungsjahr im Katalog.",
        mass: "Masse",
        massHint: "Ungefähre Masse in Erdmassen (M⊕).",
        distance: "Distanz",
        distanceHint:
          "Entfernung zum System in Parsec (pc). 1 pc ≈ 3,26 Lichtjahre.",
      },
      legend: {
        planet: "Planet: Katalogbezeichnung.",
        planetHint:
          "Offizieller Name oder Bezeichnung des Exoplaneten.",
        host: "Stern: Zentralstern.",
        hostHint: "Stern, den der Planet umkreist.",
        method: "Methode: Nachweistechnik.",
        methodHint:
          "Transite, Radialgeschwindigkeit, Direktabbildung, usw.",
        year: "Jahr: offizieller Bericht.",
        yearHint:
          "Melde- oder Bestätigungsjahr im konsultierten Katalog.",
        mass: "Masse: Größe in M⊕.",
        massHint: "M⊕ gibt das Vielfache der Erdmasse an.",
        distance: "Distanz: Abstand in pc.",
        distanceHint: "1 pc ≈ 3,26 Lichtjahre.",
      },
      summary:
        "Es werden {shown} von {total} verarbeiteten Zeilen angezeigt.",
      footerHint:
        "Daten aus dem NASA Exoplanet Archive (Auszug). Aktualisiere dein CSV, um die Stichprobe zu erweitern.",
      backTop: "Nach oben",
      emptyValue: "—",
    },
    analyze: {
      title: "CSV analysieren",
      message:
        "Die Route /analizar ist aktiv. Lade deine CSV-Dateien hier, sobald du bereit bist.",
    },
    analyzeUI: {
      uploadHeading: "1) CSV hochladen",
      dropHint: "Ziehe deine CSV hierher oder klicke zur Auswahl",
      headersHint:
        "Die CSV-Datei muss Kopfzeilen in der ersten Zeile enthalten.",
      selectFile: "Datei wählen",
      fileInfo: { name: "Datei", rows: "Zeilen", cols: "Spalten" },
      mappingHeading: "2) Spaltenzuordnung",
      metricsHeading: "3) Metriken & Visualisierungen",
      previewHeading: "4) Modellvorschau (zukünftig)",
      clear: "Zurücksetzen",
      showMetrics: "Metriken anzeigen",
      showCharts: "Diagramme anzeigen",
      downloadExample: "Beispiel-JSON herunterladen",
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
        felead: "FrontEnd Lead",
      },
    },
    settings: {
      title: "Kontoeinstellungen",
      message: "Passe dein MixTechDevs-Profil, deine Präferenzen und Sicherheit an.",
      comingSoon: "Demnächst verfügbar",
      background: {
        title: "Individuelle Hintergründe",
        description: "Wähle eine andere visuelle Stimmung für MixTechDevs.",
        loading: "Lade Einstellung…",
        signedOut: "Melde dich mit Google an, um deinen Hintergrund zu wählen.",
        statusSaving: "Speichern…",
        statusSaved: "Präferenz gespeichert",
        statusError: "Präferenz konnte nicht gespeichert werden.",
        saveError: "Versuche es später noch einmal.",
        options: {
          default: {
            label: "MixTechDevs-Gradient",
            description: "Behält den klassischen Weltraumverlauf bei.",
          },
          matrix: {
            label: "Digitaler Regen",
            description: "Neongrüne Zeichen fallen vor schwarzem Hintergrund.",
          },
        },
      },
      cards: [
        {
          title: "Profil",
          description: "Bearbeite deinen Anzeigenamen und synchronisiere dein Google-Foto.",
        },
        {
          title: "Präferenzen",
          description: "Wähle Sprache, Benachrichtigungen und Standardaktionen.",
        },
        {
          title: "Sicherheit",
          description: "Überprüfe aktive Sitzungen und melde dich überall ab.",
        },
      ],
    },
    compare: {
      heading: "Erde vs. Exoplanet",
      description: {
        intro:
          "Visueller Vergleich (nicht maßstabsgetreu) zwischen der Erde und einem gewählten Exoplaneten; die Radien skalieren mit",
        outro: ".",
      },
      formula: { base: "r ∝ M", exponent: "1/3" },
      inputPlaceholder: "Wähle oder tippe einen Exoplaneten…",
      toggle: { stop: "Stopp", rotate: "Rotieren" },
      earthLabel: "Erde",
      jupiterLabel: "Jupiter",
      nullLabel: "Null",
      modes: {
        earthExo: "Erde + Auswahl",
        jupiterExo: "Jupiter + Auswahl",
        all: "Alle drei",
      },
      facts: {
        mass: "Masse",
        radius: "Visueller Radius",
        tempEq: "Gleichgewichtstemp.",
        method: "Methode",
        year: "Jahr",
        host: "Stern",
        spectralType: "Spektraltyp",
        distance: "Distanz",
      },
      suffixes: { mass: " M⊕", radius: " R⊕", temp: " K", distance: " pc" },
      disclaimer:
        "Hinweis: Visualisierung basiert auf Schätzungen aus deinem CSV und ist nicht maßstabsgetreu. Für reale Radien nutze Messwerte oder spezialisierte Masse-Radius-Relationen.",
      context: {
        title: "Warum vergleichen?",
        body:
          "Das Modul stellt CSV-basierte Daten den Erdreferenzen gegenüber, um Entdeckungen zu validieren.",
      },
    },
    stats: {
      ariaLabel: "MixTechDevs-Entdeckungsskala",
      heading: "MixTechDevs-Entdeckungsskala",
      intro:
        "Schlüsseleindikatoren, die automatisch aus deinem Exoplaneten-CSV extrahiert wurden.",
      loading: "Metriken werden aus dem CSV berechnet…",
      errorPrefix: "Fehler beim Erstellen der Metriken",
      cards: {
        planets: {
          kicker: "🪐",
          title: "Bestätigte Exoplaneten",
          description:
            "Planeten, die nach MixTechDevs-Validierung erkannt wurden.",
        },
        systems: {
          kicker: "⭐️",
          title: "Planetensysteme",
          description: "Zentralsterne, gruppiert aus dem verarbeiteten CSV.",
        },
        multi: {
          kicker: "🖼️",
          title: "Mehrplanetensysteme",
          description:
            "Sterne mit ≥ 2 Signalen nach der Zeilenanalyse.",
        },
        tempered: {
          kicker: "🌍",
          title: "Gemäßigte Kandidaten",
          description:
            "Heuristische Auswahl basierend auf Temperatur- oder Insolationsspalten des CSV.",
        },
      },
    },
  },
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
