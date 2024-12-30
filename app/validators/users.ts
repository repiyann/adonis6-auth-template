import vine from '@vinejs/vine'

export const roleValidator = vine.compile(
  vine.object({
    roleId: vine.number().unique({ table: 'roles', column: 'id' }),
  })
)
