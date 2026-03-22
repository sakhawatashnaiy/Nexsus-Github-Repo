import mongoose, { Schema } from 'mongoose';
const ProjectSchema = new Schema({
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'archived'], default: 'active', index: true },
    dueDate: { type: Date },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
}, { timestamps: true });
ProjectSchema.index({ ownerId: 1, updatedAt: -1 });
export const ProjectModel = mongoose.model('Project', ProjectSchema);
