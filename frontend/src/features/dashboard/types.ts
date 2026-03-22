export type DashboardStats =
  | {
      role: 'entrepreneur'
      activeProjects: number
      teamMembers: number
      pendingInvites: number
      pendingPitchRequests: number
    }
  | {
      role: 'investor'
      bookmarkedStartups: number
      pendingPitchRequests: number
      unreadMessages: number
    }
