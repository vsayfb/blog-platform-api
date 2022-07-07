import { randomUUID } from 'crypto';
import { postStub } from 'src/posts/stub/post-stub';
import { tagStub } from 'src/tags/stub/tag.stub';
import { Repository } from 'typeorm';
import { Code } from 'src/codes/entities/code.entity';
import { codeStub } from 'src/codes/stub/code.stub';
import { Account } from 'src/accounts/entities/account.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { Post } from 'src/posts/entities/post.entity';
import { accountStub } from 'src/accounts/test/stub/account.stub';

type Entities = typeof Account | typeof Tag | typeof Post | typeof Code;

const stubs = (entity: Entities, id?: string) => {
  const entityID = id || randomUUID();

  const entities = {
    Tag: { id: entityID, ...tagStub() },
    Account: { id: entityID, ...accountStub() },
    Post: { id: entityID, ...postStub() },
    Code: { id: entityID, ...codeStub },
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

  jest.spyOn(repository, 'find').mockResolvedValue([stubs(entity)]);

  jest
    .spyOn(repository, 'remove')
    .mockImplementation((dto) => Promise.resolve(dto));
}
