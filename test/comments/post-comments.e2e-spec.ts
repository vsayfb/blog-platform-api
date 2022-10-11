jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { CommentMessages } from 'src/comments/enums/comment-messages';
import { CommentRoutes } from 'src/comments/enums/comment-routes';
import { COMMENTS_ROUTE } from 'src/lib/constants';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import { CommentViewDto } from 'src/comments/dto/comment-view.dto';
import * as request from 'supertest';

jest.mock('src/gateways/notifications.gateway');

describe('(GET) post comments', () => {
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

  test('should return an array of comments', async () => {
    const post = await helpersService.createRandomPost(app);

    await helpersService.createRandomComment(app, post.body.data.id);

    const {
      body,
    }: { body: { data: CommentViewDto[]; message: CommentMessages } } =
      await request(server).get(
        COMMENTS_ROUTE + CommentRoutes.POST_COMMENTS + post.body.data.id,
      );

    expect(body.message).toBe(CommentMessages.ALL_FOUND);
  });
});
