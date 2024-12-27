import Roles from '#enums/roles'
import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await User.create({
      roleId: Roles.ADMIN,
      fullName: 'Super Admin',
      email: 'admin@admin.com',
      password: 'wadaw1234',
    })
  }
}
