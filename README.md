# A world away: Hunting for exoplanets with AI

Sitio web creado por MixTechDevs para contar cómo la inteligencia artificial ayuda a buscar exoplanetas. Todo el contenido gira en torno a la experiencia de navegar catálogos reales de la NASA, visualizar datos complejos y entender qué papel juega el análisis automatizado en la confirmación de mundos lejanos.

## Identidad narrativa
- **Mensaje central**: la exploración exoplanetaria está “a un mundo de distancia”, pero las herramientas de IA acercan esos descubrimientos a cualquier persona.
- **Tono**: mezcla de asombro científico y guía didáctica. Los textos cortos (hero badges, micromensajes, tooltips) evocan una misión espacial moderna.
- **Lenguajes**: español por defecto con traducciones completas en inglés y alemán, permitiendo adaptar la historia a distintos públicos.

## Recorrido principal (Página de inicio)
- **Hero cinemático (`ExoplanetHero`)**: introduce el proyecto con un llamado a cargar tus propios CSV y deja ver hints sobre métodos de detección.
- **Narrativa visual (`ChromaGrid`, `BlurText`)**: fondos animados y tipografía con efecto “cosmic neon” para reforzar el ambiente futurista.
- **Sección de métodos (`sections.methods`)**: tarjetas que explican Tránsitos, Velocidad Radial e Imagen Directa, conectando la teoría con los archivos que el visitante puede subir.
- **Widget de métricas (`ExoStats`)**: resume cuántos planetas, sistemas y candidatos templados se detectan a partir del dataset cargado.
- **Historias en cifras (`ExoSummary`)**: extrae rangos temporales, métodos líderes y planetas cercanos para contextualizar los datos de la NASA.
- **Comparador 3D (`ExoCompare`)**: muestra escalas Tierra/Júpiter vs. planeta seleccionado; el UI resalta masa, radio, temperatura y host para dimensionar hallazgos.
- **Buscador tabular (`ExoSearch`)**: tabla filtrable por método, año, masa y distancia; cada encabezado incluye microcopy educativo (p.ej. qué significa “M⊕”).

## Laboratorio de análisis (Ruta `/analizar`)
- Presenta un dashboard React (`AnalyzeDashboard.jsx`) enfocado en cargar CSV personalizados.
- Permite mapear columnas, calcular métricas clásicas de clasificación (precisión, recall, F1, accuracy) y visualizar matrices de confusión.
- Genera curvas ROC, diagramas de calibración y gráficos de barras para entender cómo respondería un modelo AI al dataset.
- Incluye simulaciones controladas para mostrar cómo se podrían etiquetar candidatos en distintos escenarios de misión.

## Módulos satélite
- **APOD (`/apod`)**: integra la Astronomy Picture of the Day; acompaña la foto con contexto de misión y navegación por fechas históricas.
- **Fase lunar (`/luna`)**: calcula iluminación y coincidencia de fechas para planificar observaciones; ofrece modo para dos personas y comparaciones visuales.
- **Equipo (`/equipo`)**: destaca roles reales del colectivo MixTechDevs, subrayando la colaboración entre ciencia, diseño e ingeniería.
- **Página 404 personalizada**: narra la idea de estar “perdido en la galaxia” y sugiere volver a explorar datos.

## Experiencia de datos y AI
- Datasets base en `public/exoplanets.csv` y `public/por_confirmar.csv`, derivados del NASA Exoplanet Archive.
- Herramientas de análisis implementadas con Chart.js + `react-chartjs-2`, complementadas con un plugin de matrices para visualizar métricas multi-clase.
- Utilidades de parsing en `src/lib/csv.js` y `papaparse` para manejar archivos grandes en el navegador.
- Contenido educativo como tooltips, leyendas y mensajes contextualizados en `src/i18n/translations.js`.

## Diseño y accesibilidad
- Layout común (`src/layouts/Layout.astro`) que inyecta el header multilingüe, footer y metadatos.
- Componentes `LanguageHeader`, `LanguageFooter` y `LanguageSwitcher` gestionan el cambio de idioma, persistiendo la preferencia vía querystring o cookie.
- Botón de “volver arriba” y loaders visibles (`StarfieldLoader`) garantizan feedback claro en páginas con muchos datos.
- Uso de “glassmorphism” en tarjetas principales para resaltar el contenido interactivo sin perder legibilidad.

## Operación técnica (resumen)
- Stack principal: Astro 5 + React 19, animaciones con `motion` y GSAP, cálculos astronómicos con `suncalc`.
- Firebase opcional: el botón `GoogleAuthButton` prepara experimentos de autenticación para sesiones personalizadas.
- Archivo `astro.config.mjs` ajusta rutas, integración React y recursos estáticos para despliegues estáticos.

### Variables de entorno
Crear `.env` con los secretos necesarios para las integraciones activas:

```ini
PUBLIC_NASA_API_KEY=YOUR_KEY          # Usa "DEMO_KEY" si no tienes uno propio (limitado)
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=
PUBLIC_FIREBASE_MEASUREMENT_ID=
```

### Ejecución local
1. Instala dependencias con `npm install`.
2. Levanta el entorno en `http://localhost:4321` usando `npm run dev`.
3. Compila la versión estática con `npm run build` y prévisualízala con `npm run preview`.
4. Regenera favicons o iconografía cuando sea necesario con `npm run icons`.

### Despliegue sugerido
- El proyecto está listo para plataformas estáticas (Vercel, Netlify). Incluye `vercel.json` para configurar rutas limpias.
- Antes de publicar, ejecuta `npm run build` y verifica el contenido del directorio `dist/`.
- Recuerda cargar los secretos (NASA/Firebase) en el proveedor para que APOD y experimentos de login funcionen.

## Créditos
- NASA Exoplanet Archive y Astronomy Picture of the Day por datos e inspiración visual.
- Comunidad open-source (Astro, React, Chart.js, Papa Parse, Three.js) por la base tecnológica.
- Equipo MixTechDevs por la narrativa, diseño y construcción de la experiencia “A world away”.

