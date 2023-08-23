import { randomUUID } from 'crypto';
import { Account } from 'src/resources/accounts/entities/account.entity';
import { accountDummy } from 'src/resources/accounts/dummy/accountDummy';
import { AccountNotification } from 'src/resources/account_notifications/entities/account-notification.entity';
import { Bookmark } from 'src/resources/bookmarks/entities/bookmark.entity';
import { bookmarkStub } from 'src/resources/bookmarks/stub/bookmark-stub';
import { Chat } from 'src/resources/chats/entities/chat.entity';
import { PostComment } from 'src/resources/comments/entities/post-comment.entity';
import { Follow } from 'src/resources/follow/entities/follow.entity';
import { ChatMessage } from 'src/resources/messages/entities/chat-message.entity';
import { Post } from 'src/resources/posts/entities/post.entity';
import { Tag } from 'src/resources/tags/entities/tag.entity';
import { VerificationCode } from 'src/resources/verification_codes/entities/code.entity';
import { Repository } from 'typeorm';
import { TemporaryAccount } from 'src/resources/accounts/entities/temporary-account.entity';

type Entities =
  | typeof Account
  | typeof TemporaryAccount
  | typeof Tag
  | typeof Post
  | typeof VerificationCode
  | typeof PostComment
  | typeof Bookmark
  | typeof Follow
  | typeof AccountNotification
  | typeof ChatMessage
  | typeof Chat;

const stubs = (entity: Entities, id?: string) => {
  const entityID = id || randomUUID();

  const entities = {
    Account: { id: entityID, ...accountDummy() },
    TemporaryAccount: { id: entityID, ...accountDummy() },
    Bookmark: { id: entityID, ...bookmarkStub() },
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

  jest.spyOn(repository, 'count').mockResolvedValue(1);

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
    count: () => 1,
  };

  jest
    .spyOn(repository, 'createQueryBuilder' as any)
    .mockImplementation(() => createQueryBuilder);
}
