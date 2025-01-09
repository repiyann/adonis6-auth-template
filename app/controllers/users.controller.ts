import UsersService from '#services/users.service'
import { roleValidator } from '#validators/users'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class UsersController {
  constructor(protected service: UsersService) {}

  async manage({ request, response }: HttpContext) {
    try {
      const { page, perPage } = request.qs()
      const data = await this.service.indexUsers(page, perPage)

      return response.status(200).json({
        status: 'success',
        message: 'Successfully fetched users and roles.',
        data: data,
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

  async role({ request, response, params, auth }: HttpContext) {
    try {
      const id = params.id
      const user = auth.getUserOrFail()
      const data = await request.validateUsing(roleValidator)

      const token = user.currentAccessToken
      await this.service.manageRoles(data, id, user, token)

      return response.status(200).json({
        status: 'success',
        message: 'Successfully updated user role.',
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

  async destroy({ response, params, auth }: HttpContext) {
    try {
      const id = params.id
      const user = auth.getUserOrFail()

      const token = user.currentAccessToken
      await this.service.deleteUser(id, user, token)

      return response.status(200).json({
        status: 'success',
        message: 'Successfully deleted the user.',
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }
}
