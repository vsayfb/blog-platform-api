jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PostMessages } from 'src/posts/enums/post-messages';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import { POSTS_ROUTE } from 'src/lib/constants';
import { PostRoutes } from 'src/posts/enums/post-routes';
import { PublicPostDto } from 'src/posts/request-dto/public-post.dto';

describe('/ (GET) find with URL', () => {
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

  it('should return the post', async () => {
    const createdPost = await helpersService.createRandomPost(app);

    const result: { body: { data: PublicPostDto; message: string } } =
      await request(server).get(
        POSTS_ROUTE + PostRoutes.CREATE + createdPost.body.data.url,
      );

    expect(result.body.message).toBe(PostMessages.FOUND);
  });
});
