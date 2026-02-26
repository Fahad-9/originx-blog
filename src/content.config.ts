import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { CATEGORIES } from './consts';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().max(160),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      heroAlt: z.string().default(''),
      author: z.string().default('Fahad Khan'),
      categories: z.array(z.enum(CATEGORIES)).min(1),
      tags: z.array(z.string()).optional(),
      draft: z.boolean().default(false),
      // SEO/GEO fields
      canonicalUrl: z.string().url().optional(),
      noindex: z.boolean().default(false),
      answerCapsule: z.string().max(200).optional(),
      faq: z
        .array(
          z.object({
            question: z.string(),
            answer: z.string(),
          })
        )
        .optional(),
      // Affiliate tracking
      affiliates: z.array(z.string()).optional(),
      // Social overrides
      ogImage: z.string().optional(),
    }),
});

export const collections = { blog };
