jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { Role } from 'src/accounts/entities/account.entity';
import { CreateCommentDto } from 'src/comments/dto/create-comment.dto';
import { PostCommentsDto } from 'src/comments/dto/post-comments.dto';
import { UpdateCommentDto } from 'src/comments/dto/update-comment.dto';
import { Comment } from 'src/comments/entities/comment.entity';
import { CommentMessages } from 'src/comments/enums/comment-messages';
import { CommentRoutes } from 'src/comments/enums/comment-routes';
import { SelectedCommentFields } from 'src/comments/types/selected-comment-fields';
import * as request from 'supertest';
import { TestDatabaseService } from './database/database.service';
import { generateFakeComment } from './utils/generateFakeComment';
import { HelpersService } from './helpers/helpers.service';
import { initializeEndToEndTestModule } from './utils/initializeEndToEndTestModule';

const PREFIX = '/comments';

describe('Comments (e2e)', () => {
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
    createCommentDto: CreateCommentDto,
    postID: string,
    access_token: string,
  ): Promise<{
    body: { data: SelectedCommentFields; message: string };
    statusCode: number;
  }> {
    const { body, statusCode } = await request(server)
      .post(PREFIX + CommentRoutes.CREATE + postID)
      .set('Authorization', access_token)
      .send(createCommentDto);

    return { body, statusCode };
  }

  async function updateCommentRequest(
    commentID: string,
    updateCommentDto: UpdateCommentDto,
    access_token: string,
  ): Promise<{ body: { data: Comment; message: string }; statusCode: number }> {
    const { body, statusCode } = await request(server)
      .patch(PREFIX + CommentRoutes.PATCH + commentID)
      .set('Authorization', access_token || access_token)
      .send(updateCommentDto);

    return { body, statusCode };
  }

  async function deleteCommentRequest(
    commentID: string,
    access_token: string,
  ): Promise<{ body: { id: string; message: string }; statusCode: number }> {
    //
    const result = await request(server)
      .delete(PREFIX + CommentRoutes.DELETE + commentID)
      .set('Authorization', access_token);

    return { body: result.body, statusCode: result.statusCode };
  }

  describe('findPostComments', () => {
    describe('when findPostComments is called', () => {
      it('should return an array of comments of the found post', async () => {
        const post = await helpersService.createRandomPost(app);

        await helpersService.createRandomComment(app, post.body.data.id);
        await helpersService.createRandomComment(app, post.body.data.id);

        const {
          body,
        }: { body: { data: PostCommentsDto; message: CommentMessages } } =
          await request(server).get(
            PREFIX + CommentRoutes.POST_COMMENTS + post.body.data.id,
          );

        expect(body.message).toBe(CommentMessages.ALL_FOUND);
      });
    });
  });

  describe('create', () => {
    describe('when create is called', () => {
      it('should create a comment and return that', async () => {
        const post = await helpersService.createRandomPost(app);

        const createdComment = await helpersService.createRandomComment(
          app,
          post.body.data.id,
        );

        expect(createdComment.body.message).toBe(CommentMessages.CREATED);
      });
    });
  });

  describe('delete', () => {
    describe('when delete is called', () => {
      let postID: string;

      beforeEach(async () => {
        const post = await helpersService.createRandomPost(app);

        postID = post.body.data.id;
      });

      describe('scenario : user delete own comment', () => {
        it('should return deleted comment id', async () => {
          const account = await helpersService.loginRandomAccount(app);

          const comment = await createCommentRequest(
            generateFakeComment(),
            postID,
            account.token,
          );

          const removedComment = await deleteCommentRequest(
            comment.body.data.id,
            account.token,
          );

          expect(removedComment.body.message).toBe(CommentMessages.DELETED);
        });
      });

      describe("scenario : user delete other user's comment", () => {
        it('should return 403 status code', async () => {
          const account = await helpersService.loginRandomAccount(app);

          const comment = await createCommentRequest(
            generateFakeComment(),
            postID,
            account.token,
          );

          const forbiddenAccount = await helpersService.loginRandomAccount(app);

          const removedComment = await deleteCommentRequest(
            comment.body.data.id,
            forbiddenAccount.token,
          );

          expect(removedComment.statusCode).toBe(403);
        });
      });

      describe('scenario : a moderator delete comment', () => {
        it("should return the deleted comment's id", async () => {
          const moderator = await helpersService.loginRandomAccount(
            app,
            Role.MODERATOR,
          );

          const createdComment = await helpersService.createRandomComment(app);

          const removed = await deleteCommentRequest(
            createdComment.body.data.id,
            moderator.token,
          );

          expect(removed.body.message).toBe(CommentMessages.DELETED);
        });
      });
    });
  });

  describe('update', () => {
    describe('when update is called', () => {
      let postID: string;
      const updateCommentDto: UpdateCommentDto = generateFakeComment();

      beforeEach(async () => {
        const post = await helpersService.createRandomPost(app);

        postID = post.body.data.id;
      });

      describe('scenario : user update own comment', () => {
        it('should return the updated comment', async () => {
          const user = await helpersService.loginRandomAccount(app);

          const comment = await helpersService.createRandomComment(
            app,
            postID,
            Role.USER,
            user.token,
          );

          const updated = await updateCommentRequest(
            comment.body.data.id,
            updateCommentDto,
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
            updateCommentDto,
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
            updateCommentDto,
            moderator.token,
          );

          expect(updated.body.message).toBe(CommentMessages.UPDATED);
        });
      });
    });
  });
});
