import mongoose, { Schema } from 'mongoose'

export type DocumentStatus = 'draft' | 'signed' | 'void'

export type DocumentDoc = {
  _id: mongoose.Types.ObjectId
  uploadedById: mongoose.Types.ObjectId
  title: string
  status: DocumentStatus
  version: number

  fileName: string
  originalName: string
  mimeType: string
  size: number

  signatureFileName?: string
  signatureMimeType?: string
  signatureSize?: number
  signedAt?: Date

  isDeleted: boolean
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const DocumentSchema = new Schema<DocumentDoc>(
  {
    uploadedById: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    status: { type: String, enum: ['draft', 'signed', 'void'], default: 'draft', index: true },
    version: { type: Number, default: 1 },

    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },

    signatureFileName: { type: String },
    signatureMimeType: { type: String },
    signatureSize: { type: Number },
    signedAt: { type: Date },

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
  },
  { timestamps: true },
)

DocumentSchema.index({ uploadedById: 1, updatedAt: -1 })

export const DocumentModel = mongoose.model<DocumentDoc>('Document', DocumentSchema)
