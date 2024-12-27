import Roles from '#enums/roles'
import Tables from '#enums/tables'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = Tables.ROLES

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 50).notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.defer(async (query) => {
      await query.table(this.tableName).multiInsert([
        {
          id: Roles.USER,
          name: 'User',
        },
        {
          id: Roles.ADMIN,
          name: 'Admin',
        },
      ])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
