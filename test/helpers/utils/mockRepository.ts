import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { Account } from 'src/resources/accounts/entities/account.entity';
import { accountDummy } from 'src/resources/accounts/dummy/accountDummy';
import { TemporaryAccount } from 'src/resources/accounts/entities/temporary-account.entity';

type Entities = typeof TemporaryAccount | typeof Account;

const stubs = (entity: Entities, id?: string) => {
  const entityID = id || randomUUID();

  const entities = {
    Account: { id: entityID, ...accountDummy() },
    TemporaryAccount: { id: entityID, ...accountDummy() },
  };

  return entities[entity.name];
};

export function mockRepository<T>(
  repository: Repository<T>,
  entity: Entities,
): void {
  jest
    .spyOn(repository, 'save')
    .mockImplementation((dto) => Promise.resolve({ ...stubs(entity), ...dto }));

  jest.spyOn(repository, 'findOne').mockResolvedValue(stubs(entity));

  jest.spyOn(repository, 'findOneBy').mockResolvedValue(stubs(entity));

  jest.spyOn(repository, 'findBy').mockResolvedValue([stubs(entity)]);

  jest.spyOn(repository, 'find').mockResolvedValue([stubs(entity)]);

  jest
    .spyOn(repository, 'remove')
    .mockImplementation((dto) => Promise.resolve(dto));

  const createQueryBuilder = {
    where: () => createQueryBuilder,
    andWhere: () => createQueryBuilder,
    leftJoinAndSelect: () => createQueryBuilder,
    leftJoin: () => createQueryBuilder,
    loadRelationCountAndMap: () => createQueryBuilder,
    getOne: () => stubs(entity),
    getMany: () => [stubs(entity)],
  };

  jest
    .spyOn(repository, 'createQueryBuilder' as any)
    .mockImplementation(() => createQueryBuilder);
}
