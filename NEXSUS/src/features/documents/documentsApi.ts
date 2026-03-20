import { baseApi } from '@/services/api/baseApi'
import type { DocumentItem } from '@/features/documents/types'

export const documentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listDocuments: builder.query<DocumentItem[], void>({
      query: () => ({ url: '/documents' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((d) => ({ type: 'Document' as const, id: d.id })),
              { type: 'Document' as const, id: 'LIST' },
            ]
          : [{ type: 'Document' as const, id: 'LIST' }],
    }),

    uploadDocument: builder.mutation<DocumentItem, { file: File; title?: string }>({
      query: ({ file, title }) => {
        const body = new FormData()
        body.set('file', file)
        if (title) body.set('title', title)
        return { url: '/documents', method: 'POST', body }
      },
      invalidatesTags: [{ type: 'Document', id: 'LIST' }],
    }),

    uploadDocumentVersion: builder.mutation<DocumentItem, { id: string; file: File }>({
      query: ({ id, file }) => {
        const body = new FormData()
        body.set('file', file)
        return { url: `/documents/${id}/version`, method: 'POST', body }
      },
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Document', id: arg.id },
        { type: 'Document', id: 'LIST' },
      ],
    }),

    uploadSignature: builder.mutation<DocumentItem, { id: string; file: File }>({
      query: ({ id, file }) => {
        const body = new FormData()
        body.set('file', file)
        return { url: `/documents/${id}/signature`, method: 'POST', body }
      },
      invalidatesTags: (_res, _err, arg) => [
        { type: 'Document', id: arg.id },
        { type: 'Document', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useListDocumentsQuery,
  useUploadDocumentMutation,
  useUploadDocumentVersionMutation,
  useUploadSignatureMutation,
} = documentsApi
