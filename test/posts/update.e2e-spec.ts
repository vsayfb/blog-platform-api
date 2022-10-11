jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PostMessages } from 'src/posts/enums/post-messages';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import { POSTS_ROUTE } from 'src/lib/constants';
import { PostRoutes } from 'src/posts/enums/post-routes';
import { UpdatedPostDto } from 'src/posts/dto/updated-post.dto';
import { UpdatePostDto } from 'src/posts/dto/update-post.dto';
import { generateFakePost } from 'test/helpers/utils/generateFakePost';
import { Role } from 'src/accounts/entities/account.entity';

describe('(PATCH) update ', () => {
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

  async function updatePostRequest(
    id: string,
    accessToken: string,
  ): Promise<{
    body: { data: UpdatedPostDto; message: string };
    statusCode: number;
  }> {
    const dto: UpdatePostDto = generateFakePost();

    const { body, statusCode } = await request(server)
      .patch(POSTS_ROUTE + PostRoutes.UPDATE + id)
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
