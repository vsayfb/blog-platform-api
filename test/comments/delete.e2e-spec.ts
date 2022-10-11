jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { CommentMessages } from 'src/comments/enums/comment-messages';
import { CommentRoutes } from 'src/comments/enums/comment-routes';
import { COMMENTS_ROUTE } from 'src/lib/constants';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import { Role } from 'src/accounts/entities/account.entity';
import * as request from 'supertest';

jest.mock('src/gateways/notifications.gateway');

describe('(DELETE) delete comment', () => {
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

  async function deleteComment(
    commentID: string,
    token?: string,
  ): Promise<{ message: CommentMessages }> {
    const user = await helpersService.loginRandomAccount(app);

    const result: { body: { id: string; message: CommentMessages } } =
      await request(server)
        .delete(COMMENTS_ROUTE + CommentRoutes.DELETE + commentID)
        .set('Authorization', token || user.token);

    return result.body;
  }

  describe('scenario : user delete own comment', () => {
    test('should return deleted comment id', async () => {
      const account = await helpersService.loginRandomAccount(app);

      const post = await helpersService.createRandomPost(app);

      const comment = await helpersService.createRandomComment(
        app,
        post.body.data.id,
        Role.USER,
        account.token,
      );

      const removedComment = await deleteComment(
        comment.body.data.id,
        account.token,
      );

      expect(removedComment.message).toBe(CommentMessages.DELETED);
    });
  });

  describe("scenario : user delete other user's comment", () => {
    test('should return 403 status code', async () => {
      const comment = await helpersService.createRandomComment(app);

      const forbiddenAccount = await helpersService.loginRandomAccount(app);

      const removedComment = await deleteComment(
        comment.body.data.id,
        forbiddenAccount.token,
      );

      expect(removedComment.message).toBe('Forbidden resource');
    });
  });

  describe('scenario : a moderator delete comment', () => {
    it("should return the deleted comment's id", async () => {
      const moderator = await helpersService.loginRandomAccount(
        app,
        Role.MODERATOR,
      );

      const createdComment = await helpersService.createRandomComment(app);

      const removed = await deleteComment(
        createdComment.body.data.id,
        moderator.token,
      );

      expect(removed.message).toBe(CommentMessages.DELETED);
    });
  });
});
