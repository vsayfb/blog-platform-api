jest.setTimeout(30000);

import { Role } from './../src/accounts/entities/account.entity';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UpdatePostDto } from 'src/posts/dto/update-post.dto';
import { PostMessages } from 'src/posts/enums/post-messages';
import { PostRoutes } from 'src/posts/enums/post-routes';
import { CreatedPostDto } from 'src/posts/dto/created-post.dto';
import { PublicPostDto } from 'src/posts/dto/public-post.dto';
import { PostDto } from 'src/posts/dto/post.dto';
import { UpdatedPostDto } from 'src/posts/dto/updated-post.dto';
import { PublicPostsDto } from 'src/posts/dto/public-posts.dto';
import { TestDatabaseService } from './database/database.service';
import { HelpersService } from './helpers/helpers.service';
import { initializeEndToEndTestModule } from './utils/initializeEndToEndTestModule';
import { generateFakePost } from './utils/generateFakePost';

const PREFIX = '/posts';

describe('PostsController (e2e)', () => {
  let app: INestApplication;
  let databaseService: TestDatabaseService;
  let helpersService: HelpersService;
  let server: any;

  beforeAll(async () => {
    const { nestApp, database, helpers } = await initializeEndToEndTestModule();

    app = nestApp;
    helpersService = helpers;
    databaseService = database;
    server = app.getHttpServer();
  });

  afterEach(async () => {
    await databaseService.clearAllTables();
  });

  afterAll(async () => {
    await databaseService.disconnectDatabase();
    await app.close();
  });

  describe('/ (POST) new post', () => {
    it('should return the created post', async () => {
      const result: { body: { data: CreatedPostDto; message: string } } =
        await helpersService.createRandomPost(app);

      expect(result.body.message).toBe(PostMessages.CREATED);
    });
  });

  describe('/ (GET) all posts', () => {
    it('should return the post', async () => {
      await helpersService.createRandomPost(app);
      await helpersService.createRandomPost(app);

      const result: {
        body: { data: PublicPostsDto; message: string };
      } = await request(server).get(PREFIX + PostRoutes.FIND_ALL);

      expect(result.body.message).toBe(PostMessages.ALL_FOUND);
    });
  });

  describe('/ (GET) a post with url', () => {
    it('should return the post', async () => {
      const createdPost = await helpersService.createRandomPost(app);

      const result: { body: { data: PublicPostDto; message: string } } =
        await request(server).get(
          PREFIX + PostRoutes.CREATE + createdPost.body.data.url,
        );

      expect(result.body.message).toBe(PostMessages.FOUND);
    });
  });

  describe('/ (GET) a post with id', () => {
    describe('scenario : if user wants read own post by id', () => {
      it('should return the post', async () => {
        const author = await helpersService.loginRandomAccount(app);

        const post = await helpersService.createRandomPost(
          app,
          Role.USER,
          author.token,
        );

        const result: { body: { data: PostDto; message: string } } =
          await request(server)
            .get(PREFIX + PostRoutes.FIND_BY_ID + `?id=${post.body.data.id}`)
            .set('Authorization', author.token);

        expect(result.body.message).toBe(PostMessages.FOUND);
      });
    });

    describe("scenario : if user wants read other user's post by id", () => {
      it('should throw Forbidden Exception', async () => {
        const forbiddenUser = await helpersService.loginRandomAccount(app);

        const post = await helpersService.createRandomPost(app);

        const result = await request(server)
          .get(PREFIX + PostRoutes.FIND_BY_ID + `?id=${post.body.data.id}`)
          .set('Authorization', forbiddenUser.token);

        expect(result.statusCode).toBe(403);
      });
    });

    describe('scenario : if a moderator wants read a post by id', () => {
      it('should return the post', async () => {
        const moderator = await helpersService.loginRandomAccount(
          app,
          Role.MODERATOR,
        );

        const post = await helpersService.createRandomPost(app);

        const result: { body: { data: PostDto; message: string } } =
          await request(server)
            .get(PREFIX + PostRoutes.FIND_BY_ID + `?id=${post.body.data.id}`)
            .set('Authorization', moderator.token);

        expect(result.body.message).toBe(PostMessages.FOUND);
      });
    });
  });

  describe('/ (PATCH) update the post ', () => {
    async function updatePostRequest(
      id: string,
      accessToken: string,
    ): Promise<{
      body: { data: UpdatedPostDto; message: string };
      statusCode: number;
    }> {
      const dto: UpdatePostDto = generateFakePost();

      const { body, statusCode } = await request(server)
        .patch(PREFIX + PostRoutes.UPDATE + id)
        .set('Authorization', accessToken)
        .send(dto);

      return { body, statusCode };
    }

    describe('scenario : user update its own post', () => {
      it('should return the updated post', async () => {
        const author = await helpersService.loginRandomAccount(app);

        const createdPost = await helpersService.createRandomPost(
          app,
          Role.MODERATOR,
          author.token,
        );

        const updated = await updatePostRequest(
          createdPost.body.data.id,
          author.token,
        );

        expect(updated.body.message).toBe(PostMessages.UPDATED);
      });
    });

    describe("scenario : user updates another user's post", () => {
      it('should throw Forbidden Error', async () => {
        const author = await helpersService.loginRandomAccount(app);

        const createdPost = await helpersService.createRandomPost(
          app,
          Role.MODERATOR,
          author.token,
        );

        const forbiddenUser = await helpersService.loginRandomAccount(app);

        const updated = await updatePostRequest(
          createdPost.body.data.id,
          forbiddenUser.token,
        );

        expect(updated.statusCode).toBe(403);
      });
    });

    describe('scenario : if user a moderator', () => {
      it('should return the updated post', async () => {
        const moderator = await helpersService.loginRandomAccount(
          app,
          Role.MODERATOR,
        );

        const createdPost = await helpersService.createRandomPost(app);

        const updated = await updatePostRequest(
          createdPost.body.data.id,
          moderator.token,
        );

        expect(updated.body.message).toBe(PostMessages.UPDATED);
      });
    });
  });

  describe('/ (DELETE) delete a post ', () => {
    async function deletePostRequest(
      id: string,
      accessToken: string,
    ): Promise<{ body: { id: string; message: string }; statusCode: number }> {
      const { body, statusCode } = await request(server)
        .delete(PREFIX + PostRoutes.REMOVE + id)
        .set('Authorization', accessToken);

      return { body, statusCode };
    }

    describe('scenario : user delete its own post', () => {
      it('should return the deleted post id', async () => {
        const author = await helpersService.loginRandomAccount(app);

        const createdPost = await helpersService.createRandomPost(
          app,
          Role.USER,
          author.token,
        );

        const deleted = await deletePostRequest(
          createdPost.body.data.id,
          author.token,
        );

        expect(deleted.body.message).toEqual(PostMessages.DELETED);
      });
    });

    describe("scenario : user delete another user's post", () => {
      it('should throw Forbidden Error', async () => {
        const author = await helpersService.loginRandomAccount(app);

        const createdPost = await helpersService.createRandomPost(
          app,
          Role.USER,
          author.token,
        );

        const forbiddenUser = await helpersService.loginRandomAccount(app);

        const deleted = await deletePostRequest(
          createdPost.body.data.id,
          forbiddenUser.token,
        );

        expect(deleted.statusCode).toBe(403);
      });
    });

    describe('scenario : if user a moderator', () => {
      it('should return the deleted post id', async () => {
        const moderator = await helpersService.loginRandomAccount(
          app,
          Role.MODERATOR,
        );

        const createdPost = await helpersService.createRandomPost(app);

        const deleted = await deletePostRequest(
          createdPost.body.data.id,
          moderator.token,
        );

        expect(deleted.body.message).toEqual(PostMessages.DELETED);
      });
    });
  });

  describe('/ (PUT) change the post status ', () => {
    async function changePostStatusRequest(
      id: string,
      accessToken: string,
    ): Promise<{
      body: { id: string; published: boolean; message: string };
      statusCode: number;
    }> {
      const { body, statusCode } = await request(server)
        .put(PREFIX + PostRoutes.CHANGE_POST_STATUS + id)
        .set('Authorization', accessToken);

      return { body, statusCode };
    }

    describe('scenario : user change its own post status', () => {
      it('should return the post id', async () => {
        const author = await helpersService.loginRandomAccount(app);

        const createdPost = await helpersService.createRandomPost(
          app,
          Role.USER,
          author.token,
        );

        const updated = await changePostStatusRequest(
          createdPost.body.data.id,
          author.token,
        );

        expect(updated.body.message).toBe(PostMessages.UPDATED);
      });
    });

    describe("scenario : user change another user's post status", () => {
      it('should throw Forbidden Error', async () => {
        const author = await helpersService.loginRandomAccount(app);

        const createdPost = await helpersService.createRandomPost(
          app,
          Role.USER,
          author.token,
        );

        const forbiddenUser = await helpersService.loginRandomAccount(app);

        const updated = await changePostStatusRequest(
          createdPost.body.data.id,
          forbiddenUser.token,
        );

        expect(updated.statusCode).toBe(403);
      });
    });

    describe('scenario : if user a moderator', () => {
      it('should return the post id', async () => {
        const author = await helpersService.loginRandomAccount(app);

        const createdPost = await helpersService.createRandomPost(
          app,
          Role.USER,
          author.token,
        );

        const moderator = await helpersService.loginRandomAccount(
          app,
          Role.MODERATOR,
        );

        const updated = await changePostStatusRequest(
          createdPost.body.data.id,
          moderator.token,
        );

        expect(updated.body.message).toBe(PostMessages.UPDATED);
      });
    });
  });
});
