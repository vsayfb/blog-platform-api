import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { mockRepository } from 'src/helpers/mockRepository';
import { UploadsService } from 'src/uploads/uploads.service';
import { Post } from '../entities/post.entity';
import { PostsService } from '../posts.service';
import { postStub } from '../stub/post-stub';

jest.mock('src/uploads/uploads.service');

describe('PostsService', () => {
  let service: PostsService;
  let uploadsService: UploadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        UploadsService,
        { provide: getRepositoryToken(Post), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    uploadsService = module.get<UploadsService>(UploadsService);
  });

  describe('create', () => {
    describe('when create is called', () => {
      let result: Post;
      const authorID = randomUUID();
      let dto = postStub();
      let file: Express.Multer.File | null = null;

      describe('when file is null', () => {
        beforeEach(async () => {
          result = await service.create(authorID, dto, file);
        });

        it('should return a post with null [titleImage] field', () => {
          expect(result.title).toBe(dto.title);
          expect(result.titleImage).toBeNull();
        });
      });

      describe('when file is not null', () => {
        beforeEach(async () => {
          result = await service.create(authorID, dto, {
            titleImage: '',
          } as any);
        });

        it('should return a post with not null [titleImage] field', () => {

          expect(result.title).toBe(dto.title);
          expect(result.titleImage).not.toBeNull();
        });
      });
    });
  });
});
