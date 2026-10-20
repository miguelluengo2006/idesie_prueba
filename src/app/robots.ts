import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/** Rastreadores de asistentes y buscadores de IA: se permiten expresamente para que puedan citar y recomendar la web. */
const AI_CRAWLERS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', // OpenAI / ChatGPT
  'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai', // Anthropic / Claude
  'PerplexityBot', 'Perplexity-User', // Perplexity
  'Google-Extended', 'Applebot-Extended', // Gemini y Apple Intelligence
  'CCBot', 'Bytespider', 'Amazonbot', 'meta-externalagent', 'cohere-ai', 'DuckAssistBot', 'MistralAI-User',
];

// El panel interno no se menciona aquí a propósito: está oculto y ya responde 404 sin el enlace de acceso.
const PRIVATE = ['/api/', '/checkout', '/pedido/', '/carrito'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      { userAgent: AI_CRAWLERS, allow: '/', disallow: PRIVATE },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
