import { uploadProfileResultStub } from 'src/uploads/stub/upload-profile.stub';
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
  delete: jest.fn((id: string) =>
    Promise.resolve({ id, message: 'Post deleted.' }),
  ),
  getOneByID: jest.fn((id: string) =>
    Promise.resolve({ data: postStub(), message: 'A post find.' }),
  ),
  update: jest.fn((id: string) =>
    Promise.resolve({ data: postStub(), message: 'A post find.' }),
  ),
  getOne: jest.fn((id: string) =>
    Promise.resolve({ data: postStub(), message: 'A post find.' }),
  ),
  changePostStatus: jest.fn((id: string) =>
    Promise.resolve({ id, message: 'Changed post status.', published: true }),
  ),
  saveTitleImage: jest
    .fn()
    .mockResolvedValue({ data: uploadProfileResultStub.newImage, message: 'A image was uploaded.' }),
});
