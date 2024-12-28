import vine from '@vinejs/vine'
import { password } from './auth.js'

export const emailReset = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
  })
)

export const passwordReset = vine.compile(
  vine.object({
    token: vine.string(),
    password,
  })
)
