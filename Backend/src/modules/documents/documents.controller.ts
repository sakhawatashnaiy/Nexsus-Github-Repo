import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import path from 'node:path'
import { StatusCodes } from 'http-status-codes'
import { catchAsync } from '../../utils/catchAsync.ts'
import { sendResponse } from '../../utils/sendResponse.ts'
import { env } from '../../config/env.ts'
import { DocumentModel } from './document.model.ts'
import type { DocumentDoc } from './document.model.ts'
import { getSkipLimit } from '../../utils/pagination.ts'

function toDto(doc: DocumentDoc) {
  const id = String(doc._id)
  return {
    id,
    title: doc.title,
    status: doc.status,
    version: doc.version,
    originalName: doc.originalName,
    mimeType: doc.mimeType,
    size: doc.size,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    fileUrl: `/api/documents/${id}/file`,
    signatureUrl: doc.signatureFileName ? `/api/documents/${id}/signature` : null,
    signedAt: doc.signedAt ? doc.signedAt.toISOString() : null,
    signature: doc.signatureFileName
      ? {
          mimeType: doc.signatureMimeType ?? 'application/octet-stream',
          size: doc.signatureSize ?? 0,
        }
      : null,
  }
}

export const listDocuments = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id
  const q = req.query as unknown as { page: number; limit: number }
  const { skip, limit } = getSkipLimit({ page: q.page, limit: q.limit })

  const filter: Record<string, unknown> = { uploadedById: userId, isDeleted: false }

  const [items, total] = await Promise.all([
    DocumentModel.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean<DocumentDoc[]>(),
    DocumentModel.countDocuments(filter),
  ])

  return sendResponse(res, {
    message: 'OK',
    data: items.map((d) => toDto(d)),
    meta: { page: q.page, limit: q.limit, total },
  })
})

export const uploadDocument = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id
  const file = req.file
  if (!file) {
    return sendResponse(res.status(StatusCodes.UNPROCESSABLE_ENTITY), {
      success: false,
      message: 'File is required',
      errors: [],
    })
  }

  const title = (req.body?.title as string | undefined)?.trim() || file.originalname
  const status = (req.body?.status as string | undefined) ?? 'draft'

  const doc = await DocumentModel.create({
    uploadedById: userId,
    title,
    status,
    version: 1,
    fileName: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
  })

  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Uploaded',
    data: toDto(doc.toObject() as unknown as DocumentDoc),
  })
})

export const uploadNewVersion = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id
  if (!mongoose.isValidObjectId(req.params.id)) return sendResponse(res, { success: false, message: 'Not found', errors: [] })

  const file = req.file
  if (!file) {
    return sendResponse(res.status(StatusCodes.UNPROCESSABLE_ENTITY), {
      success: false,
      message: 'File is required',
      errors: [],
    })
  }

  const existing = await DocumentModel.findOne({ _id: req.params.id, uploadedById: userId, isDeleted: false })
  if (!existing) return sendResponse(res, { success: false, message: 'Not found', errors: [] })

  existing.version = (existing.version ?? 1) + 1
  existing.fileName = file.filename
  existing.originalName = file.originalname
  existing.mimeType = file.mimetype
  existing.size = file.size
  existing.status = 'draft'
  existing.signatureFileName = undefined
  existing.signatureMimeType = undefined
  existing.signatureSize = undefined
  existing.signedAt = undefined

  await existing.save()

  return sendResponse(res, { message: 'Uploaded', data: toDto(existing.toObject() as unknown as DocumentDoc) })
})

export const updateDocument = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id
  if (!mongoose.isValidObjectId(req.params.id)) return sendResponse(res, { success: false, message: 'Not found', errors: [] })

  const updated = await DocumentModel.findOneAndUpdate(
    { _id: req.params.id, uploadedById: userId, isDeleted: false },
    { $set: req.body },
    { new: true },
  ).lean<DocumentDoc | null>()

  if (!updated) return sendResponse(res, { success: false, message: 'Not found', errors: [] })

  return sendResponse(res, { message: 'Updated', data: toDto(updated) })
})

export const getDocument = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id
  if (!mongoose.isValidObjectId(req.params.id)) return sendResponse(res, { success: false, message: 'Not found', errors: [] })

  const doc = await DocumentModel.findOne({ _id: req.params.id, uploadedById: userId, isDeleted: false }).lean<DocumentDoc | null>()
  if (!doc) return sendResponse(res, { success: false, message: 'Not found', errors: [] })

  return sendResponse(res, { message: 'OK', data: toDto(doc) })
})

export const downloadFile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id
  if (!mongoose.isValidObjectId(req.params.id)) return sendResponse(res, { success: false, message: 'Not found', errors: [] })

  const doc = await DocumentModel.findOne({ _id: req.params.id, uploadedById: userId, isDeleted: false }).lean()
  if (!doc) return sendResponse(res, { success: false, message: 'Not found', errors: [] })

  const abs = path.resolve(env.UPLOAD_DIR, doc.fileName)
  res.setHeader('content-type', doc.mimeType)
  res.setHeader('content-disposition', `inline; filename="${encodeURIComponent(doc.originalName)}"`)
  return res.sendFile(abs)
})

export const uploadSignature = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id
  if (!mongoose.isValidObjectId(req.params.id)) return sendResponse(res, { success: false, message: 'Not found', errors: [] })

  const file = req.file
  if (!file) {
    return sendResponse(res.status(StatusCodes.UNPROCESSABLE_ENTITY), {
      success: false,
      message: 'Signature image is required',
      errors: [],
    })
  }

  const updated = await DocumentModel.findOneAndUpdate(
    { _id: req.params.id, uploadedById: userId, isDeleted: false },
    {
      $set: {
        signatureFileName: file.filename,
        signatureMimeType: file.mimetype,
        signatureSize: file.size,
        status: 'signed',
        signedAt: new Date(),
      },
    },
    { new: true },
  ).lean<DocumentDoc | null>()

  if (!updated) return sendResponse(res, { success: false, message: 'Not found', errors: [] })

  return sendResponse(res, { message: 'Signed', data: toDto(updated) })
})

export const getSignature = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id
  if (!mongoose.isValidObjectId(req.params.id)) return sendResponse(res, { success: false, message: 'Not found', errors: [] })

  const doc = await DocumentModel.findOne({ _id: req.params.id, uploadedById: userId, isDeleted: false }).lean<DocumentDoc | null>()
  if (!doc || !doc.signatureFileName) return sendResponse(res, { success: false, message: 'Not found', errors: [] })

  const abs = path.resolve(env.UPLOAD_DIR, doc.signatureFileName)
  res.setHeader('content-type', doc.signatureMimeType ?? 'application/octet-stream')
  res.setHeader('content-disposition', `inline; filename="signature_${encodeURIComponent(doc.originalName)}"`)
  return res.sendFile(abs)
})
