import mongoose from 'mongoose'

type UserDocument = {
  email: string
  name: string
  passwordHash: string
  role: 'entrepreneur' | 'investor' | 'admin'
  isDeleted: boolean
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: { type: String, required: true, index: true, unique: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      required: true,
      enum: ['entrepreneur', 'investor', 'admin'],
      default: 'entrepreneur',
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
)

const existing = mongoose.models.User as mongoose.Model<UserDocument> | undefined
export const UserModel = existing ?? mongoose.model<UserDocument>('User', userSchema)
