/**
 * ComparaIA — Database Seed Script
 *
 * Populates the database with demo categories, tags, use cases, AI models,
 * tools, sources, articles, scores, rankings, and comparisons.
 *
 * All demo data is clearly marked with [DEMO] in description/notes fields.
 *
 * Usage:
 *   tsx scripts/seed.ts           # Upsert (safe to re-run)
 *   tsx scripts/seed.ts --force   # Delete all seeded data and re-seed
 */

import { PrismaClient, ArticleStatus, ContentType, ScoreConfidence, SourceType, ToolPricingModel } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const FORCE = process.argv.includes('--force');

// ── Helpers ────────────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function log(msg: string) {
  console.log(`[seed] ${msg}`);
}

// ── Force-delete (reverse FK order) ───────────────────────────────────────────

async function forceDelete() {
  log('--force: deleting existing seeded data...');

  await prisma.tagsOnRankings.deleteMany();
  await prisma.tagsOnComparisons.deleteMany();
  await prisma.tagsOnArticles.deleteMany();
  await prisma.modelsOnRankings.deleteMany();
  await prisma.modelsOnComparisons.deleteMany();
  await prisma.aIModelsOnArticles.deleteMany();
  await prisma.categoriesOnArticles.deleteMany();
  await prisma.categoriesOnComparisons.deleteMany();
  await prisma.categoriesOnTools.deleteMany();
  await prisma.useCasesOnTools.deleteMany();
  await prisma.editorialReview.deleteMany();
  await prisma.publicationQueue.deleteMany();
  await prisma.modelScore.deleteMany();
  await prisma.scoringCriteria.deleteMany();
  await prisma.affiliateLink.deleteMany();
  await prisma.ranking.deleteMany();
  await prisma.comparison.deleteMany();
  await prisma.article.deleteMany();
  await prisma.aITool.deleteMany();
  await prisma.aIModel.deleteMany();
  await prisma.useCase.deleteMany();
  await prisma.source.deleteMany();
  await prisma.category.deleteMany();
  await prisma.tag.deleteMany();

  log('All seeded data deleted.');
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  log(`Starting seed (force=${FORCE})`);

  if (FORCE) {
    await forceDelete();
  }

  // ── 0. Admin user ─────────────────────────────────────────────────────────────

  log('Seeding admin user...');

  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'REDACTED_DEMO_PASSWORD';
  const adminHash = bcrypt.hashSync(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: 'admin@comparaia.es' },
    update: {},
    create: {
      email: 'admin@comparaia.es',
      name: 'Admin ComparaIA',
      role: 'ADMIN',
      passwordHash: adminHash,
    },
  });

  log('  Admin: admin@comparaia.es / ' + adminPassword);
  log('  !! CHANGE PASSWORD AFTER FIRST LOGIN !!');

  // ── 1. Categories ────────────────────────────────────────────────────────────

  log('Seeding categories...');

  const categoryData = [
    { slug: 'openai', name: 'OpenAI', description: 'Modelos y herramientas de OpenAI' },
    { slug: 'anthropic', name: 'Anthropic', description: 'Modelos Claude de Anthropic' },
    { slug: 'google', name: 'Google AI', description: 'Gemini y modelos de Google' },
    { slug: 'meta', name: 'Meta AI', description: 'Llama y proyectos open source de Meta' },
    { slug: 'mistral', name: 'Mistral AI', description: 'Modelos de Mistral' },
    { slug: 'modelos', name: 'Modelos y benchmarks', description: 'Comparativas y evaluaciones' },
    { slug: 'herramientas', name: 'Herramientas', description: 'Aplicaciones y productos de IA' },
  ];

  const categories: Record<string, { id: string }> = {};
  for (const cat of categoryData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
    categories[cat.slug] = record;
  }

  log(`  ${categoryData.length} categories OK`);

  // ── 2. Tags ──────────────────────────────────────────────────────────────────

  log('Seeding tags...');

  const tagSlugs = ['chatgpt', 'claude', 'gemini', 'llama', 'benchmark', 'open-source', 'programacion', 'escritura', 'imagen', 'video'];
  const tagNameMap: Record<string, string> = {
    'chatgpt': 'ChatGPT',
    'claude': 'Claude',
    'gemini': 'Gemini',
    'llama': 'Llama',
    'benchmark': 'Benchmark',
    'open-source': 'Open Source',
    'programacion': 'Programación',
    'escritura': 'Escritura',
    'imagen': 'Imagen',
    'video': 'Video',
  };

  const tags: Record<string, { id: string }> = {};
  for (const slug of tagSlugs) {
    const record = await prisma.tag.upsert({
      where: { slug },
      update: { name: tagNameMap[slug] },
      create: { slug, name: tagNameMap[slug] },
    });
    tags[slug] = record;
  }

  log(`  ${tagSlugs.length} tags OK`);

  // ── 3. Sources ───────────────────────────────────────────────────────────────

  log('Seeding sources...');

  const sourcesData = [
    { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', type: SourceType.RSS },
    { name: 'The Verge AI', url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml', type: SourceType.RSS },
    { name: 'Xataka', url: 'https://feeds.weblogssl.com/xataka/all', type: SourceType.RSS },
  ];

  const sources: Record<string, { id: string }> = {};
  for (const src of sourcesData) {
    const record = await prisma.source.upsert({
      where: { url: src.url },
      update: { name: src.name, type: src.type },
      create: src,
    });
    sources[src.name] = record;
  }

  log(`  ${sourcesData.length} sources OK`);

  // ── 4. Use Cases + Scoring Criteria ─────────────────────────────────────────

  log('Seeding use cases and scoring criteria...');

  const useCasesData = [
    {
      slug: 'programar',
      name: 'Programación',
      description: 'Evaluación de modelos para tareas de desarrollo de software y generación de código.',
      iconName: 'Code2',
      criteria: [
        { slug: 'precision-codigo', name: 'Precisión en código', description: 'Exactitud y calidad del código generado por el modelo.', weight: 0.30, higherIsBetter: true, minValue: 0, maxValue: 10 },
        { slug: 'ventana-contexto', name: 'Ventana de contexto', description: 'Cantidad máxima de tokens que el modelo puede procesar en una sola petición.', weight: 0.15, unit: 'tokens', minValue: 4096, maxValue: 1000000, higherIsBetter: true },
        { slug: 'velocidad', name: 'Velocidad de respuesta', description: 'Número de tokens generados por segundo.', weight: 0.10, unit: 'tokens/s', minValue: 10, maxValue: 200, higherIsBetter: true },
        { slug: 'precio', name: 'Precio por uso', description: 'Coste de uso por millón de tokens de entrada+salida.', weight: 0.25, unit: 'EUR/1M tokens', minValue: 0, maxValue: 30, higherIsBetter: false },
        { slug: 'integracion-ide', name: 'Integración con IDEs', description: 'Disponibilidad de plugins y extensiones para entornos de desarrollo.', weight: 0.20, higherIsBetter: true, minValue: 0, maxValue: 10 },
      ],
    },
    {
      slug: 'escribir',
      name: 'Escritura y redacción',
      description: 'Evaluación de modelos para redacción de textos, artículos y contenido creativo.',
      iconName: 'PenLine',
      criteria: [
        { slug: 'calidad-prosa', name: 'Calidad de prosa', description: 'Naturalidad, coherencia y calidad literaria del texto generado.', weight: 0.35, minValue: 0, maxValue: 10, higherIsBetter: true },
        { slug: 'instrucciones', name: 'Seguimiento de instrucciones', description: 'Capacidad del modelo para seguir instrucciones complejas con precisión.', weight: 0.25, minValue: 0, maxValue: 10, higherIsBetter: true },
        { slug: 'idiomas', name: 'Soporte de idiomas', description: 'Calidad de generación en múltiples idiomas, especialmente español.', weight: 0.20, minValue: 0, maxValue: 10, higherIsBetter: true },
        { slug: 'precio', name: 'Precio', description: 'Coste de uso por millón de tokens.', weight: 0.10, unit: 'EUR/1M tokens', minValue: 0, maxValue: 30, higherIsBetter: false },
        { slug: 'velocidad', name: 'Velocidad', description: 'Número de tokens generados por segundo.', weight: 0.10, unit: 'tokens/s', minValue: 10, maxValue: 200, higherIsBetter: true },
      ],
    },
    {
      slug: 'crear-imagenes',
      name: 'Crear imágenes',
      description: 'Evaluación de herramientas de generación de imágenes por IA.',
      iconName: 'Image',
      criteria: [
        { slug: 'calidad', name: 'Calidad visual', description: 'Resolución, detalle y realismo de las imágenes generadas.', weight: 0.35, minValue: 0, maxValue: 10, higherIsBetter: true },
        { slug: 'consistencia', name: 'Consistencia estética', description: 'Coherencia visual y fidelidad al prompt proporcionado.', weight: 0.20, minValue: 0, maxValue: 10, higherIsBetter: true },
        { slug: 'velocidad', name: 'Velocidad generación', description: 'Tiempo de generación de una imagen en segundos.', weight: 0.15, unit: 's/imagen', minValue: 2, maxValue: 60, higherIsBetter: false },
        { slug: 'precio', name: 'Precio por imagen', description: 'Coste por imagen generada en euros.', weight: 0.20, unit: 'EUR/imagen', minValue: 0, maxValue: 0.10, higherIsBetter: false },
        { slug: 'seguridad', name: 'Filtros de seguridad', description: 'Robustez y fiabilidad de los filtros de contenido.', weight: 0.10, minValue: 0, maxValue: 10, higherIsBetter: true },
      ],
    },
    {
      slug: 'analizar-datos',
      name: 'Análisis de datos',
      description: 'Evaluación de modelos para análisis estadístico, matemático y de conjuntos de datos.',
      iconName: 'BarChart2',
      criteria: [
        { slug: 'razonamiento', name: 'Razonamiento matemático', description: 'Capacidad para resolver problemas matemáticos y estadísticos complejos.', weight: 0.35, minValue: 0, maxValue: 10, higherIsBetter: true },
        { slug: 'precision-codigo', name: 'Precisión en código', description: 'Calidad del código de análisis (Python, R, SQL) generado.', weight: 0.25, minValue: 0, maxValue: 10, higherIsBetter: true },
        { slug: 'contexto', name: 'Ventana de contexto', description: 'Capacidad para procesar datasets grandes en una sola consulta.', weight: 0.20, unit: 'tokens', minValue: 4096, maxValue: 1000000, higherIsBetter: true },
        { slug: 'precio', name: 'Precio', description: 'Coste de uso por millón de tokens.', weight: 0.10, unit: 'EUR/1M tokens', minValue: 0, maxValue: 30, higherIsBetter: false },
        { slug: 'velocidad', name: 'Velocidad', description: 'Número de tokens generados por segundo.', weight: 0.10, unit: 'tokens/s', minValue: 10, maxValue: 200, higherIsBetter: true },
      ],
    },
    {
      slug: 'chatear',
      name: 'Asistente conversacional',
      description: 'Evaluación de modelos para uso general como asistente de chat y tareas cotidianas.',
      iconName: 'MessageSquare',
      criteria: [
        { slug: 'calidad-respuesta', name: 'Calidad de respuesta', description: 'Relevancia, precisión y utilidad de las respuestas generadas.', weight: 0.35, minValue: 0, maxValue: 10, higherIsBetter: true },
        { slug: 'instrucciones', name: 'Seguimiento de instrucciones', description: 'Capacidad para seguir instrucciones complejas y mantener el rol asignado.', weight: 0.20, minValue: 0, maxValue: 10, higherIsBetter: true },
        { slug: 'memoria', name: 'Memoria contextual', description: 'Capacidad para recordar y usar información del contexto de la conversación.', weight: 0.15, minValue: 0, maxValue: 10, higherIsBetter: true },
        { slug: 'precio', name: 'Precio', description: 'Coste de uso por millón de tokens.', weight: 0.20, unit: 'EUR/1M tokens', minValue: 0, maxValue: 30, higherIsBetter: false },
        { slug: 'velocidad', name: 'Velocidad', description: 'Número de tokens generados por segundo.', weight: 0.10, unit: 'tokens/s', minValue: 10, maxValue: 200, higherIsBetter: true },
      ],
    },
    {
      slug: 'investigacion',
      name: 'Investigación',
      description: 'Evaluación de modelos para investigación, síntesis de información y búsqueda web.',
      iconName: 'Search',
      criteria: [
        { slug: 'precision-factual', name: 'Precisión factual', description: 'Exactitud de los hechos y datos proporcionados por el modelo.', weight: 0.35, minValue: 0, maxValue: 10, higherIsBetter: true },
        { slug: 'busqueda-web', name: 'Búsqueda web integrada', description: 'Calidad y profundidad de la integración con búsqueda web en tiempo real.', weight: 0.25, minValue: 0, maxValue: 10, higherIsBetter: true },
        { slug: 'contexto', name: 'Ventana de contexto', description: 'Capacidad para procesar documentos largos y múltiples fuentes.', weight: 0.20, minValue: 0, maxValue: 10, higherIsBetter: true },
        { slug: 'precio', name: 'Precio', description: 'Coste de uso por millón de tokens.', weight: 0.10, unit: 'EUR/1M tokens', minValue: 0, maxValue: 30, higherIsBetter: false },
        { slug: 'velocidad', name: 'Velocidad', description: 'Velocidad de respuesta y síntesis de información.', weight: 0.10, minValue: 0, maxValue: 10, higherIsBetter: true },
      ],
    },
  ];

  const useCases: Record<string, { id: string }> = {};
  const criteriaMap: Record<string, Record<string, { id: string }>> = {};

  for (const uc of useCasesData) {
    const { criteria, ...ucFields } = uc;

    const ucRecord = await prisma.useCase.upsert({
      where: { slug: ucFields.slug },
      update: { name: ucFields.name, description: ucFields.description, iconName: ucFields.iconName },
      create: ucFields,
    });
    useCases[ucFields.slug] = ucRecord;
    criteriaMap[ucFields.slug] = {};

    for (const c of criteria) {
      const cRecord = await prisma.scoringCriteria.upsert({
        where: { useCaseId_slug: { useCaseId: ucRecord.id, slug: c.slug } },
        update: {
          name: c.name,
          description: c.description,
          weight: c.weight,
          unit: c.unit ?? null,
          higherIsBetter: c.higherIsBetter ?? true,
          minValue: c.minValue ?? null,
          maxValue: c.maxValue ?? null,
        },
        create: {
          useCaseId: ucRecord.id,
          slug: c.slug,
          name: c.name,
          description: c.description,
          weight: c.weight,
          unit: c.unit ?? null,
          higherIsBetter: c.higherIsBetter ?? true,
          minValue: c.minValue ?? null,
          maxValue: c.maxValue ?? null,
        },
      });
      criteriaMap[ucFields.slug][c.slug] = cRecord;
    }
  }

  log(`  ${useCasesData.length} use cases with criteria OK`);

  // ── 5. AI Models ─────────────────────────────────────────────────────────────

  log('Seeding AI models...');

  const modelsData = [
    {
      slug: 'gpt-4o',
      name: 'GPT-4o',
      developer: 'OpenAI',
      version: '2024-05',
      contextWindow: 128000,
      supportsVision: true,
      supportsTools: true,
      supportsCode: true,
      description: '[DEMO] Modelo multimodal de OpenAI con soporte de visión, herramientas y generación de código.',
    },
    {
      slug: 'claude-35-sonnet',
      name: 'Claude 3.5 Sonnet',
      developer: 'Anthropic',
      version: '20241022',
      contextWindow: 200000,
      supportsVision: true,
      supportsTools: true,
      supportsCode: true,
      description: '[DEMO] Claude 3.5 Sonnet de Anthropic. Excelente en escritura, análisis y código.',
    },
    {
      slug: 'gemini-15-pro',
      name: 'Gemini 1.5 Pro',
      developer: 'Google',
      version: '001',
      contextWindow: 2000000,
      supportsVision: true,
      supportsTools: true,
      supportsCode: true,
      description: '[DEMO] Modelo multimodal de Google con contexto de hasta 2M tokens.',
    },
    {
      slug: 'llama-31-405b',
      name: 'Llama 3.1 405B',
      developer: 'Meta',
      version: '405B-Instruct',
      contextWindow: 128000,
      supportsVision: false,
      supportsTools: false,
      supportsCode: true,
      description: '[DEMO] Modelo open source más grande de Meta. Disponible para despliegue propio.',
    },
    {
      slug: 'mistral-large',
      name: 'Mistral Large 2',
      developer: 'Mistral AI',
      version: '2407',
      contextWindow: 128000,
      supportsVision: false,
      supportsTools: true,
      supportsCode: true,
      description: '[DEMO] Modelo de Mistral AI con excelente rendimiento en código y razonamiento.',
    },
    {
      slug: 'grok-2',
      name: 'Grok-2',
      developer: 'xAI',
      version: '2024',
      contextWindow: 131072,
      supportsVision: true,
      supportsTools: false,
      supportsCode: false,
      description: '[DEMO] Modelo de xAI con acceso a datos en tiempo real de X (Twitter).',
    },
    {
      slug: 'o3-mini',
      name: 'o3-mini',
      developer: 'OpenAI',
      version: '2025-01',
      contextWindow: 128000,
      supportsVision: false,
      supportsTools: false,
      supportsCode: true,
      description: '[DEMO] Modelo de razonamiento de OpenAI. Especializado en matemáticas y programación.',
    },
    {
      slug: 'gemini-20-flash',
      name: 'Gemini 2.0 Flash',
      developer: 'Google',
      version: '001',
      contextWindow: 1048576,
      supportsVision: true,
      supportsTools: true,
      supportsCode: false,
      description: '[DEMO] Versión rápida y económica de Gemini 2.0.',
    },
  ];

  const models: Record<string, { id: string }> = {};
  for (const m of modelsData) {
    const record = await prisma.aIModel.upsert({
      where: { slug: m.slug },
      update: m,
      create: m,
    });
    models[m.slug] = record;
  }

  log(`  ${modelsData.length} AI models OK`);

  // ── 6. AI Tools ──────────────────────────────────────────────────────────────

  log('Seeding AI tools...');

  const toolsData = [
    {
      slug: 'chatgpt',
      name: 'ChatGPT',
      tagline: "OpenAI's flagship chat interface",
      description: '[DEMO] Interfaz de chat principal de OpenAI, con acceso a GPT-4o y plugins.',
      pricingModel: ToolPricingModel.FREEMIUM,
      startingPrice: 20,
      hasFreeplan: true,
      modelSlug: 'gpt-4o',
    },
    {
      slug: 'claude-ai',
      name: 'Claude.ai',
      tagline: 'Interfaz oficial de Claude de Anthropic',
      description: '[DEMO] Asistente de IA de Anthropic basado en Claude 3.5 Sonnet.',
      pricingModel: ToolPricingModel.FREEMIUM,
      startingPrice: 20,
      hasFreeplan: true,
      modelSlug: 'claude-35-sonnet',
    },
    {
      slug: 'gemini-google',
      name: 'Google Gemini',
      tagline: 'Asistente de IA de Google',
      description: '[DEMO] Asistente de IA de Google integrado con búsqueda y servicios de Google Workspace.',
      pricingModel: ToolPricingModel.FREEMIUM,
      startingPrice: 19.99,
      hasFreeplan: true,
      modelSlug: 'gemini-15-pro',
    },
    {
      slug: 'copilot-microsoft',
      name: 'Microsoft Copilot',
      tagline: 'IA integrada en productos Microsoft',
      description: '[DEMO] Asistente de IA de Microsoft integrado en Office 365, Teams y Windows.',
      pricingModel: ToolPricingModel.FREEMIUM,
      startingPrice: 30,
      hasFreeplan: true,
      modelSlug: null,
    },
  ];

  const tools: Record<string, { id: string }> = {};
  for (const t of toolsData) {
    const { modelSlug, ...toolFields } = t;
    const modelId = modelSlug ? models[modelSlug]?.id ?? null : null;

    const record = await prisma.aITool.upsert({
      where: { slug: toolFields.slug },
      update: { ...toolFields, modelId },
      create: { ...toolFields, modelId },
    });
    tools[t.slug] = record;
  }

  log(`  ${toolsData.length} AI tools OK`);

  // ── 7. Articles ──────────────────────────────────────────────────────────────

  log('Seeding articles...');

  const article1Body = `<p>[DEMO] ComparaIA, la nueva plataforma española de comparación de modelos de inteligencia artificial, ha lanzado hoy su comparador interactivo que permite a usuarios y desarrolladores evaluar los principales modelos de IA según sus necesidades específicas.</p>

<h2>¿Qué es ComparaIA?</h2>
<p>ComparaIA es una herramienta diseñada para simplificar la elección del modelo de IA más adecuado para cada caso de uso. La plataforma ofrece comparativas detalladas basadas en criterios objetivos como precisión, velocidad, precio y capacidades específicas.</p>

<h2>Casos de uso cubiertos</h2>
<p>En su lanzamiento, la plataforma cubre seis casos de uso principales: programación, escritura, creación de imágenes, análisis de datos, asistencia conversacional e investigación.</p>
<p>Cada caso de uso incluye criterios de evaluación ponderados específicamente para ese ámbito, permitiendo una comparación justa y relevante entre los diferentes modelos disponibles en el mercado.</p>

<h2>Modelos incluidos</h2>
<p>La plataforma incluye actualmente ocho modelos de los principales proveedores: OpenAI (GPT-4o, o3-mini), Anthropic (Claude 3.5 Sonnet), Google (Gemini 1.5 Pro, Gemini 2.0 Flash), Meta (Llama 3.1 405B), Mistral AI (Mistral Large 2) y xAI (Grok-2).</p>

<h2>Metodología de puntuación</h2>
<p>Las puntuaciones se basan en tres niveles de confianza: VERIFIED (verificado con fuentes primarias), COMMUNITY (contribución comunitaria revisada) y ESTIMATED (estimación del equipo editorial). Todas las puntuaciones incluyen la fuente y la fecha de actualización.</p>

<p><em>Nota: Este artículo es contenido de demostración generado para ilustrar las capacidades de la plataforma ComparaIA. Los datos y puntuaciones mostrados son estimaciones y deben ser verificados antes de tomar decisiones.</em></p>`;

  const article2Body = `<p>[DEMO] En este análisis exhaustivo comparamos GPT-4o de OpenAI y Claude 3.5 Sonnet de Anthropic en tareas reales de programación, evaluando rendimiento, velocidad, precio y capacidades técnicas avanzadas.</p>

<h2>Metodología</h2>
<p>Hemos evaluado ambos modelos en un conjunto de 50 tareas de programación que incluyen: generación de código desde cero, debugging, refactorización, documentación y preguntas de arquitectura de software.</p>

<h2>GPT-4o: puntos fuertes</h2>
<p>GPT-4o destaca especialmente en la integración con herramientas de desarrollo y en la generación de código Python y JavaScript. Su ventana de contexto de 128K tokens es suficiente para la mayoría de proyectos medianos.</p>

<h2>Claude 3.5 Sonnet: puntos fuertes</h2>
<p>Claude 3.5 Sonnet sobresale en la comprensión de instrucciones complejas y en la calidad general del código generado. Su ventana de contexto de 200K tokens le da ventaja en proyectos con codebases extensas.</p>

<h2>Veredicto</h2>
<p>Para programación del día a día, ambos modelos ofrecen un rendimiento excepcional. Claude 3.5 Sonnet tiene una ligera ventaja en calidad de código, mientras que GPT-4o destaca en integración con el ecosistema de herramientas de desarrollo.</p>

<p><em>[DEMO] Contenido de demostración. Las puntuaciones y análisis son estimaciones para ilustrar las capacidades de la plataforma.</em></p>`;

  const article3Body = `<p>[DEMO] Seleccionamos las cinco mejores inteligencias artificiales para desarrolladores en 2025, basándonos en criterios objetivos de rendimiento, precio, velocidad e integración con herramientas de desarrollo.</p>

<h2>1. Claude 3.5 Sonnet (Anthropic)</h2>
<p>El mejor modelo general para programación. Destaca en comprensión de instrucciones complejas y calidad del código generado. Ventana de contexto de 200K tokens ideal para proyectos grandes.</p>

<h2>2. GPT-4o (OpenAI)</h2>
<p>La opción más versátil. Excelente integración con el ecosistema de herramientas de OpenAI, Cursor y GitHub Copilot. Ideal para equipos ya integrados en el ecosistema de Microsoft/OpenAI.</p>

<h2>3. Gemini 1.5 Pro (Google)</h2>
<p>El campeón en ventana de contexto con 2M tokens. Perfecto para analizar codebases completas o documentación extensa. Buen rendimiento en código Python y análisis de datos.</p>

<h2>4. o3-mini (OpenAI)</h2>
<p>El modelo de razonamiento más preciso para matemáticas y algoritmos complejos. Ideal para problemas de programación competitiva, optimización y lógica formal.</p>

<h2>5. Mistral Large 2 (Mistral AI)</h2>
<p>La mejor opción precio-rendimiento para equipos con presupuesto limitado. Excelente en código y disponible también en modo auto-hospedado para mayor privacidad.</p>

<p><em>[DEMO] Ranking de demostración. Las posiciones y puntuaciones son estimaciones para ilustrar las capacidades de la plataforma ComparaIA.</em></p>`;

  const articlesData = [
    {
      slug: '2025-01-comparaia-lanza-comparador-ia',
      title: 'ComparaIA lanza su comparador interactivo de modelos de IA',
      excerpt: '[DEMO] Nuevo comparador interactivo que permite evaluar los principales modelos de IA según casos de uso específicos como programación, escritura o análisis de datos.',
      body: article1Body,
      contentType: ContentType.NEWS,
      status: ArticleStatus.PUBLISHED,
      publishedAt: daysAgo(7),
      keyPoints: [
        'Plataforma española de comparación de modelos de IA',
        'Seis casos de uso cubiertos en el lanzamiento',
        'Ocho modelos de los principales proveedores',
        'Metodología de puntuación transparente con tres niveles de confianza',
      ],
    },
    {
      slug: '2025-01-gpt4o-vs-claude-35-programacion',
      title: 'GPT-4o vs Claude 3.5 Sonnet: ¿cuál programa mejor en 2025?',
      excerpt: '[DEMO] Análisis exhaustivo de GPT-4o y Claude 3.5 Sonnet en 50 tareas de programación reales. Comparamos rendimiento, velocidad, precio y capacidades técnicas.',
      body: article2Body,
      contentType: ContentType.COMPARISON,
      status: ArticleStatus.PUBLISHED,
      publishedAt: daysAgo(3),
      keyPoints: [
        'Evaluación en 50 tareas reales de programación',
        'Claude 3.5 Sonnet con ventaja en calidad de código',
        'GPT-4o destaca en integración con herramientas',
        'Análisis de precio/rendimiento incluido',
      ],
    },
    {
      slug: '2025-01-mejores-ias-programar',
      title: 'Las 5 mejores IAs para programar en 2025',
      excerpt: '[DEMO] Ranking actualizado de los mejores modelos de inteligencia artificial para desarrollo de software. Claude 3.5 Sonnet lidera seguido de GPT-4o y Gemini 1.5 Pro.',
      body: article3Body,
      contentType: ContentType.RANKING,
      status: ArticleStatus.PUBLISHED,
      publishedAt: daysAgo(1),
      keyPoints: [
        'Claude 3.5 Sonnet: mejor rendimiento general en código',
        'GPT-4o: mejor integración con ecosistema de herramientas',
        'Gemini 1.5 Pro: máxima ventana de contexto (2M tokens)',
        'Mistral Large 2: mejor relación precio/rendimiento',
      ],
    },
  ];

  const articles: Record<string, { id: string }> = {};
  for (const a of articlesData) {
    const record = await prisma.article.upsert({
      where: { slug: a.slug },
      update: a,
      create: a,
    });
    articles[a.slug] = record;
  }

  log(`  ${articlesData.length} articles OK`);

  // ── 8. Model Scores (ESTIMATED, programar use case) ──────────────────────────

  log('Seeding model scores (programar use case, ESTIMATED confidence)...');

  const programarCriteria = criteriaMap['programar'];
  const programarUseCaseId = useCases['programar'].id;
  const scoreDate = new Date();
  const DEMO_NOTE = '[DEMO] Puntuación estimada para demostración. Revisar y actualizar con datos reales.';
  const SOURCE_URL = 'https://comparaia.es/metodologia';

  const scoreRows: Array<{
    modelSlug: string;
    criteriaSlug: string;
    rawValue: number | null;
    normalizedScore: number;
  }> = [
    // GPT-4o
    { modelSlug: 'gpt-4o', criteriaSlug: 'precision-codigo', rawValue: 8.5, normalizedScore: 8.5 },
    { modelSlug: 'gpt-4o', criteriaSlug: 'ventana-contexto', rawValue: 128000, normalizedScore: 7.0 },
    { modelSlug: 'gpt-4o', criteriaSlug: 'velocidad', rawValue: 80, normalizedScore: 7.5 },
    { modelSlug: 'gpt-4o', criteriaSlug: 'precio', rawValue: 7.5, normalizedScore: 7.0 },
    { modelSlug: 'gpt-4o', criteriaSlug: 'integracion-ide', rawValue: 8.0, normalizedScore: 8.0 },

    // Claude 3.5 Sonnet
    { modelSlug: 'claude-35-sonnet', criteriaSlug: 'precision-codigo', rawValue: 8.7, normalizedScore: 8.7 },
    { modelSlug: 'claude-35-sonnet', criteriaSlug: 'ventana-contexto', rawValue: 200000, normalizedScore: 8.0 },
    { modelSlug: 'claude-35-sonnet', criteriaSlug: 'velocidad', rawValue: 70, normalizedScore: 7.0 },
    { modelSlug: 'claude-35-sonnet', criteriaSlug: 'precio', rawValue: 9.0, normalizedScore: 7.2 },
    { modelSlug: 'claude-35-sonnet', criteriaSlug: 'integracion-ide', rawValue: 7.5, normalizedScore: 7.5 },

    // Gemini 1.5 Pro
    { modelSlug: 'gemini-15-pro', criteriaSlug: 'precision-codigo', rawValue: 7.8, normalizedScore: 7.8 },
    { modelSlug: 'gemini-15-pro', criteriaSlug: 'ventana-contexto', rawValue: 2000000, normalizedScore: 9.0 },
    { modelSlug: 'gemini-15-pro', criteriaSlug: 'velocidad', rawValue: 65, normalizedScore: 6.5 },
    { modelSlug: 'gemini-15-pro', criteriaSlug: 'precio', rawValue: 7.0, normalizedScore: 7.5 },
    { modelSlug: 'gemini-15-pro', criteriaSlug: 'integracion-ide', rawValue: 7.0, normalizedScore: 7.0 },
  ];

  for (const row of scoreRows) {
    const modelId = models[row.modelSlug].id;
    const criteriaId = programarCriteria[row.criteriaSlug].id;

    await prisma.modelScore.upsert({
      where: { modelId_useCaseId_criteriaId: { modelId, useCaseId: programarUseCaseId, criteriaId } },
      update: {
        rawValue: row.rawValue,
        normalizedScore: row.normalizedScore,
        confidence: ScoreConfidence.ESTIMATED,
        sourceUrl: SOURCE_URL,
        sourceDate: scoreDate,
        notes: DEMO_NOTE,
      },
      create: {
        modelId,
        useCaseId: programarUseCaseId,
        criteriaId,
        rawValue: row.rawValue,
        normalizedScore: row.normalizedScore,
        confidence: ScoreConfidence.ESTIMATED,
        sourceUrl: SOURCE_URL,
        sourceDate: scoreDate,
        notes: DEMO_NOTE,
      },
    });
  }

  log(`  ${scoreRows.length} model scores OK`);

  // ── 9. Ranking ───────────────────────────────────────────────────────────────

  log('Seeding ranking...');

  const rankingBody = `<p>[DEMO] Ranking de los mejores modelos de IA para desarrollo de software en 2025, basado en criterios objetivos de precisión de código, ventana de contexto, velocidad, precio e integración con IDEs.</p>

<h2>Metodología</h2>
<p>Las puntuaciones se calculan ponderando cinco criterios: precisión en código (30%), precio (25%), integración con IDEs (20%), ventana de contexto (15%) y velocidad (10%). Todas las puntuaciones son estimaciones actualizadas periódicamente.</p>

<p><em>[DEMO] Ranking de demostración. Actualizado con datos estimados pendientes de verificación.</em></p>`;

  const ranking = await prisma.ranking.upsert({
    where: { slug: 'mejores-ias-programar-2025' },
    update: {
      title: 'Mejores IAs para programar en 2025',
      excerpt: '[DEMO] Ranking de los mejores modelos de IA para desarrollo de software, basado en precisión de código, precio, velocidad e integración con IDEs.',
      body: rankingBody,
      useCaseId: programarUseCaseId,
      publishedAt: daysAgo(1),
    },
    create: {
      slug: 'mejores-ias-programar-2025',
      title: 'Mejores IAs para programar en 2025',
      excerpt: '[DEMO] Ranking de los mejores modelos de IA para desarrollo de software, basado en precisión de código, precio, velocidad e integración con IDEs.',
      body: rankingBody,
      useCaseId: programarUseCaseId,
      publishedAt: daysAgo(1),
    },
  });

  // ModelsOnRankings
  const rankingModels = [
    { modelSlug: 'gpt-4o', position: 1, totalScore: 87.5 },
    { modelSlug: 'claude-35-sonnet', position: 2, totalScore: 85.2 },
    { modelSlug: 'gemini-15-pro', position: 3, totalScore: 79.3 },
  ];

  for (const rm of rankingModels) {
    await prisma.modelsOnRankings.upsert({
      where: { rankingId_modelId: { rankingId: ranking.id, modelId: models[rm.modelSlug].id } },
      update: { position: rm.position, totalScore: rm.totalScore },
      create: {
        rankingId: ranking.id,
        modelId: models[rm.modelSlug].id,
        position: rm.position,
        totalScore: rm.totalScore,
      },
    });
  }

  log(`  1 ranking with ${rankingModels.length} models OK`);

  // ── 10. Comparison ───────────────────────────────────────────────────────────

  log('Seeding comparison...');

  const comparisonBody = `<p>[DEMO] Comparativa exhaustiva entre GPT-4o de OpenAI y Claude 3.5 Sonnet de Anthropic, los dos modelos más utilizados en 2025 para tareas de productividad y desarrollo.</p>

<h2>Resumen ejecutivo</h2>
<p>Ambos modelos ofrecen un rendimiento excepcional en la mayoría de tareas. Claude 3.5 Sonnet tiene ventaja en precisión de código y ventana de contexto, mientras que GPT-4o destaca en integración con herramientas y velocidad de respuesta.</p>

<p><em>[DEMO] Contenido de demostración para la plataforma ComparaIA. Datos estimados pendientes de verificación.</em></p>`;

  const comparison = await prisma.comparison.upsert({
    where: { slug: 'gpt-4o-vs-claude-35-sonnet' },
    update: {
      title: 'GPT-4o vs Claude 3.5 Sonnet: comparativa completa 2025',
      excerpt: '[DEMO] Comparativa completa entre GPT-4o y Claude 3.5 Sonnet en programación, escritura, análisis y uso general. ¿Cuál es el mejor modelo de IA en 2025?',
      body: comparisonBody,
      publishedAt: daysAgo(3),
    },
    create: {
      slug: 'gpt-4o-vs-claude-35-sonnet',
      title: 'GPT-4o vs Claude 3.5 Sonnet: comparativa completa 2025',
      excerpt: '[DEMO] Comparativa completa entre GPT-4o y Claude 3.5 Sonnet en programación, escritura, análisis y uso general. ¿Cuál es el mejor modelo de IA en 2025?',
      body: comparisonBody,
      publishedAt: daysAgo(3),
    },
  });

  // ModelsOnComparisons
  await prisma.modelsOnComparisons.upsert({
    where: { comparisonId_modelId: { comparisonId: comparison.id, modelId: models['gpt-4o'].id } },
    update: { displayOrder: 0 },
    create: { comparisonId: comparison.id, modelId: models['gpt-4o'].id, displayOrder: 0 },
  });
  await prisma.modelsOnComparisons.upsert({
    where: { comparisonId_modelId: { comparisonId: comparison.id, modelId: models['claude-35-sonnet'].id } },
    update: { displayOrder: 1 },
    create: { comparisonId: comparison.id, modelId: models['claude-35-sonnet'].id, displayOrder: 1 },
  });

  log('  1 comparison with 2 models OK');

  // ── Done ─────────────────────────────────────────────────────────────────────

  log('Seed complete.');
  log('  Categories:       ' + categoryData.length);
  log('  Tags:             ' + tagSlugs.length);
  log('  Sources:          ' + sourcesData.length);
  log('  Use cases:        ' + useCasesData.length);
  log('  AI models:        ' + modelsData.length);
  log('  AI tools:         ' + toolsData.length);
  log('  Articles:         ' + articlesData.length);
  log('  Model scores:     ' + scoreRows.length);
  log('  Rankings:         1');
  log('  Comparisons:      1');
}

main()
  .catch((err) => {
    console.error('[seed] Fatal error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
