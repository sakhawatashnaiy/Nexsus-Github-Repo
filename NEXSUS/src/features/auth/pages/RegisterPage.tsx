import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRegisterMutation } from '@/features/auth/authApi'
import { useAppDispatch } from '@/app/hooks'
import { setCredentials } from '@/features/auth/authSlice'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { InlineAlert } from '@/components/shared/InlineAlert'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [registerUser, { isLoading, error }] = useRegisterMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = await registerUser(values).unwrap()
      dispatch(setCredentials(res))
      navigate('/dashboard', { replace: true })
    } catch {
      // handled by `error` state + InlineAlert
    }
  })

  return (
    <Card className="motion-safe:animate-fade-up">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-bold italic tracking-tight">Create account</CardTitle>
        <p className="text-sm font-medium italic text-[rgb(var(--muted))]">
          Set up your workspace in minutes.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {error ? (
          <InlineAlert variant="error" title="Registration failed" description="Please try again." />
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="font-semibold italic" htmlFor="name">
              Name
            </Label>
            <Input
              id="name"
              autoComplete="name"
              className="transition duration-200 focus-visible:animate-pop"
              {...register('name')}
            />
            {errors.name ? (
              <div className="text-xs font-semibold italic text-[rgb(var(--danger))]">
                {errors.name.message}
              </div>
            ) : null}
          </div>

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
              <div className="text-xs font-semibold italic text-[rgb(var(--danger))]">
                {errors.email.message}
              </div>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold italic" htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              className="transition duration-200 focus-visible:animate-pop"
              {...register('password')}
            />
            {errors.password ? (
              <div className="text-xs font-semibold italic text-[rgb(var(--danger))]">
                {errors.password.message}
              </div>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating…' : 'Create account'}
          </Button>
        </form>

        <div className="text-sm font-medium italic text-[rgb(var(--muted))]">
          Already have an account?{' '}
          <Link className="text-[rgb(var(--fg))] underline underline-offset-4" to="/login">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
