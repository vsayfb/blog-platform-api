import { Account } from 'src/accounts/entities/account.entity';
import { accountStub } from 'src/accounts/test/stub/account.stub';
import { Post } from 'src/posts/entities/post.entity';
import { postStub } from 'src/posts/stub/post-stub';
import { Comment } from '../entities/comment.entity';

export const commentStub = (): Comment => ({
  id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dce4f',
  content: 'comment-content',
  post: postStub() as unknown as Post,
  created_at: '2022-07-18T12:55:25.513Z' as unknown as Date,
  updated_at: '2022-07-18T12:55:25.513Z' as unknown as Date,
  author: accountStub() as Account,
  parent: null,
  replies: [],
});
