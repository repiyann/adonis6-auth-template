import AuthRepository from '#repositories/auth.repository'
import { inject } from '@adonisjs/core'
import mail from '@adonisjs/mail/services/main'
import TokenRepository from '#repositories/token.repository'
import PasswordResetNotification from '#mails/password_reset_notification'
import { Exception } from '@adonisjs/core/exceptions'

@inject()
export default class PasswordResetService {
  constructor(
    protected authRepo: AuthRepository,
    protected tokenRepo: TokenRepository
  ) {}

  async sendResetEmail(email: string) {
    const user = await this.authRepo.findBy('email', email)
    if (!user) {
      throw new Exception('No user found with this email address.', {
        status: 404,
      })
    }

    const token = await this.tokenRepo.generateToken(user, 'PASSWORD_RESET')
    await mail.sendLater(new PasswordResetNotification(user, token))
  }

  async verifyToken(token: string) {
    const isValid = await this.tokenRepo.verify(token, 'PASSWORD_RESET')
    if (!isValid) {
      throw new Exception('Invalid or expired token.', {
        status: 401,
      })
    }
  }

  async resetPassword(token: string, password: string) {
    const user = await this.tokenRepo.getTokenUser(token, 'PASSWORD_RESET')
    if (!user) {
      throw new Exception('The user does not exist or the token has expired.', {
        status: 401,
      })
    }

    await user.merge({ password }).save()
    await this.tokenRepo.expireTokens(user, 'passwordResetTokens')
  }
}
