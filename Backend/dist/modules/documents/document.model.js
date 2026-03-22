import mongoose, { Schema } from 'mongoose';
const DocumentSchema = new Schema({
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
}, { timestamps: true });
DocumentSchema.index({ uploadedById: 1, updatedAt: -1 });
export const DocumentModel = mongoose.model('Document', DocumentSchema);
