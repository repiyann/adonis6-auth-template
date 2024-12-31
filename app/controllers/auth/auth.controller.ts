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

      const token = await this.service.register(payload)

      return response.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: token,
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

  async request({ response, auth }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      await this.service.requestEmail(user)

      return response.status(200).json({
        status: 'success',
        message: 'Request for new email verification sent successfully',
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

  async verify({ response, params, auth }: HttpContext) {
    try {
      const token = params.token
      const user = auth.getUserOrFail()

      await this.service.verifyEmail(token, user)

      return response.status(200).json({
        status: 'success',
        message: 'Email verified successfully',
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

  async login({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(loginValidator)

      const { token, isAdmin } = await this.service.login(payload)

      return response.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: { token, isAdmin },
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

  async logout({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      const token = user.currentAccessToken
      await this.service.logout(user, token)

      return response.status(200).json({
        status: 'success',
        message: 'Logged out successfully',
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
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
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }
}
