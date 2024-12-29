import type { HttpContext } from '@adonisjs/core/http'

export default class VerifyEmailMiddleware {
  async handle(ctx: HttpContext) {
    /**
     * Middleware logic goes here (before the next call)
     */

    if (ctx.auth.user && !ctx.auth.user.isEmailVerified) {
      return ctx.response.status(401).json({
        status: 'error',
        error: {
          message: 'Please verify your email',
        },
      })
    }
  }
}
