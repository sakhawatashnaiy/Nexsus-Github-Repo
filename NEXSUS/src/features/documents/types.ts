export type DocumentStatus = 'draft' | 'signed' | 'void'

export type DocumentItem = {
  id: string
  title: string
  status: DocumentStatus
  version: number
  originalName: string
  mimeType: string
  size: number
  createdAt: string
  updatedAt: string
  fileUrl: string
  signatureUrl: string | null
  signedAt: string | null
}
