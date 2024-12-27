import { LucidModel, ModelAttributes, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { ExtractModelRelations } from '@adonisjs/lucid/types/relations'

export default abstract class BaseRepository<T extends LucidModel> {
  protected model

  constructor(model: T) {
    this.model = model
  }

  private async preloadQuery(
    query: ModelQueryBuilderContract<T>,
    preload: ExtractModelRelations<InstanceType<T>>[]
  ) {
    preload.forEach((relation) => query.preload(relation))
  }

  public async create(createData: Partial<ModelAttributes<InstanceType<T>>>) {
    return await this.model.create(createData)
  }

  public async indexPaginated(
    page: number = 1,
    perPage: number = 10,
    preload: ExtractModelRelations<InstanceType<T>>[] = []
  ) {
    const query = this.model.query()
    this.preloadQuery(query, preload)

    return await query.paginate(page, perPage)
  }

  public async index(preload: ExtractModelRelations<InstanceType<T>>[] = []) {
    const query = this.model.query()
    this.preloadQuery(query, preload)

    return query
  }

  public async show(id: string, preload: ExtractModelRelations<InstanceType<T>>[] = []) {
    const query = this.model.query().where('id', id)
    this.preloadQuery(query, preload)

    return await query.first()
  }

  public async update(id: string, updateData: Partial<ModelAttributes<InstanceType<T>>>) {
    const modelInstance = await this.show(id)
    if (modelInstance) {
      modelInstance.merge(updateData)
      return await modelInstance.save()
    }

    return null
  }

  public async destroy(id: string) {
    const modelInstance = await this.show(id)
    if (modelInstance) {
      await modelInstance.delete()
      return true
    }

    return false
  }
}
