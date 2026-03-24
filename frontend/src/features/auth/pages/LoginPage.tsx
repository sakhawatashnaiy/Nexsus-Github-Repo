import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLoginMutation } from '@/features/auth/authApi'
import { useAppDispatch } from '@/app/hooks'
import { setCredentials } from '@/features/auth/authSlice'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { InlineAlert } from '@/components/shared/InlineAlert'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const [login, { isLoading, error }] = useLoginMutation()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = await login(values).unwrap()
      dispatch(setCredentials(res))
      const from = (location.state as { from?: string } | null)?.from
      navigate(from ?? '/dashboard', { replace: true })
    } catch {
      // handled by `error` state + InlineAlert
    }
  })

  return (
    <Card className="motion-safe:animate-fade-up transition-transform duration-200 ease-out hover:-translate-y-0.5">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-extrabold italic tracking-tight sm:text-lg">
          Sign in
        </CardTitle>
        <p className="text-base font-medium italic text-[rgb(var(--muted))] sm:text-sm">
          Use your email and password to access your workspace.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {error ? (
          <InlineAlert
            variant="error"
            title="Login failed"
            description="Check your credentials and try again."
          />
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="font-semibold italic" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className="transition duration-200 focus-visible:animate-pop"
              {...register('email')}
            />
            {errors.email ? (
              <div className="text-sm font-semibold italic text-[rgb(var(--danger))] sm:text-xs">
                {errors.email.message}
              </div>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold italic" htmlFor="password">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="pr-10 transition duration-200 focus-visible:animate-pop"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-[rgb(var(--muted))] transition-colors duration-150 ease-out hover:text-[rgb(var(--fg))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password ? (
              <div className="text-sm font-semibold italic text-[rgb(var(--danger))] sm:text-xs">
                {errors.password.message}
              </div>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="text-base font-medium italic text-[rgb(var(--muted))] sm:text-sm">
          No account?{' '}
          <Link
            className="text-[rgb(var(--fg))] underline underline-offset-4 transition-transform duration-150 ease-out hover:-translate-y-px hover:animate-pop"
            to="/register"
          >
            Create one
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
