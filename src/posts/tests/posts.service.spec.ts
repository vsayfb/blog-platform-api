import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Account } from 'src/accounts/entities/account.entity';
import { accountStub } from 'src/accounts/tests/stub/account.stub';
import { mockRepository } from 'src/helpers/mockRepository';
import { Post } from '../entities/post.entity';
import { PostsService } from '../posts.service';
import { postStub } from '../stub/post-stub';

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getRepositoryToken(Post), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  describe('create', () => {
    describe('when create is called', () => {
      let result: Post;
      const authorID = randomUUID();
      let dto = postStub();

      beforeEach(async () => {
        result = await service.create(authorID, dto);
      });

      it('should return a post', () => {
        console.log(result);

        expect(result).toEqual({
          author: { id: authorID },
          ...dto,
          url: expect.any(String),
        });
      });
    });
  });
});
