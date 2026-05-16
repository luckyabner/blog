import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const issueContentSchema = z.object({
	title: z.string(),
	slug: z.string().optional(),
	date: z.coerce.date().optional(),
	pubDate: z.coerce.date().optional(),
	updatedDate: z.coerce.date().optional(),
	description: z.string().optional(),
	summary: z.string().optional(),
	issueNumber: z.number().int().optional(),
	url: z.string().url().optional(),
	labels: z.array(z.string()).default([]),
	pinned: z.boolean().default(false),
	hidden: z.boolean().default(false),
});

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		issueContentSchema.extend({
			heroImage: z.optional(image()),
		}),
});

const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
	schema: issueContentSchema,
});

const pages = defineCollection({
	loader: glob({ base: './src/content/pages', pattern: '**/*.{md,mdx}' }),
	schema: issueContentSchema,
});

export const collections = { blog, projects, pages };
