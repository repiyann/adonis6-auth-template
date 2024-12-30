import PasswordResetService from '#services/auth/password_reset.service'
import { emailReset, passwordReset } from '#validators/auth/password_reset'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class PasswordResetsController {
  constructor(protected service: PasswordResetService) {}

  async forgot({ request, response }: HttpContext) {
    try {
      const { email } = await request.validateUsing(emailReset)

      await this.service.sendResetEmail(email)

      return response.status(200).json({
        status: 'success',
        message: 'Reset link successfully sent',
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

  async verify({ response, params }: HttpContext) {
    try {
      const token = params.token

      await this.service.verifyToken(token)

      return response.status(200).json({
        status: 'success',
        message: 'Token is valid',
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

  async store({ request, response }: HttpContext) {
    try {
      const { token, password } = await request.validateUsing(passwordReset)

      await this.service.resetPassword(token, password)

      return response.status(200).json({
        status: 'success',
        message: 'Password reset successful',
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }
}
