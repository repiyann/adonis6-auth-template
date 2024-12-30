import Role from '#models/role'
import BaseRepository from './_base_repository.js'

export default class RoleRepository extends BaseRepository<typeof Role> {
  constructor() {
    super(Role)
  }

  async roles() {
    return this.model.query().orderBy('name')
  }
}
