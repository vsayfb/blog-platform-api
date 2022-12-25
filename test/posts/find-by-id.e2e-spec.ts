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
import { PostDto } from 'src/posts/request-dto/post.dto';

describe('/ (GET) find by ID', () => {
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
          .get(POSTS_ROUTE + PostRoutes.FIND_BY_ID + `${post.body.data.id}`)
          .set('Authorization', author.token);

      expect(result.body.message).toBe(PostMessages.FOUND);
    });
  });

  describe("scenario : if user wants read other user's post by id", () => {
    it('should throw Forbidden Exception', async () => {
      const forbiddenUser = await helpersService.loginRandomAccount(app);

      const post = await helpersService.createRandomPost(app);

      const result = await request(server)
        .get(POSTS_ROUTE + PostRoutes.FIND_BY_ID + `${post.body.data.id}`)
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
          .get(POSTS_ROUTE + PostRoutes.FIND_BY_ID + `${post.body.data.id}`)
          .set('Authorization', moderator.token);

      expect(result.body.message).toBe(PostMessages.FOUND);
    });
  });
});
