import User from '#models/user'
import AuthRepository from '#repositories/auth.repository'
import { loginValidator, registerValidator } from '#validators/auth/auth'
import { AccessToken } from '@adonisjs/auth/access_tokens'
import { Infer } from '@vinejs/vine/types'
import { inject } from '@adonisjs/core'

type RegisterPayload = Infer<typeof registerValidator>
type LoginPayload = Infer<typeof loginValidator>

@inject()
export default class AuthService {
  constructor(protected repository: AuthRepository) {}

  async register(payload: RegisterPayload) {
    return this.repository.create(payload)
  }

  async login({ email, password }: LoginPayload) {
    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user)

    return token
  }

  async logout(user: User, token: AccessToken) {
    await User.accessTokens.delete(user, token.identifier)

    return true
  }
}
