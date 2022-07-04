import { Post } from './../posts/entities/post.entity';
import { Tag } from './../tags/entities/tag.entity';
import { Account } from './../accounts/entities/account.entity';
import { randomUUID } from 'crypto';
import { accountStub } from '../accounts/test/stub/account.stub';
import { postStub } from 'src/posts/stub/post-stub';
import { tagStub } from 'src/tags/stub/tag.stub';
import { Repository } from 'typeorm';
import { Code } from 'src/codes/entities/code.entity';
import { codeStub } from 'src/codes/stub/code.stub';

type Entities = typeof Account | typeof Tag | typeof Post | typeof Code;

const stubs = (entity: Entities, id?: string) => {
  const entities = {
    Tag: { id: id || randomUUID(), ...tagStub() },
    Account: { id: id || randomUUID(), ...accountStub() },
    Post: { id: id || randomUUID(), ...postStub() },
    Code: { ...codeStub },
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
