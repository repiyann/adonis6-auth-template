import Token from '#models/token'
import BaseRepository from './_base_repository.js'
import { DateTime } from 'luxon'
import stringHelpers from '@adonisjs/core/helpers/string'
import User from '#models/user'

type TokenType = 'PASSWORD_RESET' | 'VERIFY_EMAIL'
type RelationNameType = 'passwordResetTokens' | 'verifyEmailTokens'

export default class TokenRepository extends BaseRepository<typeof Token> {
  constructor() {
    super(Token)
  }

  private getTokenTimeLimit(type: TokenType) {
    if (type === 'VERIFY_EMAIL') {
      return { hours: 24 }
    } else if (type === 'PASSWORD_RESET') {
      return { minutes: 15 }
    }

    throw new Error(`Unknown token type: ${type}`)
  }

  async canRequestToken(user: User, type: TokenType) {
    return await this.model
      .query()
      .where('userId', user.id)
      .where('type', type)
      .where('createdAt', '>', DateTime.now().minus(this.getTokenTimeLimit(type)).toSQL())
      .first()
  }

  async generateToken(user: User, type: TokenType) {
    const token = stringHelpers.generateRandom(64)
    const expirationTime = DateTime.now().plus(this.getTokenTimeLimit(type))

    const record = await user.related('tokens').create({
      type,
      expiresAt: expirationTime,
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
