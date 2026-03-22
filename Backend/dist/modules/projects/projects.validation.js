import { z } from 'zod';
import { paginationQuerySchema } from '../../utils/pagination.js';
export const createProjectSchema = z.object({
    name: z.string().min(2),
    dueDate: z
        .string()
        .datetime()
        .transform((v) => new Date(v))
        .optional(),
});
export const updateProjectSchema = z.object({
    name: z.string().min(2).optional(),
    status: z.enum(['active', 'archived']).optional(),
    dueDate: z
        .union([z.string().datetime(), z.null()])
        .transform((v) => (v === null ? null : new Date(v)))
        .optional(),
});
export const projectIdParams = z.object({
    id: z.string().min(1),
});
export const listProjectsQuery = paginationQuerySchema.extend({
    status: z.enum(['active', 'archived']).optional(),
});
