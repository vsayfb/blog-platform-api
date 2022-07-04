import { NotFoundException } from '@nestjs/common';
import { accountStub } from 'src/accounts/test/stub/account.stub';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockRepository } from 'src/lib/mockRepository';
import { TagsService } from 'src/tags/tags.service';
import { UploadsService } from 'src/uploads/uploads.service';
import { Post } from '../entities/post.entity';
import { PostsService } from '../posts.service';
import { postStub } from '../stub/post-stub';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { jwtPayloadStub } from 'src/auth/stub/jwt-payload.stub';

jest.mock('src/uploads/uploads.service');
jest.mock('src/tags/tags.service');

describe('PostsService', () => {
  let postsService: PostsService;
  let postsRepository: Repository<Post>;
  let uploadsService: UploadsService;
  let tagsService: TagsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        UploadsService,
        TagsService,
        { provide: getRepositoryToken(Post), useClass: Repository },
      ],
    }).compile();

    postsService = module.get<PostsService>(PostsService);
    postsRepository = module.get<Repository<Post>>(getRepositoryToken(Post));
    uploadsService = module.get<UploadsService>(UploadsService);
    tagsService = module.get<TagsService>(TagsService);

    mockRepository(postsRepository, Post);
  });

  describe('create', () => {
    describe('when create is called', () => {
      let result: { data: Post; message: string };
      const authorID = accountStub().id;
      const dto = postStub();

      beforeEach(async () => {
        result = await postsService.create({ authorID, dto });
      });

      test('calls the postsRepository.save method', () => {
        expect(postsRepository.save).toHaveBeenCalled();
      });

      it('should return the created post', () => {
        expect(result.data.title).toBe(dto.title);
      });
    });
  });

  describe('getAll', () => {
    it('should return the array of posts which published', async () => {
      const { data } = await postsService.getAll();

      expect(data).toEqual([postStub()]);

      expect(postsRepository.find).toHaveBeenCalledWith({
        where: { published: true },
      });
    });
  });

  describe('getOne', () => {
    describe('when getOne is called', () => {
      describe('scenario : the post not found', () => {
        it('should throw NotFoundException', async () => {
          const { url } = postStub();

          jest.spyOn(postsRepository, 'findOne').mockResolvedValueOnce(null);

          await expect(postsService.getOne(url)).rejects.toThrow(
            NotFoundException,
          );

          expect(postsRepository.findOne).toHaveBeenCalledWith({
            where: { url, published: true },
          });
        });
      });

      describe('scenario : the post found', () => {
        it('should return a post', async () => {
          const { url } = postStub();

          const { data } = await postsService.getOne(url);

          expect(data).toEqual(data);

          expect(postsRepository.findOne).toHaveBeenCalledWith({
            where: { url, published: true },
          });
        });
      });
    });
  });

  describe('getOneByID', () => {
    describe('when getOneByID is called', () => {
      let id = randomUUID();
      let result: { data: Post; message: string };

      beforeEach(async () => {
        result = await postsService.getOneByID(id);
      });

      test('calls the postsRepository.findOne method', () => {
        expect(postsRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      });

      it('should return a post', () => {
        expect(result).toEqual({
          data: postStub(),
          message: expect.any(String),
        });
      });
    });
  });

  describe('saveTitleImage', () => {
    describe('when saveTitleImage is called', () => {
      let image: Express.Multer.File;
      let result: { data: string; message: string };

      beforeEach(async () => {
        result = await postsService.saveTitleImage(image);
      });

      test('calls the uploadsService.uploadImage method', () => {
        expect(uploadsService.uploadImage).toHaveBeenCalledWith(image);
      });

      it('should return the uploaded image url', () => {
        expect(result).toEqual({
          data: expect.any(String),
          message: expect.any(String),
        });
      });
    });
  });

  describe('getMyPosts', () => {
    describe('when getMyPosts is called', () => {
      const authorID = jwtPayloadStub.sub;
      let result: { data: Post[]; message: string };

      beforeEach(async () => {
        result = await postsService.getMyPosts(authorID);
      });

      test('calls the postsRepository.find method', () => {
        expect(postsRepository.find).toHaveBeenCalledWith({
          where: { author: { id: authorID } },
        });
      });

      it('should return an array of posts', () => {
        expect(result).toEqual({
          data: [postStub()],
          message: expect.any(String),
        });
      });
    });
  });
});
