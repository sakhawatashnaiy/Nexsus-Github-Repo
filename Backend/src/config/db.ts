import mongoose from 'mongoose'
import { env } from './env.ts'
import { logger } from '../utils/logger.ts'

export async function connectDb() {
  mongoose.set('strictQuery', true)
  await mongoose.connect(env.MONGODB_URI)
  logger.info('MongoDB connected')
}
