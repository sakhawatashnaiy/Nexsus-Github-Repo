import { useAppSelector } from '@/app/hooks'
import { selectCurrentUser } from '@/features/auth/authSlice'
import { useGetDashboardStatsQuery } from '@/features/dashboard/dashboardApi'
import {
  useDepositMutation,
  useListTransactionsQuery,
  useTransferMutation,
  useWithdrawMutation,
} from '@/features/payments/paymentsApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Table, Td, Th } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { useState } from 'react'

export function DashboardPage() {
  const user = useAppSelector(selectCurrentUser)
  const { data, isLoading, isError, refetch } = useGetDashboardStatsQuery()
  const txQuery = useListTransactionsQuery()
  const [deposit, depositState] = useDepositMutation()
  const [withdraw, withdrawState] = useWithdrawMutation()
  const [transfer, transferState] = useTransferMutation()

  const [amount, setAmount] = useState('')
  const [toUserId, setToUserId] = useState('')

  const role = user?.role ?? data?.role
  const isInvestor = role === 'investor'
  const investorData = data?.role === 'investor' ? data : null
  const entrepreneurData = data?.role === 'entrepreneur' ? data : null

  return (
    <div className="space-y-8 motion-safe:animate-fade-up">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl font-bold italic tracking-tight">Dashboard</h2>
          {role ? (
            <Badge variant="muted" className="capitalize">
              {role}
            </Badge>
          ) : null}
        </div>
        <p className="mt-1 text-sm font-medium italic text-[rgb(var(--muted))]">
          Welcome back{user?.name ? `, ${user.name}` : ''}.
        </p>
      </div>

      {isError ? (
        <ErrorState
          title="Could not load dashboard stats"
          description="Check your API configuration and try again."
          onRetry={() => refetch()}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isInvestor ? (
            <>
              <StatCard
                title="Bookmarked startups"
                value={investorData?.bookmarkedStartups}
                loading={isLoading}
              />
              <StatCard
                title="Pending pitch requests"
                value={data?.pendingPitchRequests}
                loading={isLoading}
              />
              <StatCard
                title="Unread messages"
                value={investorData?.unreadMessages}
                loading={isLoading}
              />
            </>
          ) : (
            <>
              <StatCard title="Active projects" value={entrepreneurData?.activeProjects} loading={isLoading} />
              <StatCard title="Pending pitch requests" value={data?.pendingPitchRequests} loading={isLoading} />
              <StatCard title="Team members" value={entrepreneurData?.teamMembers} loading={isLoading} />
              <StatCard title="Pending invites" value={entrepreneurData?.pendingInvites} loading={isLoading} />
            </>
          )}
        </div>
      )}

      <Card className="motion-safe:animate-fade-up">
        <CardHeader>
          <CardTitle className="text-base font-bold italic tracking-tight">Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="font-semibold italic" htmlFor="txAmount">
                Amount
              </Label>
              <Input
                id="txAmount"
                inputMode="decimal"
                placeholder="e.g. 100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold italic" htmlFor="txToUser">
                To user (transfer)
              </Label>
              <Input
                id="txToUser"
                placeholder="Recipient user id"
                value={toUserId}
                onChange={(e) => setToUserId(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                size="sm"
                disabled={depositState.isLoading}
                onClick={async () => {
                  const n = Number(amount)
                  if (!Number.isFinite(n) || n <= 0) return
                  await deposit({ amount: n }).unwrap()
                  txQuery.refetch()
                  setAmount('')
                }}
              >
                Deposit
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={withdrawState.isLoading}
                onClick={async () => {
                  const n = Number(amount)
                  if (!Number.isFinite(n) || n <= 0) return
                  await withdraw({ amount: n }).unwrap()
                  txQuery.refetch()
                  setAmount('')
                }}
              >
                Withdraw
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={transferState.isLoading || !toUserId.trim()}
                onClick={async () => {
                  const n = Number(amount)
                  if (!Number.isFinite(n) || n <= 0) return
                  await transfer({ toUserId: toUserId.trim(), amount: n }).unwrap()
                  txQuery.refetch()
                  setAmount('')
                }}
              >
                Transfer
              </Button>
            </div>
          </div>

          {txQuery.isError ? (
            <div className="mt-4">
              <ErrorState
                title="Could not load transactions"
                description="Check your API configuration and try again."
                onRetry={() => txQuery.refetch()}
              />
            </div>
          ) : txQuery.isLoading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="mt-4">
              <Table>
                <thead>
                  <tr>
                    <Th>Type</Th>
                    <Th>Amount</Th>
                    <Th>Status</Th>
                    <Th>Provider</Th>
                    <Th>Created</Th>
                  </tr>
                </thead>
                <tbody>
                  {(txQuery.data ?? []).map((t) => (
                    <tr
                      key={t.id}
                      className="transition-colors duration-150 ease-out hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <Td className="font-medium">{t.type}</Td>
                      <Td className="text-[rgb(var(--muted))]">
                        {t.currency} {t.amount}
                      </Td>
                      <Td>
                        <Badge variant="muted">{t.status}</Badge>
                      </Td>
                      <Td className="text-[rgb(var(--muted))]">{t.provider}</Td>
                      <Td className="text-[rgb(var(--muted))]">{new Date(t.createdAt).toLocaleString()}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  loading,
}: {
  title: string
  value?: number
  loading: boolean
}) {
  return (
    <Card className="hover:shadow">
      <CardHeader>
        <CardTitle className="text-sm font-bold italic text-[rgb(var(--muted))]">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-28" />
        ) : (
          <div className="text-3xl font-bold tracking-tight">{value ?? 0}</div>
        )}
      </CardContent>
    </Card>
  )
}
