import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Role } from 'src/accounts/entities/account.entity';
import { AppModule } from 'src/app.module';
import { CreateCommentDto } from 'src/comments/dto/create-comment.dto';
import { UpdateCommentDto } from 'src/comments/dto/update-comment.dto';
import { Comment } from 'src/comments/entities/comment.entity';
import { CommentMessages } from 'src/comments/enums/comment-messages';
import { CommentRoutes } from 'src/comments/enums/comment-routes';
import { DatabaseService } from 'src/database/database.service';
import { Post } from 'src/posts/entities/post.entity';
import * as request from 'supertest';
import { generateFakeComment } from './helpers/faker/generateFakeComment';
import { generateFakePost } from './helpers/faker/generateFakePost';
import { loginAccount } from './helpers/loginAccount';

const PREFIX = '/comments';

describe('Comments (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;
  let server: any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();

    server = app.getHttpServer();
    databaseService = moduleRef.get<DatabaseService>(DatabaseService);
  });

  afterAll(async () => {
    await databaseService.clearTableRows('comment');
    await databaseService.closeDatabase();
    await app.close();
  });

  async function takeToken(role?: Role) {
    const user = await databaseService.createRandomTestUser(role);

    const result = await loginAccount(app, user.username, user.password);

    return 'Bearer ' + result.access_token;
  }

  async function createCommentRequest(
    createCommentDto: CreateCommentDto,
    access_token?: string,
  ): Promise<{ body: { data: Comment; message: string }; statusCode: number }> {
    // create a post for new comment
    const post: { body: { data: Post } } = await request(server)
      .post('/posts/')
      .set('Authorization', await takeToken())
      .send(generateFakePost());

    const { body, statusCode } = await request(server)
      .post(PREFIX + CommentRoutes.CREATE + post.body.data.id)
      .set('Authorization', access_token || (await takeToken()))
      .send(createCommentDto);

    return { body, statusCode };
  }

  async function updateCommentRequest(
    commentID: string,
    updateCommentDto: UpdateCommentDto,
    access_token?: string,
  ): Promise<{ body: { data: Comment; message: string }; statusCode: number }> {
    // create a post for new comment
    const post: { body: { data: Post } } = await request(server)
      .post('/posts/')
      .set('Authorization', await takeToken())
      .send(generateFakePost());

    const { body, statusCode } = await request(server)
      .patch(PREFIX + CommentRoutes.PATCH + commentID)
      .set('Authorization', access_token || (await takeToken()))
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
        const comment = await createCommentRequest(generateFakeComment());

        const { body }: { body: { data: Comment[] } } = await request(
          server,
        ).get(PREFIX + CommentRoutes.POST_COMMENTS + comment.body.data.post.id);

        expect(body.data).toEqual(expect.any(Array));
      });
    });
  });

  describe('create', () => {
    describe('when create is called', () => {
      it('should create a comment and return that', async () => {
        const dto = generateFakeComment();

        const result = await createCommentRequest(dto);

        expect(result.body.data.content).toBe(dto.content);
        expect(result.body.message).toBe(CommentMessages.CREATED);
      });
    });
  });

  describe('delete', () => {
    describe('when delete is called', () => {
      describe('scenario : user delete own comment', () => {
        it('should return deleted comment id', async () => {
          const token = await takeToken();

          const comment = await createCommentRequest(
            generateFakeComment(),
            token,
          );

          const removed = await deleteCommentRequest(
            comment.body.data.id,
            token,
          );

          expect(removed.body.message).toBe(CommentMessages.DELETED);
          expect(removed.body.id).toBe(comment.body.data.id);
        });
      });

      describe("scenario : user delete other user's comment", () => {
        it('should return 403 status code', async () => {
          const token = await takeToken();

          const comment = await createCommentRequest(generateFakeComment());

          const removed = await deleteCommentRequest(
            comment.body.data.id,
            token,
          );

          expect(removed.statusCode).toBe(403);
        });
      });

      describe('scenario : a moderator delete comment', () => {
        it("should return the deleted comment's id", async () => {
          const comment = await createCommentRequest(generateFakeComment());

          const removed = await deleteCommentRequest(
            comment.body.data.id,
            await takeToken(Role.MODERATOR),
          );

          expect(removed.body.message).toBe(CommentMessages.DELETED);
          expect(removed.body.id).toBe(comment.body.data.id);
        });
      });
    });
  });

  describe('update', () => {
    describe('when update is called', () => {
      const updateCommentDto: UpdateCommentDto = generateFakeComment();

      describe('scenario : user update own comment', () => {
        it('should return the updated comment', async () => {
          const token = await takeToken();

          const comment = await createCommentRequest(
            generateFakeComment(),
            token,
          );

          const updated = await updateCommentRequest(
            comment.body.data.id,
            updateCommentDto,
            token,
          );

          expect(updated.body.message).toBe(CommentMessages.UPDATED);
          expect(updated.body.data.content).toBe(updateCommentDto.content);
        });
      });

      describe("scenario : user update other user's comment", () => {
        it('should return 403 status code', async () => {
          const comment = await createCommentRequest(generateFakeComment());

          const updated = await updateCommentRequest(
            comment.body.data.id,
            updateCommentDto,
          );

          expect(updated.statusCode).toBe(403);
        });
      });

      describe('scenario : a moderator update comment', () => {
        it('should return the updated comment', async () => {
          const comment = await createCommentRequest(generateFakeComment());

          const updated = await updateCommentRequest(
            comment.body.data.id,
            updateCommentDto,
            await takeToken(Role.MODERATOR),
          );

          expect(updated.body.message).toBe(CommentMessages.UPDATED);
          expect(updated.body.data.content).toBe(updateCommentDto.content);
        });
      });
    });
  });
});
