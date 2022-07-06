import { uploadProfileResultStub } from 'src/uploads/stub/upload-profile.stub';
import { Post } from '../entities/post.entity';
import { postStub } from '../stub/post-stub';

export const PostsService = jest.fn().mockReturnValue({
  create: jest
    .fn()
    .mockResolvedValue({ data: postStub(), message: 'A post find.' }),
  getAll: jest
    .fn()
    .mockResolvedValue({ data: [postStub()], message: 'Posts received.' }),
  getMyPosts: jest
    .fn()
    .mockResolvedValue({ data: [postStub()], message: 'Posts received.' }),
  delete: jest.fn((post: Post) =>
    Promise.resolve({ id: post.id, message: 'Post deleted.' }),
  ),
  getOneByID: jest.fn((id: string) =>
    Promise.resolve({ data: postStub(), message: 'A post find.' }),
  ),
  update: jest.fn((post: Post) =>
    Promise.resolve({ data: postStub(), message: 'A post find.' }),
  ),
  getOne: jest.fn((id: string) =>
    Promise.resolve({ data: postStub(), message: 'A post find.' }),
  ),
  changePostStatus: jest.fn((post: Post) =>
    Promise.resolve({
      id: post.id,
      message: 'Changed post status.',
      published: !post.published,
    }),
  ),
  saveTitleImage: jest.fn().mockResolvedValue({
    data: uploadProfileResultStub.newImage,
    message: 'A image was uploaded.',
  }),
});
