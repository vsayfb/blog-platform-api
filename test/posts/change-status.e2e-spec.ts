import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PostMessages } from 'src/posts/enums/post-messages';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import { POSTS_ROUTE } from 'src/lib/constants';
import { PostRoutes } from 'src/posts/enums/post-routes';
import { Role } from 'src/accounts/entities/account.entity';

jest.setTimeout(30000);

describe('/ (PUT) change post status', () => {
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

  async function changePostStatusRequest(
    id: string,
    accessToken: string,
  ): Promise<{
    body: { id: string; published: boolean; message: string };
    statusCode: number;
  }> {
    const { body, statusCode } = await request(server)
      .put(POSTS_ROUTE + PostRoutes.CHANGE_POST_STATUS + id)
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
