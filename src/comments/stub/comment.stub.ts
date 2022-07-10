import { accountStub } from 'src/accounts/test/stub/account.stub';
import { postStub } from 'src/posts/stub/post-stub';
import { Comment } from '../entities/comment.entity';

export const commentStub = (): Comment => ({
  id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dce4f',
  author: accountStub(),
  content: 'comment-content',
  post: postStub() as any,
  createdAt: undefined,
  updatedAt: undefined,
});
