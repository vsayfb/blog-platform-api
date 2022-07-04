import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { Test, TestingModule } from '@nestjs/testing';
import { jwtPayloadStub } from 'src/auth/stub/jwt-payload.stub';
import { Post } from 'src/posts/entities/post.entity';
import { PostsController } from 'src/posts/posts.controller';
import { PostsService } from 'src/posts/posts.service';
import { postStub } from 'src/posts/stub/post-stub';
import { randomUUID } from 'crypto';

jest.mock('src/posts/posts.service');

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        PostsService,
        { provide: 'SERVICE', useClass: PostsService },
        CaslAbilityFactory,
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(PostsService);
  });

  describe('when create method is called', () => {
    let result: { data: Post; message: string };

    let dto = postStub();

    delete dto.author;

    describe('scenario : when published query received', () => {
      const published = false;

      beforeEach(async () => {
        result = await controller.create(jwtPayloadStub, dto, false);
      });

      test('calls postsService.create with authorID dto and published', () => {
        expect(postsService.create).toHaveBeenCalledWith({
          authorID: jwtPayloadStub.sub,
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
        result = await controller.create(jwtPayloadStub, dto);
      });

      test('calls postsService.create with authorID and dto', () => {
        expect(postsService.create).toHaveBeenCalledWith({
          authorID: jwtPayloadStub.sub,
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
    let result: { data: Post[]; message: string };

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
    let result: { data: Post[]; message: string };
    const jwtPayload = jwtPayloadStub;

    describe('when getMyPosts is called', () => {
      beforeEach(async () => {
        result = await controller.getMyPosts(jwtPayloadStub);
      });

      test('calls postsService.getMyPosts method', () => {
        expect(postsService.getMyPosts).toHaveBeenCalled();
      });

      it('should return an array of posts', () => {
        expect(result.data).toEqual([postStub()]);
      });
    });
  });

  describe('findOneByUrl', () => {
    let result: { data: Post; message: string };
    let id = randomUUID();

    describe('when findByID is called', () => {
      beforeEach(async () => {
        result = await controller.findByID(id);
      });

      test('calls postsService.getOneByID method', () => {
        expect(postsService.getOneByID).toHaveBeenCalledWith(id);
      });

      it('should return a post', () => {
        expect(result.data).toEqual(postStub());
      });
    });
  });

  describe('findByID', () => {
    let result: { data: Post; message: string };
    let id = randomUUID();

    describe('when findByID is called', () => {
      beforeEach(async () => {
        result = await controller.findOneByUrl(id);
      });

      test('calls postsService.getOne method', () => {
        expect(postsService.getOne).toHaveBeenCalledWith(id);
      });

      it('should return a post', () => {
        expect(result.data).toEqual(postStub());
      });
    });
  });

  describe('update', () => {
    let result: { data: Post; message: string };
    const dto = postStub();
    let id = randomUUID();

    describe('when update is called', () => {
      beforeEach(async () => {
        result = await controller.update(id, dto);
      });

      test('calls postsService.update method', () => {
        expect(postsService.update).toHaveBeenCalledWith(id, dto);
      });

      it('should return the post', () => {
        expect(result.data).toEqual(dto);
      });
    });
  });

  describe('remove', () => {
    let result: { id: string; message: string };
    let id = randomUUID();

    describe('when remove is called', () => {
      beforeEach(async () => {
        result = await controller.remove(id);
      });

      test('calls postsService.delete method', () => {
        expect(postsService.delete).toHaveBeenCalledWith(id);
      });

      it('should return the post', () => {
        expect(result).toEqual({ id, message: expect.any(String) });
      });
    });
  });

  describe('changePostStatus', () => {
    let result: { id: any; published: boolean };
    let jwtPayload = jwtPayloadStub;
    let id = randomUUID();

    describe('when changePostStatus is called', () => {
      beforeEach(async () => {
        result = await controller.changePostStatus(id, jwtPayload);
      });

      test('calls postsService.changePostStatus method', () => {
        expect(postsService.changePostStatus).toHaveBeenCalledWith(
          id,
          jwtPayload,
        );
      });

      it('should return the post', () => {
        expect(result).toEqual({
          id,
          published: true,
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
        expect(result).toEqual({
          data: expect.any(String),
          message: expect.any(String),
        });
      });
    });
  });
});
