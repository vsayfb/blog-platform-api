import { BaseEntity, DeepPartial, Repository } from 'typeorm';

export abstract class BaseRepository<T extends BaseEntity> {
  constructor(private repository: Repository<T>) {}

  async createEntity(data: DeepPartial<T>): Promise<T> {
    return await this.repository.save(data);
  }
}
