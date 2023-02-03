import { uploadImageStub } from 'src/uploads/stub/upload-image.stub';
import { UpdatePostDto } from '../../request-dto/update-post.dto';
import { Post } from '../../entities/post.entity';
import { postStub } from '../../stub/post-stub';

export const PostsService = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(postStub()),

  getAll: jest.fn().mockResolvedValue([postStub()]),

  getMyPosts: jest.fn().mockResolvedValue([postStub()]),

  delete: jest.fn().mockResolvedValue(postStub().id),

  getOneByID: jest.fn().mockResolvedValue(postStub()),

  update: jest.fn((post: Post, updatePostDto: UpdatePostDto) =>
    Promise.resolve({ ...post, ...updatePostDto }),
  ),

  getOne: jest.fn().mockResolvedValue(postStub()),

  changePostStatus: jest.fn((post: Post) =>
    Promise.resolve({
      id: post.id,
      published: !post.published,
    }),
  ),

  updateTitleImage: jest.fn().mockResolvedValue(uploadImageStub().newImage),
});
