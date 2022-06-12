import { randomUUID } from 'crypto';
import { postStub } from '../stub/post-stub';

export const PostsService = jest.fn().mockReturnValue({
  create: jest
    .fn()
    .mockResolvedValue({ ...postStub(), author: { id: randomUUID() } }),
});
