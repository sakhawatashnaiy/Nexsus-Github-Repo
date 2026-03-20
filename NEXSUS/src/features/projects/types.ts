export type ProjectStatus = 'active' | 'archived'

export type Project = {
  id: string
  name: string
  status: ProjectStatus
  dueDate: string | null
  updatedAt: string
}

export type CreateProjectRequest = {
  name: string
  dueDate?: string | null
}

export type UpdateProjectRequest = {
  id: string
  name?: string
  status?: ProjectStatus
  dueDate?: string | null
}
