import { z } from 'zod';

// used for both adding and renaming, since a category only has a name
export const categoryNameSchema = z.object({
  name: z
    .string({ error: 'Category name is required.' })
    .trim()
    .min(1, 'Category name is required.')
    .max(50, 'Category name is too long.'),
});

export type CategoryNameInput = z.infer<typeof categoryNameSchema>;
