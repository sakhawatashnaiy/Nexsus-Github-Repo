import { z } from 'zod';
import { paginationQuerySchema } from '../../utils/pagination.js';
export const documentIdParams = z.object({
    id: z.string().min(1),
});
export const listDocumentsQuery = paginationQuerySchema;
export const createDocumentSchema = z.object({
    title: z.string().trim().min(1).optional(),
    status: z.enum(['draft', 'signed', 'void']).optional(),
});
export const updateDocumentSchema = z.object({
    title: z.string().trim().min(1).optional(),
    status: z.enum(['draft', 'signed', 'void']).optional(),
});
