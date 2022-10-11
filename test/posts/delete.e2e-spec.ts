jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PostMessages } from 'src/posts/enums/post-messages';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import { POSTS_ROUTE } from 'src/lib/constants';
import { PostRoutes } from 'src/posts/enums/post-routes';
import { Role } from 'src/accounts/entities/account.entity';

describe('/ (DELETE) delete post', () => {
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

  afterAll(async () => {
    await databaseService.clearAllTables();
    await databaseService.disconnectDatabase();
    await app.close();
  });

  async function deletePostRequest(
    id: string,
    accessToken: string,
  ): Promise<{ body: { id: string; message: string }; statusCode: number }> {
    const { body, statusCode } = await request(server)
      .delete(POSTS_ROUTE + PostRoutes.DELETE + id)
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
