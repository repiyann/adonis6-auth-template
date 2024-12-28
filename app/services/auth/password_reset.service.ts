import Token from '#models/token'
import AuthRepository from '#repositories/auth.repository'
import { inject } from '@adonisjs/core'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import CustomErrorException from '#exceptions/custom_error_exception'

@inject()
export default class PasswordResetService {
  constructor(protected repository: AuthRepository) {}

  async sendResetEmail(email: string) {
    const user = await this.repository.findBy('email', email)
    if (!user) {
      throw new CustomErrorException('No user found with this email address.', {
        status: 404,
      })
    }

    const token = await Token.generatePasswordResetToken(user)
    const resetLink = `${env.get('DOMAIN')}/auth/password/reset/${token}`

    await mail.sendLater((message) => {
      message.from('noreply@yourapp.com').to(user.email).subject('Reset Your Password').html(`
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f9;
                  margin: 0;
                  padding: 0;
                }
                .container {
                  width: 100%;
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header {
                  text-align: center;
                  padding: 20px;
                  background-color: #4CAF50;
                  color: white;
                  border-radius: 8px 8px 0 0;
                }
                .content {
                  padding: 20px;
                  text-align: center;
                }
                .button {
                  background-color: #4CAF50;
                  color: white;
                  padding: 10px 20px;
                  text-decoration: none;
                  font-size: 16px;
                  border-radius: 5px;
                  margin-top: 20px;
                  display: inline-block;
                }
                .footer {
                  text-align: center;
                  padding: 10px;
                  font-size: 12px;
                  color: #777;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                  <p>Hi ${user.fullName},</p>
                  <p>We received a request to reset your password. If you made this request, you can reset your password by clicking the button below:</p>
                  <a href="${resetLink}" class="button">Reset Your Password</a>
                  <p>If you didn't request a password reset, please ignore this email.</p>
                </div>
                <div class="footer">
                  <p>Need help? Contact our support team at <a href="mailto:support@yourapp.com">support@yourapp.com</a>.</p>
                </div>
              </div>
            </body>
          </html>
        `)
    })
  }

  async verifyToken(token: string) {
    const isValid = await Token.verify(token)
    if (!isValid) {
      throw new CustomErrorException('Invalid or expired token.', {
        status: 401,
      })
    }

    return true
  }

  async resetPassword(token: string, password: string) {
    const user = await Token.getPasswordResetUser(token)
    if (!user) {
      throw new CustomErrorException('The user does not exist or the token has expired.', {
        status: 401,
      })
    }

    await user.merge({ password }).save()
    await Token.expirePasswordResetTokens(user)
  }
}
