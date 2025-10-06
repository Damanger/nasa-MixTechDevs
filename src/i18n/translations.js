import { sub } from "motion/react-client";

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
      badge: "ExoLens",
      nav: {
        home: "Inicio",
        analyze: "Analizar CSV",
        apod: "Imagen del día",
        moon: "Fase lunar",
        system: "Mi sistema solar",
        postcard: "Postal galáctica",
        team: "Equipo"
      },
      languageSwitcher: {
        label: "Idioma",
        options: { es: "Español", en: "Inglés", de: "Alemán" },
      },
      footer: "© {year} MixTechDevs",
    },
    solar: {
      title: "Mi sistema",
      subtitle: "Crea, organiza y guarda tu sistema solar personalizado.",
      controls: {
        controls: "Controles",
        download: "Descargar",
        downloadTitle: "Descargar imagen (PNG)",
        save: "Guardar",
        name: "Nombre",
        namePlaceholder: "Mi sistema",
        planetsCount: "Planetas (1–9)",
        speed: "Velocidad",
        zoom: "Zoom",
        showOrbits: "Mostrar órbitas",
        star: "Sol",
        color: "Color",
        size: "Tamaño",
        planets: "Planetas",
        rings: "Anillos",
        ringTilt: "Inclinación",
        randomize: "Aleatorizar",
        reset: "Restablecer",
        camera: "Cámara",
        savedToast: "Sistema guardado",
        loadedToast: "Sistema cargado",
      },
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
      subtitle: "Descubre tu fase lunar colocando tu fecha de nacimiento y/o la de tu persona especial 🚀",
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
    postcard: {
      title: "Postal galáctica",
      subtitle: "Diseña una tarjeta espacial y compártela con tu tripulación.",
      designHeading: "Elige tu boceto",
      designDescription: "Explora seis estilos inspirados en nebulosas y estaciones orbitales.",
      messageHeading: "Personaliza tu mensaje",
      messageLabel: "Mensaje",
      messagePlaceholder: "Escribe tus deseos cósmicos…",
      senderLabel: "Remitente",
      senderPlaceholder: "Nombre de quien envía la postal",
      photoHeading: "Agrega una foto",
      photoHint: "Se recomienda formato cuadrado (JPG o PNG).",
      photoButton: "Seleccionar imagen",
      photoRemove: "Quitar foto",
      previewHeading: "Vista previa",
      previewNote: "La postal se adapta automáticamente al boceto que elijas.",
      sampleMessage: "Que cada nueva órbita nos acerque a los mundos que soñamos explorar.",
      sampleSender: "Tripulación MixTechDevs",
      shareHeading: "Comparte tu postal",
      shareDescription: "Genera un enlace temporal para mostrar esta tarjeta.",
      shareButton: "Crear enlace",
      shareGenerating: "Generando…",
      shareCopy: "Copiar enlace",
      shareCopied: "¡Enlace copiado!",
      shareError: "No pudimos crear el enlace.",
      shareTooLarge: "La imagen es muy pesada para un enlace temporal. Usa un archivo más ligero.",
      sharePreview: "Comparte este enlace para que tu tripulación vea la postal en línea.",
      shareViewingNotice: "Estás viendo una postal compartida. Puedes ajustarla y generar un nuevo enlace.",
      shareStale: "Actualizaste la postal. Genera un enlace nuevo para compartir los cambios.",
      designs: [
        {
          id: "aurora",
          name: "Aurora Boreal",
          description: "Brillos verdes y violetas acarician el borde de tu mensaje.",
        },
        {
          id: "supernova",
          name: "Supernova",
          description: "Un estallido estelar dorado ilumina el centro de la postal.",
        },
        {
          id: "orbit",
          name: "Órbita doble",
          description: "Dos órbitas concéntricas rodean tu foto y el mensaje.",
        },
        {
          id: "nebula",
          name: "Nebulosa eterna",
          description: "Remolinos magenta y turquesa envuelven la tarjeta.",
        },
        {
          id: "signal",
          name: "Señal de radar",
          description: "Ondas de comunicación interplanetaria enfatizan cada palabra.",
        },
        {
          id: "station",
          name: "Módulo orbital",
          description: "Paneles modulares y tipografía minimalista estilo estación espacial.",
        },
      ],
    },
    hero: {
      badge: "MixTechDevs · Exoplanetas",
      title: "Descubre exoplanetas a partir de tus bases de datos",
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
      title: "Analizar base de datos",
      message:
        "Sube un archivo CSV y valida exoplanetas al instante mediante el modelo de detección creado por MixTechDevs.",
    },
    analyzeUI: {
      uploadHeading: "Cargar CSV",
	  exampleDataset: "Usar CSV de ejemplo",
      // Core prediction labels (added for parity with English)
      predictionDetails: "Haz click en un elemento para ver su predicción y probabilidad.",
      confirmedProbability: "Probabilidad de exoplaneta",
      falsePositiveProbability: "Probabilidad de falso positivo",
      falsePositiveResult: "Falso positivo",
      exoplanetCandidateResult: "Candidato a exoplaneta",
      dropHint: "Arrastra y suelta tu archivo CSV aquí, o haz clic para elegir",
  headersHint: `El archivo CSV debe incluir encabezados en la primera fila. A continuación se muestra la lista de columnas requeridas.`,
  headersExact: `Los nombres de columna deben coincidir exactamente con los mostrados arriba.`,
      selectFile: "Elegir archivo",
      fileInfo: { name: "Archivo", rows: "Filas", cols: "Columnas" },
      previewHeading: "Visualización de resultados",
 	  predictionsDesc: "El modelo de MixTechDevs evalúa cada fila del CSV y asigna una probabilidad de ser un candidato a exoplaneta o falso positivo. Haz click en un elemento para visualizar su predicción y probabilidad.",
      // Added keys used by AnalyzeDashboard.jsx
      prediction: "Predicción del modelo",
      probability_confirmed: "Probabilidad (exoplaneta)",
      probability_false_positive: "Probabilidad (falso positivo)",
  // action keys removed: retry/copy payload (not used in UI)
      closeButton: "Cerrar",
      simulatedNotice: "Esta predicción es SIMULADA",
      orUploadHint: "O carga tu propio archivo CSV abajo",
      noRowsHint: "Carga un archivo CSV para ver los resultados.",
      prevButton: "Anterior",
      nextButton: "Siguiente",
      pageInfo: "Mostrando {start} - {end} de {total}",
      loadingPrediction: "Cargando predicción...",
      errorLabel: "Error:",
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
      subtitle: "Seguridad y confidencialidad en cada paso. Tu información está protegida.",
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
          grid: {
            label: "Cuadros negros",
            description: "Retícula isométrica sobre un fondo grafito.",
          },
          city: {
            label: "Ciudad nocturna",
            description: "Silhuetas urbanas con linterna animada.",
          },
          spectrum: {
            label: "Spectrum",
            description: "Ondas cromáticas animadas estilo synthwave.",
          },
          terrain: {
            label: "Terreno fractal",
            description: "Ruido procedural con iluminación tenue.",
          },
          shards: {
            label: "Fragmentos neón",
            description: "Destellos diagonales animados sobre un entramado oscuro.",
          },
          aurora: {
            label: "Aurora vectorial",
            description: "Radiales multicolor con animación suave.",
          },
          futuristic: {
            label: "Textura futurista",
            description: "Metal iridiscente con iluminación especular.",
          },
          rain: {
            label: "Lluvia azul",
            description: "Cortinas de lluvia neón sobre un difuminado tecnológico.",
          },
          
          neon: {
            label: "Geometría neón",
            description: "Patrón vectorial vibrante con acentos magenta.",
          },
          prismatic: {
            label: "Destello prismático",
            description: "Rayos de color con mezcla aditiva.",
          },
          lightning: {
            label: "Relámpago",
            description: "Descargas eléctricas estilizadas.",
          },
          plasma: {
            label: "Plasma",
            description: "Neblina energética en movimiento.",
          },
          galaxy: {
            label: "Galaxia",
            description: "Campo estelar con brillo y parallax.",
          },
          
          lightrays: {
            label: "Rayos de luz",
            description: "Rayos volumétricos suaves con mezcla aditiva.",
          },
        },
      },
      language: {
        title: "Idioma predeterminado",
        description: "Elige el idioma por defecto para la interfaz.",
        loading: "Cargando preferencia…",
        signedOut: "Inicia sesión con Google para elegir tu idioma.",
        statusSaving: "Guardando…",
        statusSaved: "Preferencia guardada",
        statusError: "No se pudo guardar la preferencia.",
        saveError: "Intenta de nuevo más tarde.",
        options: { es: "Español", en: "Inglés", de: "Alemán" },
      },
    },
    userMenu: {
      settings: "Ajustes",
      notes: "Notas",
      reminders: "Recordatorio",
      images: "Imágenes",
      signOut: "Cerrar sesión",
    },
    notes: {
      title: "Notas personales",
      subtitle: "Organiza tus ideas con formato enriquecido y sincronización en la nube.",
      titleLabel: "Título",
      titlePlaceholder: "Escribe un título para tu nota",
      contentLabel: "Contenido",
      contentPlaceholder: "Escribe tu nota…",
      fontSizeLabel: "Tamaño de texto",
      fontSizes: {
        small: "Pequeño",
        medium: "Mediano",
        large: "Grande",
      },
      boldLabel: "Negrita",
      italicLabel: "Cursiva",
      saveButton: "Guardar nota",
      loading: "Cargando notas…",
      saving: "Guardando…",
      deleting: "Eliminando…",
      empty: "Aún no tienes notas.",
      signedOut: "Inicia sesión con Google para crear notas.",
      delete: "Eliminar",
      error: "No se pudo guardar la nota.",
      missingFields: "Completa el título y el contenido.",
      previewLabel: "Vista previa",
      lastUpdated: "Última actualización",
    },
    reminders: {
      title: "Recordatorios",
      subtitle: "Centraliza tareas y actividades importantes en un solo lugar.",
      description: "Próximamente podrás programar alertas y sincronizarlas con tus dispositivos.",
      messageLabel: "Texto a recordar",
      messagePlaceholder: "Describe tu recordatorio…",
      dateLabel: "Recordar hasta",
      dateHint: "Usa la fecha en la que deja de ser relevante.",
      saveButton: "Guardar recordatorio",
      saving: "Guardando…",
      loading: "Cargando recordatorios…",
      empty: "No tienes recordatorios activos.",
      signedOut: "Inicia sesión con Google para crear recordatorios.",
      delete: "Eliminar",
      deleting: "Eliminando…",
      error: "No se pudo guardar el recordatorio.",
      dateError: "Selecciona una fecha válida.",
      lastUpdated: "Última edición",
      expiresOn: "Expira",
      assistantHint: "Tienes {count} recordatorios.",
      assistantHintOne: "Tienes 1 recordatorio.",
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
      badge: "ExoLens",
      nav: {
        home: "Home",
        analyze: "Analyze CSV",
        apod: "Image of the Day",
        moon: "Moon Phase",
        system: "My Solar System",
        postcard: "Galactic Postcard",
        team: "Team"
      },
      languageSwitcher: {
        label: "Language",
        options: { es: "Spanish", en: "English", de: "German" },
      },
      footer: "© {year} MixTechDevs",
    },
    solar: {
      title: "My System",
      subtitle: "Create, organize and save your custom solar system.",
      controls: {
        controls: "Controls",
        download: "Download",
        downloadTitle: "Download image (PNG)",
        save: "Save",
        name: "Name",
        namePlaceholder: "My system",
        planetsCount: "Planets (1–9)",
        speed: "Speed",
        zoom: "Zoom",
        showOrbits: "Show orbits",
        star: "Star",
        color: "Color",
        size: "Size",
        planets: "Planets",
        rings: "Rings",
        ringTilt: "Tilt",
        randomize: "Randomize",
        reset: "Reset",
        camera: "Camera",
        savedToast: "System saved",
        loadedToast: "System loaded",
      },
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
      subtitle: "Discover your moon phase by entering your birthday and/or that of your special someone 🚀",
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
    postcard: {
      title: "Galactic Postcard",
      subtitle: "Design a space-themed card and send it to your crew.",
      designHeading: "Pick a sketch",
      designDescription: "Browse six concepts inspired by nebulas and orbital stations.",
      messageHeading: "Customize your message",
      messageLabel: "Message",
      messagePlaceholder: "Write your cosmic wishes…",
      senderLabel: "Sender",
      senderPlaceholder: "Who is signing the postcard",
      photoHeading: "Add a photo",
      photoHint: "Square images (JPG or PNG) deliver the best result.",
      photoButton: "Choose image",
      photoRemove: "Remove photo",
      previewHeading: "Preview",
      previewNote: "The layout adapts automatically to the selected sketch.",
      sampleMessage: "May every new orbit bring us closer to the worlds we dream of exploring.",
      sampleSender: "MixTechDevs Crew",
      shareHeading: "Share your postcard",
      shareDescription: "Generate a temporary link so others can see this design.",
      shareButton: "Create link",
      shareGenerating: "Generating…",
      shareCopy: "Copy link",
      shareCopied: "Link copied!",
      shareError: "We couldn't create the link.",
      shareTooLarge: "The image is too heavy for a temporary link. Try a smaller file.",
      sharePreview: "Send this link so your crew can preview the card online.",
      shareViewingNotice: "You're viewing a shared postcard. Feel free to tweak it and generate a fresh link.",
      shareStale: "You updated the postcard. Create a new link to share the latest version.",
      designs: [
        {
          id: "aurora",
          name: "Aurora Borealis",
          description: "Emerald and violet lights embrace the edge of your text.",
        },
        {
          id: "supernova",
          name: "Supernova Burst",
          description: "A golden stellar flash highlights the heart of your card.",
        },
        {
          id: "orbit",
          name: "Twin Orbit",
          description: "Two concentric orbits frame your photo and message.",
        },
        {
          id: "nebula",
          name: "Eternal Nebula",
          description: "Magenta and teal clouds swirl around the layout.",
        },
        {
          id: "signal",
          name: "Radar Signal",
          description: "Interplanetary communication waves amplify each word.",
        },
        {
          id: "station",
          name: "Orbital Module",
          description: "Modular panels and minimalist type evoke a space station.",
        },
      ],
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
        "Upload your CSV file and instantly validate exoplanets using the detection model created by MixTechDevs.",
    },
    analyzeUI: {
      predictionDetails: "Click an item to view its prediction and probability.",
      confirmedProbability: "Exoplanet probability",
      falsePositiveProbability: "False positive probability",
      prediction: "Model prediction",
  // action keys removed: retry/copy payload (not used in UI)
      closeButton: "Close",
      falsePositiveResult: "False Positive",
      exoplanetCandidateResult: "Exoplanet Candidate",
      uploadHeading: "1) Upload CSV",
	  exampleDataset: "Use example CSV",
      dropHint: "Drag & drop your CSV here, or click to choose",
  headersHint: "The CSV must include headers in the first row. The required column list is shown below.",
  headersExact: "Column names must match exactly the labels shown below.",
      selectFile: "Choose file",
      fileInfo: { name: "File", rows: "Rows", cols: "Columns" },
      previewHeading: "2) Detection model predictions",
	  predictionsDesc: "The MixTechDevs model evaluates each CSV row and assigns a probability of being an exoplanet candidate or false positive.",
  // Added keys used by AnalyzeDashboard.jsx
  probability_confirmed: "Probability (exoplanet)",
  probability_false_positive: "Probability (false positive)",
  // action keys removed: retry/copy payload (not used in UI)
  closeButtonLabel: "Close",
  simulatedNotice: "This prediction is SIMULATED",
  orUploadHint: "Or upload your own CSV below",
  noRowsHint: "Upload a CSV file to view results.",
  prevButton: "Previous",
  nextButton: "Next",
  pageInfo: "Showing {start} - {end} of {total}",
  loadingPrediction: "Loading prediction...",
  errorLabel: "Error:",
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
      subtitle: "Security and privacy at every step. Your information is protected.",
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
          grid: {
            label: "Black grid",
            description: "Graphite isometric grid with subtle glow.",
          },
          city: {
            label: "Nocturnal city",
            description: "Skyline silhouettes with a roaming spotlight.",
          },
          spectrum: {
            label: "Spectrum",
            description: "Animated chromatic waves for a synthwave vibe.",
          },
          terrain: {
            label: "Fractal terrain",
            description: "Procedural noise with subtle lighting relief.",
          },
          shards: {
            label: "Neon shards",
            description: "Animated diagonal accents over a dark weave.",
          },
          aurora: {
            label: "Vector aurora",
            description: "Multi-color radial glow with gentle motion.",
          },
          futuristic: {
            label: "Futuristic texture",
            description: "Iridescent metal wash with specular highlights.",
          },
          rain: {
            label: "Blue rain",
            description: "Neon rainfall cascading across a dark blur.",
          },
          
          neon: {
            label: "Neon geometry",
            description: "Vibrant vector pattern with magenta accents.",
          },
          prismatic: {
            label: "Prismatic burst",
            description: "Color rays with additive blending.",
          },
          lightning: {
            label: "Lightning",
            description: "Stylised electric discharges.",
          },
          plasma: {
            label: "Plasma",
            description: "Energetic moving haze.",
          },
          galaxy: {
            label: "Galaxy",
            description: "Starfield with glow and parallax.",
          },
          
          lightrays: {
            label: "Light Rays",
            description: "Soft volumetric beams with additive blend.",
          },
        },
      },
      language: {
        title: "Default language",
        description: "Choose the default UI language.",
        loading: "Loading preference…",
        signedOut: "Sign in with Google to choose your language.",
        statusSaving: "Saving…",
        statusSaved: "Preference saved",
        statusError: "Could not save the preference.",
        saveError: "Please try again later.",
        options: { es: "Spanish", en: "English", de: "German" },
      },
    },
    userMenu: {
      settings: "Settings",
      notes: "Notes",
      reminders: "Reminder",
      images: "Images",
      signOut: "Sign out",
    },
    notes: {
      title: "Personal notes",
      subtitle: "Capture ideas with rich formatting and keep them in sync.",
      titleLabel: "Title",
      titlePlaceholder: "Give your note a title",
      contentLabel: "Content",
      contentPlaceholder: "Write your note…",
      fontSizeLabel: "Text size",
      fontSizes: {
        small: "Small",
        medium: "Medium",
        large: "Large",
      },
      boldLabel: "Bold",
      italicLabel: "Italic",
      saveButton: "Save note",
      loading: "Loading notes…",
      saving: "Saving…",
      deleting: "Deleting…",
      empty: "You don't have notes yet.",
      signedOut: "Sign in with Google to create notes.",
      delete: "Delete",
      error: "We couldn't save the note.",
      missingFields: "Add a title and some content.",
      previewLabel: "Preview",
      lastUpdated: "Last updated",
    },
    reminders: {
      title: "Reminders",
      subtitle: "Keep important tasks and follow-ups in one place.",
      description: "Soon you'll be able to schedule alerts and sync them to your devices.",
      messageLabel: "Reminder",
      messagePlaceholder: "What do you need to remember?",
      dateLabel: "Remind me until",
      dateHint: "Pick the date when the reminder is no longer needed.",
      saveButton: "Save reminder",
      saving: "Saving…",
      loading: "Loading reminders…",
      empty: "You don't have active reminders.",
      signedOut: "Sign in with Google to create reminders.",
      delete: "Delete",
      deleting: "Deleting…",
      error: "We couldn't save the reminder.",
      dateError: "Choose a valid date.",
      lastUpdated: "Last edited",
      expiresOn: "Expires",
      assistantHint: "You have {count} reminders.",
      assistantHintOne: "You have 1 reminder.",
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
      badge: "ExoLens",
      nav: {
        home: "Startseite",
        analyze: "CSV analysieren",
        apod: "Bild des Tages",
        moon: "Mondphase",
        system: "Mein Sonnensystem",
        postcard: "Galaktische Postkarte",
        team: "Team"
      },
      languageSwitcher: {
        label: "Sprache",
        options: { es: "Spanisch", en: "Englisch", de: "Deutsch" },
      },
      footer: "© {year} MixTechDevs",
    },
    solar: {
      title: "Mein System",
      subtitle: "Erstelle, organisiere und speichere dein eigenes Sonnensystem.",
      controls: {
        controls: "Kontrollen",
        download: "Herunterladen",
        downloadTitle: "Bild herunterladen (PNG)",
        save: "Speichern",
        name: "Name",
        namePlaceholder: "Mein System",
        planetsCount: "Planeten (1–9)",
        speed: "Geschwindigkeit",
        zoom: "Zoom",
        showOrbits: "Umlaufbahnen anzeigen",
        star: "Stern",
        color: "Farbe",
        size: "Größe",
        planets: "Planeten",
        rings: "Ringe",
        ringTilt: "Neigung",
        randomize: "Zufällig",
        reset: "Zurücksetzen",
        camera: "Kamera",
        savedToast: "System gespeichert",
        loadedToast: "System geladen",
      },
    },
    apod: {
      title: "NASA Astronomiebild des Tages",
      subtitle: "Tägliche Bilder und Videos, kuratiert von der NASA.",
      error: "Das heutige Bild konnte nicht geladen werden. Bitte versuche es später erneut.",
      mediaFallback: "Dieser Inhalt kann nicht angezeigt werden.",
      noImageForDate: "Für dieses Datum wurde kein Foto gefunden.",
      dateLabel: "Datum",
      go: "Ansehen",
      minDateHint: "Keine Bilder vor dem 16.06.1995.",
      prev: "Vorheriges",
      next: "Nächstes",
      today: "Heute",
      videoBadge: "Video",
      openOriginalAria: "Originalbild öffnen",
      monthPrevAria: "Vorheriger Monat",
      monthNextAria: "Nächster Monat",
      altFallback: "APOD-Bild",
    },
    moon: {
      title: "Mondphase",
      subtitle: "Entdecke deine Mondphase, indem du deinen Geburtstag und/oder den deiner besonderen Person eingibst 🚀",
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
      note: "Visuelle Annäherung; kann je nach Ephemeriden und Zeitzone um ±1 Tag variieren.",
      phaseNames: [
        "Neumond",
        "Zunehmende Sichel",
        "Erstes Viertel",
        "Zunehmender Halbmond",
        "Vollmond",
        "Abnehmender Halbmond",
        "Letztes Viertel",
        "Abnehmende Sichel"
      ]
    },
    postcard: {
      title: "Galaktische Postkarte",
      subtitle: "Gestalte eine Karte aus dem All und schicke sie an deine Crew.",
      designHeading: "Wähle ein Skizzenmotiv",
      designDescription: "Entdecke sechs Entwürfe inspiriert von Nebeln und Orbitalstationen.",
      messageHeading: "Passe deine Nachricht an",
      messageLabel: "Nachricht",
      messagePlaceholder: "Schreibe deine kosmischen Wünsche…",
      senderLabel: "Absender",
      senderPlaceholder: "Name, der die Postkarte unterschreibt",
      photoHeading: "Foto hinzufügen",
      photoHint: "Quadratische Bilder (JPG oder PNG) funktionieren am besten.",
      photoButton: "Bild auswählen",
      photoRemove: "Foto entfernen",
      previewHeading: "Vorschau",
      previewNote: "Das Layout passt sich automatisch an die gewählte Skizze an.",
      sampleMessage: "Möge jede neue Umlaufbahn uns den Welten näherbringen, die wir zu erkunden träumen.",
      sampleSender: "MixTechDevs-Crew",
      shareHeading: "Postkarte teilen",
      shareDescription: "Erzeuge einen temporären Link, damit andere die Karte sehen können.",
      shareButton: "Link erstellen",
      shareGenerating: "Wird erstellt…",
      shareCopy: "Link kopieren",
      shareCopied: "Link kopiert!",
      shareError: "Der Link konnte nicht erstellt werden.",
      shareTooLarge: "Das Bild ist zu groß für einen temporären Link. Verwende eine kleinere Datei.",
      sharePreview: "Sende diesen Link, damit deine Crew die Karte online ansehen kann.",
      shareViewingNotice: "Du betrachtest eine geteilte Postkarte. Passe sie an und generiere anschließend einen neuen Link.",
      shareStale: "Die Postkarte wurde geändert. Erstelle einen neuen Link, um die Aktualisierung zu teilen.",
      designs: [
        {
          id: "aurora",
          name: "Polarlicht",
          description: "Smaragd- und violettfarbene Lichter rahmen deinen Text ein.",
        },
        {
          id: "supernova",
          name: "Supernova-Ausbruch",
          description: "Ein goldener Sternenblitz betont das Herz deiner Karte.",
        },
        {
          id: "orbit",
          name: "Doppelorbit",
          description: "Zwei konzentrische Bahnen umrahmen Foto und Nachricht.",
        },
        {
          id: "nebula",
          name: "Ewige Nebel",
          description: "Magenta- und Türkiswolken wirbeln um das Layout.",
        },
        {
          id: "signal",
          name: "Radarsignal",
          description: "Interplanetare Funkwellen verstärken jedes Wort.",
        },
        {
          id: "station",
          name: "Orbitalmodul",
          description: "Modulare Paneele und Minimaltypografie erinnern an eine Raumstation.",
        },
      ],
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
        "Laden Sie Ihre CSV-Datei hoch und validieren Sie Exoplaneten sofort mithilfe des von MixTechDevs erstellten Erkennungsmodells.",
    },
    analyzeUI: {
      uploadHeading: "1) CSV hochladen",
	  exampleDataset: "Beispiel-CSV verwenden",
      // Core prediction labels (added for parity with English)
      predictionDetails: "Klicke ein Element an, um Vorhersage und Wahrscheinlichkeit zu sehen.",
      confirmedProbability: "Exoplanet-Wahrscheinlichkeit",
      falsePositiveProbability: "Wahrscheinlichkeit (falsch positiv)",
      falsePositiveResult: "Falsch positiv",
      exoplanetCandidateResult: "Exoplanet-Kandidat",
      dropHint: "Ziehe deine CSV hierher oder klicke zur Auswahl",
      headersHint:
        "Die CSV-Datei muss Kopfzeilen in der ersten Zeile enthalten. Die erforderlichen Spalten sind unten aufgeführt.",
      headersExact: "Die Spaltennamen müssen genau mit den unten gezeigten Bezeichnungen übereinstimmen.",
      selectFile: "Datei wählen",
      fileInfo: { name: "Datei", rows: "Zeilen", cols: "Spalten" },
      mappingHeading: "2) Spaltenzuordnung",
      metricsHeading: "3) Metriken & Visualisierungen",
      previewHeading: "4) Vorhersagen des Erkennungsmodells",
	  predictionsDesc: "Das MixTechDevs-Modell bewertet jede CSV-Zeile und weist eine Wahrscheinlichkeit zu, ob es sich um einen Exoplaneten-Kandidaten oder ein falsch positives Ergebnis handelt.",
  // Added keys used by AnalyzeDashboard.jsx
  prediction: "Modellvorhersage",
  probability_confirmed: "Wahrscheinlichkeit (Exoplanet)",
  probability_false_positive: "Wahrscheinlichkeit (falsch positiv)",
  // action keys removed: retry/copy payload (not used in UI)
  closeButton: "Schließen",
  simulatedNotice: "Diese Vorhersage ist SIMULIERT",
  orUploadHint: "Oder lade deine eigene CSV unten hoch",
  noRowsHint: "Lade eine CSV-Datei hoch, um Ergebnisse anzuzeigen.",
  prevButton: "Zurück",
  nextButton: "Weiter",
  pageInfo: "Anzeigen {start} - {end} von {total}",
  loadingPrediction: "Vorhersage wird geladen...",
  errorLabel: "Fehler:",
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
      subtitle: "Sicherheit und Datenschutz bei jedem Schritt. Deine Informationen sind geschützt.",
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
          grid: {
            label: "Schwarzes Raster",
            description: "Isometrisches Raster auf einem grafitfarbenen Hintergrund.",
          },
          city: {
            label: "Nächtliche Stadt",
            description: "Stadtsilhouetten mit wanderndem Suchscheinwerfer.",
          },
          spectrum: {
            label: "Spectrum",
            description: "Animierte Farbwellen mit Synthwave-Flair.",
          },
          terrain: {
            label: "Fraktales Terrain",
            description: "Prozedurales Rauschen mit sanfter Beleuchtung.",
          },
          shards: {
            label: "Neon-Scherben",
            description: "Animierte diagonale Akzente auf dunklem Geflecht.",
          },
          aurora: {
            label: "Vektor-Aurora",
            description: "Mehrfarbige Lichtschleier mit sanfter Bewegung.",
          },
          futuristic: {
            label: "Futuristische Textur",
            description: "Irideszente Metallfläche mit Lichtreflexen.",
          },
          rain: {
            label: "Blaue Regenfälle",
            description: "Neonregen, der über einen dunklen Schleier fließt.",
          },
          
          neon: {
            label: "Neon-Geometrie",
            description: "Lebhaftes Vektormuster mit Magenta-Akzenten.",
          },
          prismatic: {
            label: "Prismatischer Strahl",
            description: "Farbstrahlen mit additiver Mischung.",
          },
          lightning: {
            label: "Blitz",
            description: "Stilisierte elektrische Entladungen.",
          },
          plasma: {
            label: "Plasma",
            description: "Energiegeladener, bewegter Nebel.",
          },
          galaxy: {
            label: "Galaxie",
            description: "Sternenfeld mit Glühen und Parallaxe.",
          },
          
          lightrays: {
            label: "Lichtstrahlen",
            description: "Weiche volumetrische Strahlen mit additiver Mischung.",
          },
        },
      },
      language: {
        title: "Standardsprache",
        description: "Wähle die Standardsprache der Oberfläche.",
        loading: "Einstellung wird geladen…",
        signedOut: "Mit Google anmelden, um die Sprache zu wählen.",
        statusSaving: "Speichern…",
        statusSaved: "Präferenz gespeichert",
        statusError: "Präferenz konnte nicht gespeichert werden.",
        saveError: "Versuche es später noch einmal.",
        options: { es: "Spanisch", en: "Englisch", de: "Deutsch" },
      },
    },
    userMenu: {
      settings: "Einstellungen",
      notes: "Notizen",
      reminders: "Erinnerung",
      images: "Bilder",
      signOut: "Abmelden",
    },
    notes: {
      title: "Persönliche Notizen",
      subtitle: "Halte Ideen mit Formatierungen fest und synchronisiere sie sicher.",
      titleLabel: "Titel",
      titlePlaceholder: "Vergib einen Titel für deine Notiz",
      contentLabel: "Inhalt",
      contentPlaceholder: "Schreibe deine Notiz…",
      fontSizeLabel: "Textgröße",
      fontSizes: {
        small: "Klein",
        medium: "Mittel",
        large: "Groß",
      },
      boldLabel: "Fett",
      italicLabel: "Kursiv",
      saveButton: "Notiz speichern",
      loading: "Notizen werden geladen…",
      saving: "Speichern…",
      deleting: "Löschen…",
      empty: "Du hast noch keine Notizen.",
      signedOut: "Melde dich mit Google an, um Notizen anzulegen.",
      delete: "Löschen",
      error: "Die Notiz konnte nicht gespeichert werden.",
      missingFields: "Fülle Titel und Inhalt aus.",
      previewLabel: "Vorschau",
      lastUpdated: "Zuletzt aktualisiert",
    },
    reminders: {
      title: "Erinnerungen",
      subtitle: "Behalte wichtige Aufgaben und Termine im Blick.",
      description: "Schon bald kannst du Erinnerungen planen und mit deinen Geräten synchronisieren.",
      messageLabel: "Merksatz",
      messagePlaceholder: "Was möchtest du nicht vergessen?",
      dateLabel: "Merken bis",
      dateHint: "Wähle das Datum, ab dem die Erinnerung nicht mehr nötig ist.",
      saveButton: "Erinnerung speichern",
      saving: "Speichern…",
      loading: "Erinnerungen werden geladen…",
      empty: "Du hast keine aktiven Erinnerungen.",
      signedOut: "Melde dich mit Google an, um Erinnerungen anzulegen.",
      delete: "Löschen",
      deleting: "Löschen…",
      error: "Die Erinnerung konnte nicht gespeichert werden.",
      dateError: "Wähle ein gültiges Datum.",
      lastUpdated: "Zuletzt bearbeitet",
      expiresOn: "Läuft ab",
      assistantHint: "Du hast {count} Erinnerungen.",
      assistantHintOne: "Du hast 1 Erinnerung.",
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
