jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { CommentMessages } from 'src/comments/enums/comment-messages';
import { CommentRoutes } from 'src/comments/enums/comment-routes';
import { COMMENTS_ROUTE } from 'src/lib/constants';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import * as request from 'supertest';
import { generateFakeComment } from 'test/helpers/utils/generateFakeComment';
import { ReplyViewDto } from 'src/comments/dto/reply-view.dto';

jest.mock('src/gateways/notifications.gateway');

describe('(POST) reply to comment', () => {
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

  async function createReplyComment(
    commentID: string,
  ): Promise<{ data: ReplyViewDto; message: CommentMessages }> {
    const user = await helpersService.loginRandomAccount(app);

    const result = await request(server)
      .post(COMMENTS_ROUTE + CommentRoutes.REPLY_TO_COMMENT + commentID)
      .set('Authorization', user.token)
      .send(generateFakeComment());

    return result.body;
  }

  test('should create a reply and return that', async () => {
    const post = await helpersService.createRandomPost(app);

    const createdComment = await helpersService.createRandomComment(
      app,
      post.body.data.id,
    );

    const result = await createReplyComment(createdComment.body.data.id);

    expect(result.message).toBe(CommentMessages.CREATED);
  });
});
