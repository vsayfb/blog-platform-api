jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PublicPostsDto } from 'src/posts/dto/public-posts.dto';
import { PostMessages } from 'src/posts/enums/post-messages';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import { POSTS_ROUTE } from 'src/lib/constants';
import { PostRoutes } from 'src/posts/enums/post-routes';

describe('/ (GET) all post', () => {
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
    await helpersService.createRandomPost(app);
    await helpersService.createRandomPost(app);

    const result: {
      body: { data: PublicPostsDto; message: string };
    } = await request(server).get(POSTS_ROUTE + PostRoutes.FIND_ALL);

    expect(result.body.message).toBe(PostMessages.ALL_FOUND);
  });
});
