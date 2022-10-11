jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { CommentMessages } from 'src/comments/enums/comment-messages';
import { CommentRoutes } from 'src/comments/enums/comment-routes';
import { COMMENTS_ROUTE } from 'src/lib/constants';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import { Role } from 'src/accounts/entities/account.entity';
import { UpdateCommentDto } from 'src/comments/dto/update-comment.dto';
import { generateFakeComment } from 'test/helpers/utils/generateFakeComment';
import * as request from 'supertest';

jest.mock('src/gateways/notifications.gateway');

describe('(PATCH) update comment', () => {
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

  async function updateCommentRequest(
    commentID: string,
    updateCommentDto: UpdateCommentDto,
    access_token: string,
  ): Promise<{ body: { data: Comment; message: string }; statusCode: number }> {
    const { body, statusCode } = await request(server)
      .patch(COMMENTS_ROUTE + CommentRoutes.UPDATE + commentID)
      .set('Authorization', access_token || access_token)
      .send(updateCommentDto);

    return { body, statusCode };
  }

  describe('scenario : user update own comment', () => {
    it('should return the updated comment', async () => {
      const user = await helpersService.loginRandomAccount(app);

      const post = await helpersService.createRandomPost(app);

      const comment = await helpersService.createRandomComment(
        app,
        post.body.data.id,
        Role.USER,
        user.token,
      );

      const updated = await updateCommentRequest(
        comment.body.data.id,
        generateFakeComment(),
        user.token,
      );

      expect(updated.body.message).toBe(CommentMessages.UPDATED);
    });
  });

  describe("scenario : user update other user's comment", () => {
    it('should return 403 status code', async () => {
      const comment = await helpersService.createRandomComment(app);

      const forbiddenUser = await helpersService.loginRandomAccount(app);

      const updated = await updateCommentRequest(
        comment.body.data.id,
        generateFakeComment(),
        forbiddenUser.token,
      );

      expect(updated.statusCode).toBe(403);
    });
  });

  describe('scenario : a moderator update comment', () => {
    it('should return the updated comment', async () => {
      const comment = await helpersService.createRandomComment(app);

      const moderator = await helpersService.loginRandomAccount(
        app,
        Role.MODERATOR,
      );

      const updated = await updateCommentRequest(
        comment.body.data.id,
        generateFakeComment(),
        moderator.token,
      );

      expect(updated.body.message).toBe(CommentMessages.UPDATED);
    });
  });
});
