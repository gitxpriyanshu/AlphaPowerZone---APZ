import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5),
    title: z.string().max(100).optional(),
    body: z.string().min(10, 'Review must be at least 10 characters').max(1000).optional(),
    images: z.array(z.string().url()).optional(),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5).optional(),
    title: z.string().max(100).optional(),
    body: z.string().min(10).max(1000).optional(),
    images: z.array(z.string().url()).optional(),
  }),
});
