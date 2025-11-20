import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Некорректный email адрес'),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
})

export const registerSchema = z
  .object({
    email: z.string().email('Некорректный email адрес'),
    password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Пароли не совпадают',
    path: ['passwordConfirm'],
  })

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>

export function calculatePasswordStrength(password: string): {
  score: number
  label: string
  color: string
} {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 2) return { score, label: 'Слабый', color: '#ef4444' }
  if (score <= 4) return { score, label: 'Средний', color: '#f59e0b' }
  return { score, label: 'Сильный', color: '#10b981' }
}

