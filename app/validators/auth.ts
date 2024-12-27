import vine from '@vinejs/vine'

const password = vine.string().minLength(8).maxLength(16)

export const registerValidator = vine.compile(
  vine.object({
    fullName: vine.string().minLength(3).maxLength(64),
    email: vine
      .string()
      .email()
      .normalizeEmail()
      .unique(async (query, value) => {
        const match = await query.from('users').select('id').where('email', value).first()
        return !match
      }),
    roleId: vine.number().optional(),
    password,
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password,
  })
)
