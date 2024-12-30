import Roles from '#enums/roles'
import User from '#models/user'
import AuthRepository from '#repositories/auth.repository'
import RoleRepository from '#repositories/role.repository'
import { roleValidator } from '#validators/users'
import { AccessToken } from '@adonisjs/auth/access_tokens'
import { inject } from '@adonisjs/core'
import { Exception } from '@adonisjs/core/exceptions'
import { Infer } from '@vinejs/vine/types'

type RolePayload = Infer<typeof roleValidator>

@inject()
export default class UsersService {
  constructor(
    protected userRepo: AuthRepository,
    protected roleRepo: RoleRepository
  ) {}

  async indexUsers() {
    const users = await this.userRepo.users()
    const roles = await this.roleRepo.roles()

    return { users, roles }
  }

  async manageRoles(role: RolePayload, id: string, auth: User, token: AccessToken) {
    const user = await this.userRepo.show(id)
    if (!user) {
      throw new Exception('User is not found in database', {
        status: 404,
      })
    }

    const isAuthUser = user.id === auth?.id
    if (isAuthUser && user.roleId !== Roles.ADMIN) {
      await User.accessTokens.delete(user, token.identifier)
    }

    if (user.fullName === 'Super Admin' && user.roleId === 2) {
      throw new Exception('You cant change Super Admin role')
    }

    await user.merge(role).save()
  }

  async deleteUser(id: string, auth: User, token: AccessToken) {
    const user = await this.userRepo.show(id)
    if (!user) {
      throw new Exception('User is not found in database', {
        status: 404,
      })
    }

    const isAuthUser = user.id === auth?.id
    if (isAuthUser) {
      await User.accessTokens.delete(user, token.identifier)
    }

    await user.delete()
  }
}
