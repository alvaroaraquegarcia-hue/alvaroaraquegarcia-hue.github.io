/* ============================================================
   CONTENIDO DEL SITIO — Higiene Ocupacional Aplicada
   Para publicar algo nuevo, agregue una entrada al inicio
   de la lista correspondiente y suba este archivo.
   ============================================================ */

window.CONTENIDO = {

  /* Novedades: lo más reciente primero */
  novedades: [
    {
      fecha: '2026-10-21',
      titulo: 'Documentos técnicos: benceno en Oil & Gas y protección respiratoria en soldadores',
      texto: 'Dos artículos de colegas: un abordaje sistemático de la exposición ocupacional a benceno en una empresa del sector Oil & Gas (Tocaruncho Rodríguez H. et al.) y un estudio cualitativo sobre los factores que determinan el uso de protección respiratoria en soldadores de una microempresa de Bogotá (Bejarano Ochoa N. y Valderrama Sánchez H.).',
      enlace: '#documentos',
      textoEnlace: 'Ver los documentos'
    },
    {
      fecha: '2026-10-20',
      titulo: 'Nueva herramienta: NeumoRisk V1',
      texto: 'Evaluación y control del riesgo por sílice cristalina respirable, polvo de carbón y asbesto, basada en la GATI-NEUMO y en la Guía Técnica de Sílice Cristalina (Resolución 2467 de 2022). Incluye GES, estadística del muestreo, plan de control, protección respiratoria y vigilancia médica. Autores: Álvaro Araque García y Luis Guillermo Araque Muñoz.',
      enlace: 'herramientas/index.html#neumorisk',
      textoEnlace: 'Descargar NeumoRisk'
    },
    {
      fecha: '2026-09-30',
      titulo: 'WBGT Colombia versión 1.0',
      texto: 'Nueva versión de la calculadora web de estrés térmico con el modelo de Liljegren, las fórmulas de ISO 7243 y los criterios de la ACGIH. Incluye pronóstico por horas para diez ciudades y guía de uso.',
      enlace: 'https://alvaroaraquegarcia-hue.github.io/wbgt-colombia/',
      textoEnlace: 'Abrir la calculadora'
    },
    {
      fecha: '2026-09-30',
      titulo: 'Herramientas SCHO: nueve libros de cálculo con ejemplos e instructivos',
      texto: 'VaporRisk, NoiseRisk, LuxRisk y HeatStressRisk en todas sus versiones, con libro de Excel, ejemplo resuelto e instructivo técnico en PDF, de descarga gratuita.',
      enlace: 'herramientas/index.html',
      textoEnlace: 'Ver las herramientas'
    }
  ],

  /* Presentaciones grabadas: youtube = código del video (lo que va después de "v=" en el enlace) */
  videos: [
    // { fecha: '2026-10-15', titulo: 'Cómo usar VaporRisk V3', youtube: 'XXXXXXXXXXX', descripcion: 'Recorrido por la herramienta con un caso real.' },
  ],

  /* Documentos técnicos */
  documentos: [
    { titulo: 'Exposición ocupacional a benceno en una empresa del sector Oil & Gas — Tocaruncho Rodríguez H. et al.', tipo: 'PDF', enlace: 'documentos/Benceno_Oil_Gas_Tocaruncho.pdf' },
    { titulo: 'Uso de protección respiratoria en soldadores de una microempresa metalmecánica — Bejarano Ochoa N. y Valderrama Sánchez H.', tipo: 'PDF', enlace: 'documentos/EPPr_Soldadores_Bejarano_Valderrama.pdf' },
    { titulo: 'NeumoRisk V1 — Instructivo de uso', tipo: 'PDF', enlace: 'herramientas/descargas/NeumoRisk_V1_Instructivo.pdf' },
    { titulo: 'WBGT Colombia V1 — Guía de uso y fundamentos técnicos', tipo: 'PDF', enlace: 'herramientas/descargas/WBGT_Colombia_V1_Guia.pdf' },
    { titulo: 'VaporRisk V3 — Instructivo de uso', tipo: 'PDF', enlace: 'herramientas/descargas/VaporRisk_V3_Instructivo.pdf' },
    { titulo: 'NoiseRisk V2 — Instructivo de uso', tipo: 'PDF', enlace: 'herramientas/descargas/NoiseRisk_V2_Instructivo.pdf' },
    { titulo: 'LuxRisk V2 — Instructivo de uso', tipo: 'PDF', enlace: 'herramientas/descargas/LuxRisk_V2_Instructivo.pdf' },
    { titulo: 'HeatStressRisk V2 — Instructivo de uso', tipo: 'PDF', enlace: 'herramientas/descargas/HeatStressRisk_V2_Instructivo.pdf' }
  ]
};
