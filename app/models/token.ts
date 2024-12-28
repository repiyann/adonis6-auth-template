import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import stringHelpers from '@adonisjs/core/helpers/string'
import { randomUUID } from 'node:crypto'

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

  public static async generatePasswordResetToken(user: User | null) {
    if (!user) return null

    const lastResetRequest = await Token.query()
      .where('userId', user.id)
      .where('type', 'PASSWORD_RESET')
      .where('createdAt', '>', DateTime.now().minus({ minutes: 15 }).toSQL())
      .first()
    if (lastResetRequest) {
      throw new Error('You can only request a password reset every 15 minutes.')
    }

    const token = stringHelpers.generateRandom(64)
    const record = await user.related('tokens').create({
      type: 'PASSWORD_RESET',
      expiresAt: DateTime.now().plus({ minute: 15 }),
      token,
    })

    return record.token
  }

  public static async expirePasswordResetTokens(user: User) {
    await user.related('passwordResetTokens').query().update({
      expiresAt: DateTime.now(),
    })
  }

  public static async getPasswordResetUser(token: string) {
    const record = await Token.query()
      .preload('user')
      .where('token', token)
      .where('expiresAt', '>', DateTime.now().toSQL())
      .orderBy('createdAt', 'desc')
      .first()

    return record?.user
  }

  public static async verify(token: string) {
    const record = await Token.query()
      .where('expiresAt', '>', DateTime.now().toSQL())
      .where('token', token)
      .first()

    return !!record
  }
}
