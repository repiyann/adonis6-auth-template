import AuthRepository from '#repositories/auth.repository'
import { inject } from '@adonisjs/core'
import mail from '@adonisjs/mail/services/main'
import CustomErrorException from '#exceptions/custom_error_exception'
import TokenRepository from '#repositories/token.repository'
import PasswordResetNotification from '#mails/password_reset_notification'

@inject()
export default class PasswordResetService {
  constructor(
    protected authRepo: AuthRepository,
    protected tokenRepo: TokenRepository
  ) {}

  async sendResetEmail(email: string) {
    const user = await this.authRepo.findBy('email', email)
    if (!user) {
      throw new CustomErrorException('No user found with this email address.', {
        status: 404,
      })
    }

    const token = await this.tokenRepo.generatePasswordResetToken(user)
    if (token) {
      await mail.sendLater(new PasswordResetNotification(user, token))
    }
  }

  async verifyToken(token: string) {
    const isValid = await this.tokenRepo.verify(token, 'PASSWORD_RESET')
    if (!isValid) {
      throw new CustomErrorException('Invalid or expired token.', {
        status: 401,
      })
    }

    return true
  }

  async resetPassword(token: string, password: string) {
    const user = await this.tokenRepo.getTokenUser(token, 'PASSWORD_RESET')
    if (!user) {
      throw new CustomErrorException('The user does not exist or the token has expired.', {
        status: 401,
      })
    }

    await user.merge({ password }).save()
    await this.tokenRepo.expireTokens(user, 'passwordResetTokens')
  }
}
