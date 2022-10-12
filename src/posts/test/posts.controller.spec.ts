import { CaslAbilityFactory } from 'src/global/casl/casl-ability.factory';
import { Test, TestingModule } from '@nestjs/testing';
import { jwtPayloadStub } from 'src/auth/stub/jwt-payload.stub';
import { Post } from 'src/posts/entities/post.entity';
import { PostsController } from 'src/posts/posts.controller';
import { PostsService } from 'src/posts/posts.service';
import { postStub } from 'src/posts/stub/post-stub';
import { SelectedPostFields } from '../types/selected-post-fields';
import { PostMessages } from '../enums/post-messages';
import { PostsDto } from '../dto/posts.dto';
import { PublicPostDto } from '../dto/public-post.dto';
import { PostDto } from '../dto/post.dto';
import { UpdatedPostDto } from '../dto/updated-post.dto';
import { MANAGE_DATA_SERVICE } from 'src/lib/constants';
import { CACHE_MANAGER } from '@nestjs/common';

jest.mock('src/posts/posts.service');

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        PostsService,
        { provide: MANAGE_DATA_SERVICE, useClass: PostsService },
        { provide: CACHE_MANAGER, useValue: {} },

        CaslAbilityFactory,
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(PostsService);
  });

  describe('when create method is called', () => {
    let result: { data: SelectedPostFields; message: string };

    const dto = postStub();

    delete dto.author;

    describe('scenario : when published query received', () => {
      const published = false;

      beforeEach(async () => {
        result = await controller.create(dto, jwtPayloadStub(), false);
      });

      test('calls postsService.create with authorID dto and published', () => {
        expect(postsService.create).toHaveBeenCalledWith({
          authorID: jwtPayloadStub().sub,
          dto,
          published,
        });
      });

      it('should return a post', () => {
        expect(result).toEqual({
          data: expect.anything(),
          message: expect.any(String),
        });
      });
    });

    describe("scenario : when published query doesn't received", () => {
      beforeEach(async () => {
        result = await controller.create(dto, jwtPayloadStub());
      });

      test('calls postsService.create with authorID and dto', () => {
        expect(postsService.create).toHaveBeenCalledWith({
          authorID: jwtPayloadStub().sub,
          dto,
        });
      });

      it('should return a post', () => {
        expect(result).toEqual({
          data: expect.anything(),
          message: expect.any(String),
        });
      });
    });
  });

  describe('findAll', () => {
    let result: { data: any; message?: string };

    describe('when findAll is called', () => {
      beforeEach(async () => {
        result = await controller.findAll();
      });

      test('calls postsService.getAll method', () => {
        expect(postsService.getAll).toHaveBeenCalled();
      });

      it('should return an array of posts', () => {
        expect(result.data).toEqual([postStub()]);
      });
    });
  });

  describe('getMyPosts', () => {
    let result: { data: PostsDto; message: PostMessages };

    describe('when getMyPosts is called', () => {
      beforeEach(async () => {
        result = await controller.getMyPosts(jwtPayloadStub());
      });

      test('calls postsService.getMyPosts method', () => {
        expect(postsService.getMyPosts).toHaveBeenCalled();
      });

      it('should return an array of posts', () => {
        expect(result.data).toEqual([postStub()]);
      });
    });
  });

  describe('findOne', () => {
    let result: { data: PublicPostDto; message?: PostMessages };
    const url = postStub().url;

    describe('when findOne is called', () => {
      beforeEach(async () => {
        result = await controller.findOne(url);
      });

      test('calls postsService.getOne method', () => {
        expect(postsService.getOne).toHaveBeenCalledWith(url);
      });

      it('should return a post', () => {
        expect(result.data).toEqual(postStub());
      });
    });
  });

  describe('findByID', () => {
    let result: { data: PostDto; message: PostMessages };
    const foundPost = postStub();

    describe('when findByID is called', () => {
      beforeEach(async () => {
        result = await controller.findByID(foundPost as PostDto);
      });

      it('should return a post', () => {
        expect(result.data).toEqual(postStub());
      });
    });
  });

  describe('update', () => {
    let result: { data: UpdatedPostDto; message?: PostMessages };
    const dto = { content: 'updated-content-field' };
    const post = postStub() as unknown as Post;

    describe('when update is called', () => {
      beforeEach(async () => {
        result = await controller.update(dto, post);
      });

      test('calls postsService.update method', () => {
        expect(postsService.update).toHaveBeenCalledWith(post, dto);
      });

      it('should return the updated post', () => {
        expect(result.data).toEqual({ ...postStub(), content: dto.content });
      });
    });
  });

  describe('delete', () => {
    let result: { id: string; message: string };
    const post = postStub() as unknown as Post;

    describe('when delete is called', () => {
      beforeEach(async () => {
        result = await controller.delete(post);
      });

      test('calls postsService.delete method', () => {
        expect(postsService.delete).toHaveBeenCalledWith(post);
      });

      it('should return the post', () => {
        expect(result).toEqual({ id: post.id, message: expect.any(String) });
      });
    });
  });

  describe('changePostStatus', () => {
    let result: { id: string; published: boolean; message: string };
    const post = postStub() as unknown as Post;

    describe('when changePostStatus is called', () => {
      beforeEach(async () => {
        result = await controller.changePostStatus(post);
      });

      test('calls postsService.changePostStatus method', () => {
        expect(postsService.changePostStatus).toHaveBeenCalledWith(post);
      });

      it('should return the post', () => {
        expect(result).toEqual({
          id: post.id,
          published: !post.published,
          message: expect.any(String),
        });
      });
    });
  });

  describe('uploadTitleImage', () => {
    let result: { data: string; message: string };
    let titleImage: Express.Multer.File;

    describe('when uploadTitleImage is called', () => {
      beforeEach(async () => {
        result = await controller.uploadTitleImage(titleImage);
      });

      test('calls postsService.saveTitleImage method', () => {
        expect(postsService.saveTitleImage).toHaveBeenCalledWith(titleImage);
      });

      it('should return the post', () => {
        expect(result.data).toEqual(expect.any(String));
      });
    });
  });
});
