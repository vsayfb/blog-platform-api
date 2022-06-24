import { Test, TestingModule } from '@nestjs/testing';
import { JwtPayload } from 'src/lib/jwt.payload';
import { Post } from '../entities/post.entity';
import { PostsController } from '../posts.controller';
import { PostsService } from '../posts.service';
import { postStub } from '../stub/post-stub';

jest.mock('../posts.service');

describe('PostsController', () => {
  let controller: PostsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [PostsService],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  describe('when create method is called', () => {
    let result: Post;
    let account: JwtPayload = {
      username: 'fooo',
      iat: 12314,
      image: '123123',
      sub: '12312321',
    };
    let dto = postStub();

    beforeEach(async () => {
      result = await controller.create(account, dto, '' as any);
    });

    test('should return a post', () => {
      expect(result).toEqual({
        author: { id: expect.any(String) },
        ...dto,
      });
    });
  });
});
