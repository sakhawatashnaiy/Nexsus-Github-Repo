import type { Request, Response } from 'express'
import { catchAsync } from '../../utils/catchAsync.js'
import { sendResponse } from '../../utils/sendResponse.js'
import { ProjectModel } from '../projects/project.model.js'

export const dashboardStats = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id
  const role = req.user!.role

  if (role === 'investor') {
    return sendResponse(res, {
      message: 'OK',
      data: {
        role,
        bookmarkedStartups: 0,
        pendingPitchRequests: 0,
        unreadMessages: 0,
      },
    })
  }

  // entrepreneur/admin
  const activeProjects = await ProjectModel.countDocuments({ ownerId: userId, isDeleted: false, status: 'active' })
  return sendResponse(res, {
    message: 'OK',
    data: {
      role: role === 'admin' ? 'entrepreneur' : role,
      activeProjects,
      teamMembers: 1,
      pendingInvites: 0,
      pendingPitchRequests: 0,
    },
  })
})
