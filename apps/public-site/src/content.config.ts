import { defineCollection, z } from "astro:content";

const dateValue = z.coerce.date();

const articleCollection = defineCollection({
	type: "content",
	schema: z.object({
		type: z.literal("article"),
		title: z.string().min(1),
		deck: z.string().min(1),
		summary: z.string().min(1),
		publishedAt: dateValue,
		updatedAt: dateValue.optional(),
		readMinutes: z.number().int().positive(),
		tags: z.array(z.string()).default([]),
		featured: z.boolean().default(false),
		published: z.boolean().default(true),
	}),
});

const noteCollection = defineCollection({
	type: "content",
	schema: z.object({
		type: z.literal("note"),
		publishedAt: dateValue,
		published: z.boolean().default(true),
	}),
});

const linkCollection = defineCollection({
	type: "content",
	schema: z.object({
		type: z.literal("link"),
		url: z.string().url(),
		title: z.string().min(1).optional(),
		source: z.string().min(1).optional(),
		summary: z.string().min(1).optional(),
		publishedAt: dateValue,
		published: z.boolean().default(true),
	}),
});

const snippetCollection = defineCollection({
	type: "content",
	schema: z.object({
		type: z.literal("snippet"),
		title: z.string().min(1),
		language: z.string().min(1),
		summary: z.string().min(1),
		code: z.string().min(1),
		publishedAt: dateValue,
		published: z.boolean().default(true),
	}),
});

const pageCollection = defineCollection({
	type: "content",
	schema: z.object({
		type: z.literal("page"),
		title: z.string().min(1),
		deck: z.string().min(1),
		description: z.string().min(1).optional(),
		updatedAt: dateValue.optional(),
		facts: z.array(z.tuple([z.string(), z.string()])).optional(),
		location: z.string().optional(),
		working: z.string().optional(),
		learning: z.string().optional(),
		listening: z.string().optional(),
		reading: z
			.array(
				z.object({
					title: z.string(),
					author: z.string(),
				}),
			)
			.optional(),
		focus: z.array(z.string()).optional(),
		published: z.boolean().default(true),
	}),
});

export const collections = {
	articles: articleCollection,
	notes: noteCollection,
	links: linkCollection,
	snippets: snippetCollection,
	pages: pageCollection,
};
