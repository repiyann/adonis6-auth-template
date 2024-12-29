import User from '#models/user'
import AuthRepository from '#repositories/auth.repository'
import { loginValidator, registerValidator } from '#validators/auth/auth'
import { AccessToken } from '@adonisjs/auth/access_tokens'
import { Infer } from '@vinejs/vine/types'
import { inject } from '@adonisjs/core'
import CustomErrorException from '#exceptions/custom_error_exception'
import TokenRepository from '#repositories/token.repository'
import mail from '@adonisjs/mail/services/main'
import VerifyEmailNotification from '#mails/verify_e_notification'

type RegisterPayload = Infer<typeof registerValidator>
type LoginPayload = Infer<typeof loginValidator>

@inject()
export default class AuthService {
  constructor(
    protected authRepo: AuthRepository,
    protected tokenRepo: TokenRepository
  ) {}

  async register(payload: RegisterPayload) {
    const user = await this.authRepo.create(payload)
    const authToken = await User.accessTokens.create(user)

    const token = await this.tokenRepo.generateVerifyEmailToken(user)
    await mail.sendLater(new VerifyEmailNotification(user, token))

    return authToken
  }

  async requestEmail(user: User) {
    const token = await this.tokenRepo.generateVerifyEmailToken(user)
    await mail.sendLater(new VerifyEmailNotification(user, token))
  }

  async verifyEmail(token: string, auth: User) {
    const user = await this.tokenRepo.getTokenUser(token, 'VERIFY_EMAIL')
    const isMatch = user?.id === auth?.id

    if (!user || !isMatch) {
      throw new CustomErrorException(
        'Invalid token or token does not belong to the authenticated user.',
        {
          status: 401,
        }
      )
    }

    user.isEmailVerified = true
    await user.save()
    await this.tokenRepo.expireTokens(user, 'verifyEmailTokens')
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
