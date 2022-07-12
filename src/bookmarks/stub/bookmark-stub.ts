import { accountStub } from 'src/accounts/test/stub/account.stub';
import { Post } from 'src/posts/entities/post.entity';
import { postStub } from 'src/posts/stub/post-stub';
import { Bookmark } from '../entities/bookmark.entity';

export const bookmarkStub = (): Bookmark => ({
  id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb3f',
  post: postStub() as unknown as Post,
  account: accountStub(),
  createdAt: undefined,
  updatedAt: undefined,
});
