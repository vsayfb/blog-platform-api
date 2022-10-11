jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { CreatedCommentDto } from 'src/comments/dto/created-comment.dto';
import { CommentMessages } from 'src/comments/enums/comment-messages';
import { CommentRoutes } from 'src/comments/enums/comment-routes';
import { COMMENTS_ROUTE } from 'src/lib/constants';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { generateFakeComment } from 'test/helpers/utils/generateFakeComment';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import * as request from 'supertest';

jest.mock('src/gateways/notifications.gateway');

describe('(POST) create', () => {
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

  async function createCommentRequest(
    postID: string,
    access_token: string,
  ): Promise<{
    body: { data: CreatedCommentDto; message: CommentMessages };
    statusCode: number;
  }> {
    const { body, statusCode } = await request(server)
      .post(COMMENTS_ROUTE + CommentRoutes.CREATE + postID)
      .set('Authorization', access_token)
      .send(generateFakeComment());

    return { body, statusCode };
  }

  describe('when create is called', () => {
    let postAuthorToken: string;

    test('should create a comment and return that', async () => {
      const post = await helpersService.createRandomPost(app);

      postAuthorToken = await helpersService.takeTokenByID(
        app,
        post.body.data.author.id,
      );

      const user = await helpersService.loginRandomAccount(app);

      const result = await createCommentRequest(post.body.data.id, user.token);

      expect(result.body.message).toBe(CommentMessages.CREATED);
    });

    test('should be saved a notification about commented on your post', async () => {
      const notifications: { body: { data: Notification[] } } = await request(
        server,
      )
        .get('/notifications/me')
        .set('Authorization', postAuthorToken);

      expect(notifications.body.data.length).toBe(1);
    });
  });
});
