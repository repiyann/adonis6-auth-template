import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class VerifyEmailMiddleware {
  async handle({ response, auth }: HttpContext, next: NextFn) {
    const isEmailVerified = auth.user?.isEmailVerified

    if (!isEmailVerified) {
      return response.status(403).json({
        status: 'error',
        message: 'Please verify your email address to proceed.',
      })
    }

    const output = await next()
    return output
  }
}
