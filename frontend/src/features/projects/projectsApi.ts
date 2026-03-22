import { baseApi } from '@/services/api/baseApi'
import type { CreateProjectRequest, Project, UpdateProjectRequest } from '@/features/projects/types'

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listProjects: builder.query<Project[], void>({
      query: () => ({ url: '/projects' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((p) => ({ type: 'Project' as const, id: p.id })),
              { type: 'Project' as const, id: 'LIST' },
            ]
          : [{ type: 'Project' as const, id: 'LIST' }],
    }),
    createProject: builder.mutation<Project, CreateProjectRequest>({
      query: (body) => ({ url: '/projects', method: 'POST', body }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),
    updateProject: builder.mutation<Project, UpdateProjectRequest>({
      query: ({ id, ...patch }) => ({ url: `/projects/${id}`, method: 'PATCH', body: patch }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'Project', id: arg.id }],
    }),
    deleteProject: builder.mutation<{ success: boolean; message: string }, { id: string }>({
      query: ({ id }) => ({ url: `/projects/${id}`, method: 'DELETE' }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Project', id: arg.id },
        { type: 'Project', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useListProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectsApi
