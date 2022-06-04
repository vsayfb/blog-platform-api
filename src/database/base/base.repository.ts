import { BaseEntity, DeepPartial, Repository } from 'typeorm';

export abstract class BaseRepository<T extends BaseEntity> {
  constructor(private repository: Repository<T>) {}

  async createEntity(data: DeepPartial<T>): Promise<T> {
    const result = await this.repository.save(data);

    const id = this.repository.getId(result);

    return this.repository.findOne(id);
  }
}
