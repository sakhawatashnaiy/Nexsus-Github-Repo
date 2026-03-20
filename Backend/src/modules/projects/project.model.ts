import mongoose, { Schema } from 'mongoose'

export type ProjectStatus = 'active' | 'archived'

export type ProjectDoc = {
  _id: mongoose.Types.ObjectId
  ownerId: mongoose.Types.ObjectId
  name: string
  status: ProjectStatus
  dueDate?: Date | null
  isDeleted: boolean
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ProjectSchema = new Schema<ProjectDoc>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'archived'], default: 'active', index: true },
    dueDate: { type: Date },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
  },
  { timestamps: true },
)

ProjectSchema.index({ ownerId: 1, updatedAt: -1 })

export const ProjectModel = mongoose.model<ProjectDoc>('Project', ProjectSchema)
