import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import { StatusCodes } from 'http-status-codes'
import { catchAsync } from '../../utils/catchAsync.js'
import { sendResponse } from '../../utils/sendResponse.js'
import { ProjectModel } from './project.model.js'
import { getSkipLimit } from '../../utils/pagination.js'

export const listProjects = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id
  const q = req.query as unknown as { page: number; limit: number; status?: string }
  const { skip, limit } = getSkipLimit({ page: q.page, limit: q.limit })

  const filter: Record<string, unknown> = { ownerId: userId, isDeleted: false }
  if (q.status) filter.status = q.status

  const [items, total] = await Promise.all([
    ProjectModel.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
    ProjectModel.countDocuments(filter),
  ])

  return sendResponse(res, {
    message: 'OK',
    data: items.map((p) => ({
      id: String(p._id),
      name: p.name,
      status: p.status,
      dueDate: p.dueDate ? new Date(p.dueDate).toISOString() : null,
      updatedAt: p.updatedAt.toISOString(),
    })),
    meta: { page: q.page, limit: q.limit, total },
  })
})

export const createProject = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id
  const project = await ProjectModel.create({ ownerId: userId, name: req.body.name, dueDate: req.body.dueDate })
  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Created',
    data: {
      id: String(project._id),
      name: project.name,
      status: project.status,
      dueDate: project.dueDate ? project.dueDate.toISOString() : null,
      updatedAt: project.updatedAt.toISOString(),
    },
  })
})

export const updateProject = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id
  if (!mongoose.isValidObjectId(req.params.id)) return sendResponse(res, { success: false, message: 'Not found', errors: [] })

  const project = await ProjectModel.findOneAndUpdate(
    { _id: req.params.id, ownerId: userId, isDeleted: false },
    { $set: req.body },
    { new: true },
  )
  if (!project) return sendResponse(res, { success: false, message: 'Not found', errors: [] })

  return sendResponse(res, {
    message: 'Updated',
    data: {
      id: String(project._id),
      name: project.name,
      status: project.status,
      dueDate: project.dueDate ? project.dueDate.toISOString() : null,
      updatedAt: project.updatedAt.toISOString(),
    },
  })
})

export const deleteProject = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id
  if (!mongoose.isValidObjectId(req.params.id)) return sendResponse(res, { success: false, message: 'Not found', errors: [] })

  const project = await ProjectModel.findOneAndUpdate(
    { _id: req.params.id, ownerId: userId, isDeleted: false },
    { $set: { isDeleted: true, deletedAt: new Date() } },
    { new: true },
  )
  if (!project) return sendResponse(res, { success: false, message: 'Not found', errors: [] })

  return sendResponse(res, { message: 'Deleted', data: { success: true } })
})
