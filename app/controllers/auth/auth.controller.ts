import type { HttpContext } from '@adonisjs/core/http'
import { registerValidator, loginValidator } from '#validators/auth/auth'
import AuthService from '#services/auth/auth.service'
import { inject } from '@adonisjs/core'

@inject()
export default class AuthController {
  constructor(protected service: AuthService) {}

  async register({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(registerValidator)

      await this.service.register(payload)

      return response.status(201).json({
        status: 'success',
        message: 'User registered successfully',
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        error: {
          message:
            (error.messages && error.messages[0] && error.messages[0].message) ||
            error.message ||
            'Something went wrong',
        },
      })
    }
  }

  async login({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(loginValidator)

      const token = await this.service.login(payload)

      return response.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: token,
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        error: {
          message:
            (error.messages && error.messages[0] && error.messages[0].message) ||
            error.message ||
            'Something went wrong',
        },
      })
    }
  }

  async logout({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      await this.service.logout(user, user.currentAccessToken)

      return response.status(200).json({
        status: 'success',
        message: 'Logged out successfully',
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        error: {
          message:
            (error.messages && error.messages[0] && error.messages[0].message) ||
            error.message ||
            'Something went wrong',
        },
      })
    }
  }

  async profile({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      return response.status(200).json({
        status: 'success',
        message: 'User fetched successfully',
        data: user,
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        error: {
          message:
            (error.messages && error.messages[0] && error.messages[0].message) ||
            error.message ||
            'Something went wrong',
        },
      })
    }
  }
}
