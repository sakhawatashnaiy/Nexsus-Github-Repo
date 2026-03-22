import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth.middleware.js'
import { requireRole } from '../../middlewares/role.middleware.js'
import { uploadImage, uploadPitchDeck } from '../../middlewares/upload.middleware.js'
import { validate } from '../../middlewares/validate.middleware.js'
import * as controller from './documents.controller.js'
import {
  createDocumentSchema,
  documentIdParams,
  listDocumentsQuery,
  updateDocumentSchema,
} from './documents.validation.js'

export const documentRoutes = Router()

documentRoutes.get('/', requireAuth, requireRole('entrepreneur', 'admin'), validate({ query: listDocumentsQuery }), controller.listDocuments)

documentRoutes.post(
  '/',
  requireAuth,
  requireRole('entrepreneur', 'admin'),
  uploadPitchDeck.single('file'),
  validate({ body: createDocumentSchema }),
  controller.uploadDocument,
)

documentRoutes.get(
  '/:id',
  requireAuth,
  requireRole('entrepreneur', 'admin'),
  validate({ params: documentIdParams }),
  controller.getDocument,
)

documentRoutes.patch(
  '/:id',
  requireAuth,
  requireRole('entrepreneur', 'admin'),
  validate({ params: documentIdParams, body: updateDocumentSchema }),
  controller.updateDocument,
)

documentRoutes.get(
  '/:id/file',
  requireAuth,
  requireRole('entrepreneur', 'admin'),
  validate({ params: documentIdParams }),
  controller.downloadFile,
)

documentRoutes.post(
  '/:id/version',
  requireAuth,
  requireRole('entrepreneur', 'admin'),
  validate({ params: documentIdParams }),
  uploadPitchDeck.single('file'),
  controller.uploadNewVersion,
)

documentRoutes.post(
  '/:id/signature',
  requireAuth,
  requireRole('entrepreneur', 'admin'),
  validate({ params: documentIdParams }),
  uploadImage.single('file'),
  controller.uploadSignature,
)

documentRoutes.get(
  '/:id/signature',
  requireAuth,
  requireRole('entrepreneur', 'admin'),
  validate({ params: documentIdParams }),
  controller.getSignature,
)
