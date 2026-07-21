export const USE_CASES = [
  {
    slug: 'programar',
    name: 'Programación',
    description: 'Escribir, revisar y depurar código',
    iconName: 'Code2',
  },
  {
    slug: 'escribir',
    name: 'Escritura y redacción',
    description: 'Textos, emails, artículos y contenido',
    iconName: 'PenLine',
  },
  {
    slug: 'crear-imagenes',
    name: 'Crear imágenes',
    description: 'Generación de imágenes y arte con IA',
    iconName: 'Image',
  },
  {
    slug: 'crear-videos',
    name: 'Crear vídeos',
    description: 'Generación y edición de vídeo con IA',
    iconName: 'Video',
  },
  {
    slug: 'traducir',
    name: 'Traducción',
    description: 'Traducción automática de textos',
    iconName: 'Languages',
  },
  {
    slug: 'analizar-datos',
    name: 'Análisis de datos',
    description: 'Procesar y extraer insights de datos',
    iconName: 'BarChart3',
  },
  {
    slug: 'presentaciones',
    name: 'Presentaciones',
    description: 'Crear diapositivas y presentaciones',
    iconName: 'Presentation',
  },
  {
    slug: 'email',
    name: 'Email y comunicación',
    description: 'Gestión y redacción de emails',
    iconName: 'Mail',
  },
  {
    slug: 'seo',
    name: 'SEO y marketing',
    description: 'Contenido y estrategia para buscadores',
    iconName: 'TrendingUp',
  },
  {
    slug: 'atencion-cliente',
    name: 'Atención al cliente',
    description: 'Chatbots y automatización de soporte',
    iconName: 'MessageSquare',
  },
  {
    slug: 'educacion',
    name: 'Educación y formación',
    description: 'Aprendizaje, tutorías y explicaciones',
    iconName: 'GraduationCap',
  },
  {
    slug: 'investigacion',
    name: 'Investigación',
    description: 'Búsqueda y síntesis de información',
    iconName: 'Search',
  },
  {
    slug: 'resumir',
    name: 'Resumir documentos',
    description: 'Síntesis de textos largos',
    iconName: 'FileText',
  },
  {
    slug: 'transcribir',
    name: 'Transcripción',
    description: 'Audio y vídeo a texto',
    iconName: 'Mic',
  },
  {
    slug: 'chatear',
    name: 'Asistente conversacional',
    description: 'Chat y asistente de uso general',
    iconName: 'Bot',
  },
  {
    slug: 'diseno',
    name: 'Diseño',
    description: 'Diseño gráfico y UI asistido por IA',
    iconName: 'Palette',
  },
  {
    slug: 'legal',
    name: 'Legal y contratos',
    description: 'Revisión y generación de documentos legales',
    iconName: 'Scale',
  },
  {
    slug: 'musica',
    name: 'Música y audio',
    description: 'Generación y composición musical con IA',
    iconName: 'Music',
  },
] as const

export type UseCaseSlug = (typeof USE_CASES)[number]['slug']
