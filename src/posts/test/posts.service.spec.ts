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
import { uploadProfileResultStub } from 'src/uploads/stub/upload-profile.stub';
import { UpdatePostDto } from '../dto/update-post.dto';
import { tagStub } from 'src/tags/stub/tag.stub';

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
      let result: { data: Post; message: string };

      let authorID = accountStub().id;

      let dto = postStub();

      beforeEach(() => {
        // spyOn private methods
        jest
          .spyOn(PostsService.prototype, 'convertUrl' as any)
          .mockReturnValue(dto.url);
        jest.spyOn(PostsService.prototype, 'setPostTags' as any);
      });

      describe('scenario : user create a post as private and without title image url', () => {
        beforeEach(async () => {
          result = await postsService.create({
            authorID,
            dto,
            published: false,
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

        it('should return the created post as private and title image null', () => {
          expect(result.data).toEqual({
            ...postStub(),
            author: { id: postStub().author.id },
            tags: expect.any(Array),
            title_image: null,
            published: false,
          });
        });
      });

      describe('scenario : user create a post as private and a title image url', () => {
        beforeEach(async () => {
          dto.title_image = uploadProfileResultStub.newImage;

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

        it('should return the created post with title image url and published', () => {
          expect(result.data).toEqual({
            ...postStub(),
            author: { id: postStub().author.id },
            tags: expect.any(Array),
            title_image: expect.any(String),
            published: true,
          });
        });
      });
    });
  });

  describe('update', () => {
    describe('when update is called', () => {
      let result: { data: Post; message: string };
      const post = postStub() as unknown as Post;

      const updatePostDto: UpdatePostDto = {
        content: 'updated-post-content',
        title: 'updated-post-title',
      };

      beforeEach(async () => {
        result = await postsService.update(post, updatePostDto);
      });

      test('calls postsRepository.save', () => {
        expect(postsRepository.save).toHaveBeenCalledWith({
          ...postStub(),
          ...updatePostDto,
        });
      });

      it('should return the updated post', () => {
        expect(result.data.content).toBe(updatePostDto.content);
      });
    });
  });

  describe('getAll', () => {
    describe('when getAll is called', () => {
      let result: { data: Post[]; message: string };

      beforeEach(async () => {
        result = await postsService.getAll();
      });

      test('calls postsRepository.find method', () => {
        expect(postsRepository.find).toHaveBeenCalledWith({
          where: { published: true },
        });
      });

      it('should return the array of published posts', async () => {
        expect(result.data).toEqual([postStub()]);
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

      test('calls postsRepository.findOne method', () => {
        expect(postsRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      });

      it('should return a post', () => {
        expect(result.data).toEqual(postStub());
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
