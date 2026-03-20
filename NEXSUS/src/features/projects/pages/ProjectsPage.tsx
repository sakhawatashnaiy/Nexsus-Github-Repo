import { useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useListProjectsQuery,
} from '@/features/projects/projectsApi'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Table, Td, Th } from '@/components/ui/Table'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Badge } from '@/components/ui/Badge'

const createSchema = z.object({
  name: z.string().min(2, 'Project name is required'),
  dueDate: z.string().optional(),
})

type CreateValues = z.infer<typeof createSchema>

function toIsoOrNull(value: string | undefined): string | null {
  const trimmed = value?.trim()
  if (!trimmed) return null
  const d = new Date(trimmed)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

export function ProjectsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const { data, isLoading, isError, refetch } = useListProjectsQuery()
  const [createProject, createState] = useCreateProjectMutation()
  const [deleteProject, deleteState] = useDeleteProjectMutation()

  const projects = data ?? []
  const sorted = useMemo(
    () =>
      [...projects].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)),
    [projects],
  )

  const form = useForm<CreateValues>({ resolver: zodResolver(createSchema) })

  return (
    <div className="space-y-8 motion-safe:animate-fade-up">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold italic tracking-tight">Projects</h2>
          <p className="mt-1 text-sm font-medium italic text-[rgb(var(--muted))]">
            Manage projects in your workspace.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>New project</Button>
      </div>

      {isError ? (
        <ErrorState
          title="Could not load projects"
          description="Check your API configuration and try again."
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <Card className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      ) : sorted.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start organizing work."
          action={{ label: 'Create project', onClick: () => setCreateOpen(true) }}
        />
      ) : (
        <div className="motion-safe:animate-fade-up">
          <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Status</Th>
              <Th>Due date</Th>
              <Th>Last updated</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr
                key={p.id}
                className="transition-colors duration-150 ease-out hover:bg-black/5 dark:hover:bg-white/5"
              >
                <Td className="font-medium">{p.name}</Td>
                <Td>
                  <Badge variant="muted">{p.status}</Badge>
                </Td>
                <Td className="text-[rgb(var(--muted))]">
                  {p.dueDate ? new Date(p.dueDate).toLocaleString() : '—'}
                </Td>
                <Td className="text-[rgb(var(--muted))]">{new Date(p.updatedAt).toLocaleString()}</Td>
                <Td className="text-right">
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={deleteState.isLoading}
                    onClick={() => deleteProject({ id: p.id })}
                  >
                    Delete
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
          </Table>
        </div>
      )}

      <Modal
        open={createOpen}
        onOpenChange={(o) => {
          setCreateOpen(o)
          if (!o) form.reset()
        }}
        title="Create project"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(async (values) => {
                await createProject({ name: values.name, dueDate: toIsoOrNull(values.dueDate) }).unwrap()
                setCreateOpen(false)
                form.reset()
              })}
              disabled={createState.isLoading}
            >
              {createState.isLoading ? 'Creating…' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="projectName">Name</Label>
            <Input id="projectName" placeholder="e.g. Payments" {...form.register('name')} />
            {form.formState.errors.name ? (
              <div className="text-xs text-[rgb(var(--danger))]">
                {form.formState.errors.name.message}
              </div>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="projectDueDate">Due date</Label>
            <Input id="projectDueDate" type="datetime-local" {...form.register('dueDate')} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
