import Token from '#models/token'
import BaseRepository from './_base_repository.js'
import { DateTime } from 'luxon'
import stringHelpers from '@adonisjs/core/helpers/string'
import User from '#models/user'
import CustomErrorException from '#exceptions/custom_error_exception'

type TokenType = 'PASSWORD_RESET' | 'VERIFY_EMAIL'
type RelationNameType = 'passwordResetTokens' | 'verifyEmailTokens'

export default class TokenRepository extends BaseRepository<typeof Token> {
  constructor() {
    super(Token)
  }

  async generateVerifyEmailToken(user: User) {
    const lastResetRequest = await this.model
      .query()
      .where('userId', user.id)
      .where('type', 'VERIFY_EMAIL')
      .where('createdAt', '>', DateTime.now().minus({ hours: 24 }).toSQL())
      .first()
    if (lastResetRequest) {
      throw new CustomErrorException('You can only request a verification email every 24 hours.', {
        status: 409,
      })
    }

    const token = stringHelpers.generateRandom(64)
    const record = await user.related('tokens').create({
      type: 'VERIFY_EMAIL',
      expiresAt: DateTime.now().plus({ hour: 24 }),
      token,
    })

    return record.token
  }

  async generatePasswordResetToken(user: User | null) {
    if (!user) return null

    const lastResetRequest = await this.model
      .query()
      .where('userId', user.id)
      .where('type', 'PASSWORD_RESET')
      .where('createdAt', '>', DateTime.now().minus({ minutes: 15 }).toSQL())
      .first()
    if (lastResetRequest) {
      throw new CustomErrorException('You can only request a password reset every 15 minutes.', {
        status: 409,
      })
    }

    const token = stringHelpers.generateRandom(64)
    const record = await user.related('tokens').create({
      type: 'PASSWORD_RESET',
      expiresAt: DateTime.now().plus({ minute: 15 }),
      token,
    })

    return record.token
  }

  async expireTokens(user: User, relationName: RelationNameType) {
    await user.related(relationName).query().update({
      expiresAt: DateTime.now(),
    })
  }

  async getTokenUser(token: string, type: TokenType) {
    const record = await this.model
      .query()
      .preload('user')
      .where('token', token)
      .where('type', type)
      .where('expiresAt', '>', DateTime.now().toSQL())
      .orderBy('createdAt', 'desc')
      .first()

    return record?.user
  }

  async verify(token: string, type: TokenType) {
    const record = await this.model
      .query()
      .where('expiresAt', '>', DateTime.now().toSQL())
      .where('token', token)
      .where('type', type)
      .first()

    return !!record
  }
}
