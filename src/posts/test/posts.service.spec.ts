import { NotFoundException } from '@nestjs/common';
import { accountStub } from 'src/accounts/test/stub/account.stub';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TagsService } from 'src/tags/tags.service';
import { UploadsService } from 'src/uploads/uploads.service';
import { Post } from '../entities/post.entity';
import { PostsService } from '../posts.service';
import { postStub } from '../stub/post-stub';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { jwtPayloadStub } from 'src/auth/stub/jwt-payload.stub';
import { UpdatePostDto } from '../dto/update-post.dto';
import { mockRepository } from '../../../test/utils/mockRepository';
import { CreatedPostDto } from '../dto/created-post.dto';
import { tagStub } from 'src/tags/stub/tag.stub';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatedPostDto } from '../dto/updated-post.dto';
import { PublicPostsDto } from '../dto/public-posts.dto';
import { PostDto } from '../dto/post.dto';
import { PostsDto } from '../dto/posts.dto';

jest.mock('src/uploads/uploads.service');
jest.mock('src/tags/tags.service');

describe('PostsService', () => {
  let postsService: PostsService;
  let postsRepository: Repository<Post>;
  let uploadsService: UploadsService;

  beforeEach(async () => {
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

    mockRepository(postsRepository, Post);
  });

  describe('create', () => {
    describe('when create is called', () => {
      let result: CreatedPostDto;

      const authorID = accountStub().id;

      const dto: CreatePostDto = {
        title: postStub().title,
        content: postStub().content,
      };

      beforeEach(async () => {
        // spyOn private methods
        jest
          .spyOn(PostsService.prototype, 'convertUrl' as any)
          .mockReturnValue('url');
        jest.spyOn(PostsService.prototype, 'setPostTags' as any);

        result = await postsService.create({
          authorID,
          dto,
        });
      });

      test('calls convertUrl method', () => {
        //@ts-ignore private method
        expect(postsService.convertUrl).toHaveBeenCalledWith(dto.title);
      });

      test('calls setPostTags method', () => {
        //@ts-ignore private method
        expect(postsService.setPostTags).toHaveBeenCalledWith(dto.tags);
      });

      test('calls postsRepository.save method', () => {
        expect(postsRepository.save).toHaveBeenCalledWith({
          content: dto.content,
          title: dto.title,
          url: expect.any(String),
          tags: expect.any(Array),
          author: { id: authorID },
          title_image: dto.title_image || null,
          published: expect.any(Boolean),
        });
      });

      test('calls postsRepository.findOne method', () => {
        expect(postsRepository.findOne).toHaveBeenCalledWith({
          where: { id: postStub().id },
          relations: { tags: true, author: true },
        });
      });

      it('should return the created post', () => {
        expect(result).toEqual(postStub());
      });
    });
  });

  describe('update', () => {
    describe('when update is called', () => {
      let result: UpdatedPostDto;
      const post = postStub() as unknown as Post;

      const updatePostDto: UpdatePostDto = {
        content: 'updated-post-content',
        title: 'updated-post-title',
        tags: [tagStub().name],
      };

      beforeEach(async () => {
        jest
          .spyOn(PostsService.prototype, 'setPostTags' as any)
          .mockResolvedValueOnce(tagStub());

        result = await postsService.update(post, updatePostDto);
      });

      test('calls postsService.setPostTags', () => {
        //@ts-ignore private method
        expect(postsService.setPostTags).toHaveBeenCalled();
      });

      test('calls postsRepository.save', () => {
        expect(postsRepository.save).toHaveBeenCalledWith({
          ...postStub(),
          ...updatePostDto,
          tags: tagStub(),
          url: expect.any(String), // converted url
        });
      });

      test('calls postsRepository.findOne', () => {
        expect(postsRepository.findOne).toHaveBeenCalledWith({
          where: { id: postStub().id },
          relations: { tags: true },
        });
      });

      it('should return the post', () => {
        expect(result).toEqual(postStub());
      });
    });
  });

  describe('getAll', () => {
    describe('when getAll is called', () => {
      let result: PublicPostsDto;

      beforeEach(async () => {
        result = await postsService.getAll();
      });

      test('calls postsRepository.find method', () => {
        expect(postsRepository.find).toHaveBeenCalledWith({
          where: { published: true },
          relations: { tags: true, author: true },
        });
      });

      it('should return the array of posts', async () => {
        expect(result).toEqual([postStub()]);
      });
    });
  });

  describe('getOne', () => {
    describe('when getOne is called', () => {
      describe('scenario : the post not found', () => {
        it('should throw NotFoundException', async () => {
          const { url } = postStub();

          const createQueryBuilder = {
            where: () => createQueryBuilder,
            leftJoinAndSelect: () => createQueryBuilder,
            leftJoin: () => createQueryBuilder,
            loadRelationCountAndMap: () => createQueryBuilder,
            getOne: () => null,
            getMany: () => [],
          };

          jest
            .spyOn(postsRepository, 'createQueryBuilder' as any)
            .mockImplementation(() => createQueryBuilder);

          await expect(postsService.getOne(url)).rejects.toThrow(
            NotFoundException,
          );
        });
      });

      describe('scenario : the post found', () => {
        it('should return a post', async () => {
          const { url } = postStub();

          const result = await postsService.getOne(url);

          expect(result).toEqual(postStub());
        });
      });
    });
  });

  describe('getOneByID', () => {
    describe('when getOneByID is called', () => {
      const id = randomUUID();
      let result: PostDto;

      beforeEach(async () => {
        result = await postsService.getOneByID(id);
      });

      test('calls postsRepository.findOne method', () => {
        expect(postsRepository.findOne).toHaveBeenCalledWith({
          where: { id },
          relations: { author: true, tags: true },
        });
      });

      it('should return a post', () => {
        expect(result).toEqual(postStub());
      });
    });
  });

  describe('saveTitleImage', () => {
    describe('when saveTitleImage is called', () => {
      let image: Express.Multer.File;
      let result: string;

      beforeEach(async () => {
        result = await postsService.saveTitleImage(image);
      });

      test('calls the uploadsService.uploadImage method', () => {
        expect(uploadsService.uploadImage).toHaveBeenCalledWith(image);
      });

      it('should return the uploaded image url', () => {
        expect(result).toEqual(expect.any(String));
      });
    });
  });

  describe('getMyPosts', () => {
    describe('when getMyPosts is called', () => {
      const authorID = jwtPayloadStub().sub;
      let result: PostsDto;

      beforeEach(async () => {
        result = await postsService.getMyPosts(authorID);
      });

      test('calls the postsRepository.createQueryBuilder method', () => {
        expect(postsRepository.createQueryBuilder).toHaveBeenCalled();
      });

      it('should return an array of posts', () => {
        expect(result).toEqual([postStub()]);
      });
    });
  });
});
