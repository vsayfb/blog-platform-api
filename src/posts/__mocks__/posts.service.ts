import { uploadProfileResultStub } from 'src/uploads/stub/upload-profile.stub';
import { Post } from '../entities/post.entity';
import { PostMessages } from '../enums/post-messages';
import { postStub } from '../stub/post-stub';

export const PostsService = jest.fn().mockReturnValue({
  create: jest
    .fn()
    .mockResolvedValue({ data: postStub(), message: PostMessages.FOUND }),
  getAll: jest
    .fn()
    .mockResolvedValue({ data: [postStub()], message: PostMessages.ALL_FOUND }),
  getMyPosts: jest
    .fn()
    .mockResolvedValue({ data: [postStub()], message: PostMessages.ALL_FOUND }),
  delete: jest.fn((post: Post) =>
    Promise.resolve({ id: post.id, message: PostMessages.DELETED }),
  ),
  getOneByID: jest.fn((_id: string) =>
    Promise.resolve({ data: postStub(), message: PostMessages.FOUND }),
  ),
  update: jest.fn((_post: Post) =>
    Promise.resolve({ data: postStub(), message: PostMessages.UPDATED }),
  ),
  getOne: jest.fn((_id: string) =>
    Promise.resolve({ data: postStub(), message: PostMessages.FOUND }),
  ),
  changePostStatus: jest.fn((post: Post) =>
    Promise.resolve({
      id: post.id,
      message: PostMessages.UPDATED,
      published: !post.published,
    }),
  ),
  saveTitleImage: jest.fn().mockResolvedValue({
    data: uploadProfileResultStub.newImage,
    message: 'A image was uploaded.',
  }),
});
