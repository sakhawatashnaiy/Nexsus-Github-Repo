import multer from 'multer'
import path from 'node:path'
import { env } from '../config/env.ts'
import { ApiError } from '../utils/ApiError.ts'

function makeStorage(subDir: string) {
  const root = path.resolve(env.UPLOAD_DIR, subDir)
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, root),
    filename: (_req, file, cb) => {
      const safeName = `${Date.now()}-${file.originalname.replaceAll(' ', '_')}`
      cb(null, safeName)
    },
  })
}

function fileFilter(_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!file) return cb(new ApiError('File required', 400))
  return cb(null, true)
}

export const uploadPitchDeck = multer({
  storage: makeStorage('documents'),
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 },
})

export const uploadImage = multer({
  storage: makeStorage('images'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
})
