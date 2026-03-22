import { useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { useAppSelector } from '@/app/hooks'
import { selectAccessToken } from '@/features/auth/authSlice'
import {
  useListDocumentsQuery,
  useUploadDocumentMutation,
  useUploadDocumentVersionMutation,
  useUploadSignatureMutation,
} from '@/features/documents/documentsApi'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Table, Td, Th } from '@/components/ui/Table'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import type { DocumentItem } from '@/features/documents/types'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export function DocumentsPage() {
  const token = useAppSelector(selectAccessToken)
  const { data, isLoading, isError, refetch } = useListDocumentsQuery()

  const [uploadOpen, setUploadOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const [selected, setSelected] = useState<DocumentItem | null>(null)
  const [pageCount, setPageCount] = useState<number | null>(null)
  const previewRef = useRef<HTMLDivElement | null>(null)
  const [previewWidth, setPreviewWidth] = useState(520)

  const signatureInputRef = useRef<HTMLInputElement | null>(null)
  const newVersionInputRef = useRef<HTMLInputElement | null>(null)

  const [uploadDocument, uploadState] = useUploadDocumentMutation()
  const [uploadSignature, signatureState] = useUploadSignatureMutation()
  const [uploadVersion, versionState] = useUploadDocumentVersionMutation()

  useEffect(() => {
    const el = previewRef.current
    if (!el) return

    const update = () => {
      const width = Math.max(280, Math.min(560, el.clientWidth - 16))
      setPreviewWidth(width)
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const docs = data ?? []

  const selectedFile = useMemo(() => {
    if (!selected) return null
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined
    return { url: selected.fileUrl, httpHeaders: headers }
  }, [selected, token])

  return (
    <div className="space-y-8 motion-safe:animate-fade-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold italic tracking-tight">Documents</h2>
          <p className="mt-1 text-sm font-medium italic text-[rgb(var(--muted))]">
            Upload PDFs, track metadata, and store e-signatures.
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => setUploadOpen(true)}>
          Upload document
        </Button>
      </div>

      {isError ? (
        <ErrorState
          title="Could not load documents"
          description="Check your API configuration and try again."
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <Card className="p-4">
          <Skeleton className="h-10 w-48" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </Card>
      ) : docs.length === 0 ? (
        <EmptyState
          title="No documents yet"
          description="Upload a PDF to start."
          action={{ label: 'Upload document', onClick: () => setUploadOpen(true) }}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-4 motion-safe:animate-fade-up">
            <div className="space-y-3 sm:hidden">
              {docs.map((d) => (
                <div
                  key={d.id}
                  className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{d.title}</div>
                      <div className="mt-0.5 text-xs text-[rgb(var(--muted))]">
                        {d.status} · v{d.version}
                      </div>
                      <div className="mt-0.5 text-xs text-[rgb(var(--muted))]">
                        {new Date(d.updatedAt).toLocaleString()}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={selected?.id === d.id ? 'secondary' : 'primary'}
                      onClick={() => {
                        setSelected(d)
                        setPageCount(null)
                      }}
                    >
                      Preview
                    </Button>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={!selected || selected.id !== d.id || signatureState.isLoading}
                      onClick={() => signatureInputRef.current?.click()}
                    >
                      Add signature
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={!selected || selected.id !== d.id || versionState.isLoading}
                      onClick={() => newVersionInputRef.current?.click()}
                    >
                      New version
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden sm:block">
              <Table>
                <thead>
                  <tr>
                    <Th>Title</Th>
                    <Th>Status</Th>
                    <Th>Version</Th>
                    <Th>Updated</Th>
                    <Th className="text-right">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((d) => (
                    <tr
                      key={d.id}
                      className="transition-colors duration-150 ease-out hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <Td className="font-medium">{d.title}</Td>
                      <Td className="text-[rgb(var(--muted))]">{d.status}</Td>
                      <Td className="text-[rgb(var(--muted))]">v{d.version}</Td>
                      <Td className="text-[rgb(var(--muted))]">
                        {new Date(d.updatedAt).toLocaleString()}
                      </Td>
                      <Td className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant={selected?.id === d.id ? 'secondary' : 'primary'}
                            onClick={() => {
                              setSelected(d)
                              setPageCount(null)
                            }}
                          >
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={!selected || selected.id !== d.id || signatureState.isLoading}
                            onClick={() => signatureInputRef.current?.click()}
                          >
                            Add signature
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={!selected || selected.id !== d.id || versionState.isLoading}
                            onClick={() => newVersionInputRef.current?.click()}
                          >
                            New version
                          </Button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <input
              ref={signatureInputRef}
              className="hidden"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              aria-label="Upload signature image"
              title="Upload signature image"
              onChange={async (e) => {
                const picked = e.target.files?.[0]
                e.target.value = ''
                if (!picked || !selected) return
                await uploadSignature({ id: selected.id, file: picked }).unwrap()
                await refetch()
              }}
            />

            <input
              ref={newVersionInputRef}
              className="hidden"
              type="file"
              accept="application/pdf"
              aria-label="Upload new PDF version"
              title="Upload new PDF version"
              onChange={async (e) => {
                const picked = e.target.files?.[0]
                e.target.value = ''
                if (!picked || !selected) return
                const updated = await uploadVersion({ id: selected.id, file: picked }).unwrap()
                setSelected(updated)
                await refetch()
              }}
            />
          </Card>

          <Card className="p-4 motion-safe:animate-fade-up">
            {selected ? (
              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-base font-bold italic tracking-tight">{selected.title}</div>
                    <div className="mt-1 text-xs font-medium italic text-[rgb(var(--muted))]">
                      {selected.originalName} · {Math.round(selected.size / 1024)} KB
                      {selected.signatureUrl ? ' · Signed' : ''}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => setSelected(null)}
                  >
                    Clear
                  </Button>
                </div>

                <div
                  ref={previewRef}
                  className="rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-2"
                >
                  <Document
                    file={selectedFile as any}
                    onLoadSuccess={(info) => setPageCount(info.numPages)}
                    loading={<div className="text-sm text-[rgb(var(--muted))]">Loading PDF…</div>}
                    error={<div className="text-sm text-[rgb(var(--muted))]">Could not preview PDF.</div>}
                  >
                    <Page pageNumber={1} width={previewWidth} />
                  </Document>
                </div>

                {pageCount ? (
                  <div className="text-xs font-medium italic text-[rgb(var(--muted))]">{pageCount} pages</div>
                ) : null}
              </div>
            ) : (
              <div className="text-sm text-[rgb(var(--muted))]">Select a document to preview.</div>
            )}
          </Card>
        </div>
      )}

      <Modal
        open={uploadOpen}
        onOpenChange={(o) => {
          setUploadOpen(o)
          if (!o) {
            setTitle('')
            setFile(null)
          }
        }}
        title="Upload document"
        footer={
          <>
            <Button variant="secondary" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!file || uploadState.isLoading}
              onClick={async () => {
                if (!file) return
                const created = await uploadDocument({ file, title: title.trim() || undefined }).unwrap()
                setSelected(created)
                setUploadOpen(false)
                setTitle('')
                setFile(null)
              }}
            >
              {uploadState.isLoading ? 'Uploading…' : 'Upload'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="docTitle">Title</Label>
            <Input
              id="docTitle"
              placeholder="e.g. NDA v1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="docFile">PDF file</Label>
            <Input
              id="docFile"
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <div className="text-xs text-[rgb(var(--muted))]">PDF only · max 20MB</div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
