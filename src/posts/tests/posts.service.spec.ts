import { NotFoundException } from '@nestjs/common';
import { accountStub } from 'src/accounts/tests/stub/account.stub';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { mockRepository } from 'src/lib/mockRepository';
import { TagsService } from 'src/tags/tags.service';
import { UploadsService } from 'src/uploads/uploads.service';
import { Post } from '../entities/post.entity';
import { PostsService } from '../posts.service';
import { postStub } from '../stub/post-stub';

jest.mock('src/uploads/uploads.service');
jest.mock('src/tags/tags.service');

describe('PostsService', () => {
  let postsService: PostsService;
  let uploadsService: UploadsService;
  let tagsService: TagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        UploadsService,
        TagsService,
        { provide: getRepositoryToken(Post), useValue: mockRepository },
      ],
    }).compile();

    postsService = module.get<PostsService>(PostsService);
    uploadsService = module.get<UploadsService>(UploadsService);
    tagsService = module.get<TagsService>(TagsService);
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
        expect(mockRepository.save).toHaveBeenCalled();
      });

      it('should return the created post', async () => {
        expect(result.data.title).toBe(dto.title);
      });
    });
  });

  describe('getAll', () => {
    it('should return the array of posts which published', async () => {
      expect(await postsService.getAll()).toEqual(expect.any(Array));

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { published: true },
      });
    });
  });

  describe('getPost', () => {
    describe('scenario : the post not found', () => {
      it('should throw NotFoundException', async () => {
        const { url } = postStub();

        jest.spyOn(mockRepository, 'findOne').mockResolvedValueOnce(null);

        await expect(postsService.getPost(url)).rejects.toThrow(
          NotFoundException,
        );

        expect(mockRepository.findOne).toHaveBeenCalledWith({
          where: { url, published: true },
        });
      });
    });

    describe('scenario : the post found', () => {
      it('should throw NotFoundException', async () => {
        const post = postStub();

        jest.spyOn(mockRepository, 'findOne').mockResolvedValueOnce(post);

        expect(await postsService.getPost(post.url)).toEqual(post);

        expect(mockRepository.findOne).toHaveBeenCalledWith({
          where: { url: post.url, published: true },
        });
      });
    });
  });
});
