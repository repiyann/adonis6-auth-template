import User from '#models/user'
import env from '#start/env'
import { BaseMail } from '@adonisjs/mail'

export default class VerifyEmailNotification extends BaseMail {
  constructor(
    private user: User,
    private token: string
  ) {
    super()
  }

  from = 'noreply@yourapp.com'
  subject = 'Please Verify Your Email'

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    const verificationLink = `${env.get('BACKEND_DOMAIN')}/verify-email/${this.token}`

    this.message.to(this.user.email).html(`
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
              <h1>Email Verification Request</h1>
            </div>
            <div class="content">
              <p>Hi ${this.user.fullName},</p>
              <p>Thank you for registering with us! To complete your registration, please verify your email address by clicking the button below:</p>
              <a href="${verificationLink}" class="button">Verify Your Email</a>
              <p>If you didn't create an account with us, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>Need help? Contact our support team at <a href="mailto:support@yourapp.com">support@yourapp.com</a>.</p>
            </div>
          </div>
        </body>
      </html>
    `)
  }
}
