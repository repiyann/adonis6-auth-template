import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
// import stringHelpers from '@adonisjs/core/helpers/string'
import { randomUUID } from 'node:crypto'

// type TokenType = 'PASSWORD_RESET' | 'VERIFY_EMAIL'
// type RelationNameType = 'passwordResetTokens' | 'verifyEmailTokens'

export default class Token extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string | null

  @column()
  declare type: string

  @column()
  declare token: string

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @beforeCreate()
  static assignUuid(token: Token) {
    token.id = randomUUID()
  }

  // public static async generateVerifyEmailToken(user: User) {
  //   const token = stringHelpers.generateRandom(64)

  //   const record = await user.related('tokens').create({
  //     type: 'VERIFY_EMAIL',
  //     expiresAt: DateTime.now().plus({ hour: 24 }),
  //     token,
  //   })

  //   return record.token
  // }

  // public static async generatePasswordResetToken(user: User | null) {
  //   if (!user) return null

  //   const lastResetRequest = await Token.query()
  //     .where('userId', user.id)
  //     .where('type', 'PASSWORD_RESET')
  //     .where('createdAt', '>', DateTime.now().minus({ minutes: 15 }).toSQL())
  //     .first()
  //   if (lastResetRequest) {
  //     throw new Error('You can only request a password reset every 15 minutes.')
  //   }

  //   const token = stringHelpers.generateRandom(64)
  //   const record = await user.related('tokens').create({
  //     type: 'PASSWORD_RESET',
  //     expiresAt: DateTime.now().plus({ minute: 15 }),
  //     token,
  //   })

  //   return record.token
  // }

  // public static async expireTokens(user: User, relationName: RelationNameType) {
  //   await user.related(relationName).query().update({
  //     expiresAt: DateTime.now(),
  //   })
  // }

  // public static async getTokenUser(token: string, type: TokenType) {
  //   const record = await Token.query()
  //     .preload('user')
  //     .where('token', token)
  //     .where('type', type)
  //     .where('expiresAt', '>', DateTime.now().toSQL())
  //     .orderBy('createdAt', 'desc')
  //     .first()

  //   return record?.user
  // }

  // public static async verify(token: string, type: TokenType) {
  //   const record = await Token.query()
  //     .where('expiresAt', '>', DateTime.now().toSQL())
  //     .where('token', token)
  //     .where('type', type)
  //     .first()

  //   return !!record
  // }
}
