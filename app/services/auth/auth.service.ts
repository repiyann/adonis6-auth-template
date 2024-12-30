import User from '#models/user'
import AuthRepository from '#repositories/auth.repository'
import { loginValidator, registerValidator } from '#validators/auth/auth'
import { AccessToken } from '@adonisjs/auth/access_tokens'
import { Infer } from '@vinejs/vine/types'
import { inject } from '@adonisjs/core'
import TokenRepository from '#repositories/token.repository'
import mail from '@adonisjs/mail/services/main'
import VerifyEmailNotification from '#mails/verify_e_notification'
import { Exception } from '@adonisjs/core/exceptions'

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
    const token = await this.tokenRepo.generateToken(user, 'VERIFY_EMAIL')
    await mail.sendLater(new VerifyEmailNotification(user, token))

    return authToken
  }

  async requestEmail(user: User) {
    if (user.isEmailVerified) {
      throw new Exception('Your email is already verified.', {
        status: 400,
      })
    }

    const existingToken = await this.tokenRepo.canRequestToken(user, 'VERIFY_EMAIL')
    if (existingToken) {
      throw new Exception('You can only request a verification email every 24 hours.', {
        status: 429,
      })
    }

    const token = await this.tokenRepo.generateToken(user, 'VERIFY_EMAIL')
    await mail.sendLater(new VerifyEmailNotification(user, token))
  }

  async verifyEmail(token: string, auth: User) {
    const user = await this.tokenRepo.getTokenUser(token, 'VERIFY_EMAIL')
    const isMatch = user?.id === auth?.id

    if (!user || !isMatch) {
      throw new Exception('Invalid token or token does not belong to the authenticated user.', {
        status: 401,
      })
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
  }
}
