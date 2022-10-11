jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { CommentMessages } from 'src/comments/enums/comment-messages';
import { CommentRoutes } from 'src/comments/enums/comment-routes';
import { COMMENTS_ROUTE } from 'src/lib/constants';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import * as request from 'supertest';
import { RepliesViewDto } from 'src/comments/dto/replies-view.dto';

jest.mock('src/gateways/notifications.gateway');

describe('(GET) comment replies', () => {
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

  it('should return an array of replies', async () => {
    const post = await helpersService.createRandomPost(app);

    const createdComment = await helpersService.createRandomComment(
      app,
      post.body.data.id,
    );

    const result: {
      body: { data: RepliesViewDto; message: CommentMessages };
    } = await request(server).get(
      COMMENTS_ROUTE +
        CommentRoutes.COMMENT_REPLIES +
        createdComment.body.data.id,
    );

    expect(result.body.message).toBe(CommentMessages.REPLIES_FOUND);
  });
});
