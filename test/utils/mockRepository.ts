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
import { commentStub } from 'src/comments/stub/comment.stub';
import { Comment } from 'src/comments/entities/comment.entity';
import { bookmarkStub } from 'src/bookmarks/stub/bookmark-stub';
import { Bookmark } from 'src/bookmarks/entities/bookmark.entity';
import { Follow } from 'src/follow/entities/follow.entity';
import { followStub } from 'src/follow/stub/follow-stub';
import { Notification } from 'src/global/notifications/entities/notification.entity';
import { notificationStub } from 'src/global/notifications/stub/notification-stub';
import { Message } from '../../src/messages/entities/message.entity';
import { Chat } from '../../src/chats/entities/chat.entity';
import { messageStub } from '../../src/messages/stub/message-stub';
import { chatStub } from '../../src/chats/stub/chat-stub';
import { Expression } from 'src/expressions/entities/expression.entity';
import { expressionStub } from 'src/expressions/stub/expression-stub';

type Entities =
  | typeof Account
  | typeof Tag
  | typeof Post
  | typeof Code
  | typeof Comment
  | typeof Bookmark
  | typeof Follow
  | typeof Notification
  | typeof Message
  | typeof Chat
  | typeof Expression;

const stubs = (entity: Entities, id?: string) => {
  const entityID = id || randomUUID();

  const entities = {
    Tag: { id: entityID, ...tagStub() },
    Account: { id: entityID, ...accountStub() },
    Post: { id: entityID, ...postStub() },
    Comment: { id: entityID, ...commentStub() },
    Code: { id: entityID, ...codeStub() },
    Bookmark: { id: entityID, ...bookmarkStub() },
    Follow: { id: entityID, ...followStub() },
    Notification: { id: entityID, ...notificationStub() },
    Chat: { id: entityID, ...chatStub() },
    Message: { id: entityID, ...messageStub() },
    Expression: { id: entityID, ...expressionStub() },
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
