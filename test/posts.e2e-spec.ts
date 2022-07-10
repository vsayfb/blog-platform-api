import { FakeUser } from './helpers/faker/generateFakeUser';
import { Role } from './../src/accounts/entities/account.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DatabaseService } from 'src/database/database.service';
import { Post } from 'src/posts/entities/post.entity';
import { generateFakePost } from './helpers/faker/generateFakePost';
import { loginAccount } from './helpers/loginAccount';
import { UpdatePostDto } from 'src/posts/dto/update-post.dto';
import { AuthMessages } from 'src/auth/enums/auth-messages';
import { PostMessages } from 'src/posts/enums/post-messages';
import { PostRoutes } from 'src/posts/enums/post-routes';

const PREFIX = '/posts';

describe('PostsController (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    databaseService = moduleRef.get<DatabaseService>(DatabaseService);
  });

  let userAccessToken: string;

  async function takeToken(role?: Role): Promise<{ userAccessToken: string }> {
    let user: FakeUser;

    if (role) user = await databaseService.createRandomTestUser(role);
    else user = await databaseService.createRandomTestUser(role);
    // take a token
    const result = await loginAccount(app, user.username, user.password);

    return { userAccessToken: `Bearer ${result.access_token}` };
  }

  beforeAll(async () => {
    userAccessToken = (await takeToken()).userAccessToken;
  });

  afterAll(async () => {
    await databaseService.clearTableRows('account');
    await databaseService.clearTableRows('tag');
    await databaseService.closeDatabase();
    await app.close();
  });

  async function createPostRequest(
    invalidToken?: string,
  ): Promise<{ body: { data: Post; message: string } }> {
    const dto = generateFakePost();

    const { body } = await request(app.getHttpServer())
      .post(PREFIX + PostRoutes.CREATE)
      .set('Authorization', invalidToken || userAccessToken)
      .send(dto);

    return { body };
  }

  describe('/ (POST) new post', () => {
    it('should return the created post', async () => {
      const result: { body: { data: Post; message: string } } =
        await createPostRequest();

      expect(result.body.data.title).toEqual(expect.any(String));
    });
  });

  describe('/ (GET) a post with url', () => {
    it('should return the post', async () => {
      const createdPost = await createPostRequest();

      const result: { body: { data: Post; message: string } } = await request(
        app.getHttpServer(),
      ).get(PREFIX + PostRoutes.CREATE + createdPost.body.data.url);

      expect(result.body.data.title).toBe(createdPost.body.data.title);
    });
  });

  describe('/ (GET) a post with id', () => {
    let privatePost: { data: Post; message: string };

    beforeAll(async () => {
      const post = await createPostRequest();

      privatePost = post.body;
    });

    describe('scenario : if user wants read own post by id', () => {
      it('should return the post', async () => {
        const result = await request(app.getHttpServer())
          .get(PREFIX + PostRoutes.FIND_BY_ID + `?id=${privatePost.data.id}`)
          .set('Authorization', userAccessToken);

        expect(result.statusCode).toBe(200);
      });
    });

    describe("scenario : if user wants read other user's post by id", () => {
      it('should throw Forbidden Exception', async () => {
        const forbiddenUser = await takeToken();

        const result = await request(app.getHttpServer())
          .get(PREFIX + PostRoutes.FIND_BY_ID + `?id=${privatePost.data.id}`)
          .set('Authorization', forbiddenUser.userAccessToken);

        expect(result.statusCode).toBe(403);
      });
    });

    describe('scenario : if a user wants to read a post by id when admin', () => {
      it('should return the post', async () => {
        const user = await takeToken(Role.ADMIN);

        const result = await request(app.getHttpServer())
          .get(PREFIX + PostRoutes.FIND_BY_ID + `?id=${privatePost.data.id}`)
          .set('Authorization', user.userAccessToken);

        expect(result.statusCode).toBe(200);
      });
    });
  });

  describe('/ (PATCH) update the post ', () => {
    async function updatePostRequest(
      id: string,
      accessToken?: string,
    ): Promise<{ body: { data: Post; message: string }; statusCode: number }> {
      const dto: UpdatePostDto = generateFakePost();

      const { body, statusCode } = await request(app.getHttpServer())
        .patch(PREFIX + PostRoutes.UPDATE + id)
        .set('Authorization', accessToken || userAccessToken)
        .send(dto);

      return { body, statusCode };
    }

    describe('scenario : user update its own post', () => {
      it('should return the updated post', async () => {
        const oldPost = await createPostRequest();

        const updated = await updatePostRequest(oldPost.body.data.id);

        expect(updated.body.data.updatedAt).toBeDefined();
        expect(updated.body.data.updatedAt).not.toEqual(
          oldPost.body.data.updatedAt,
        );
      });
    });

    describe("scenario : user updates another user's post", () => {
      it('should throw Forbidden Error', async () => {
        const oldPost = await createPostRequest();

        const { userAccessToken: invalid_token } = await takeToken();

        const updated = await updatePostRequest(
          oldPost.body.data.id,
          invalid_token,
        );

        expect(updated.statusCode).toBe(403);
      });
    });

    describe('scenario : if user an admin', () => {
      it('should return the updated post', async () => {
        const oldPost = await createPostRequest();

        const { userAccessToken } = await takeToken(Role.ADMIN);

        const updated = await updatePostRequest(
          oldPost.body.data.id,
          userAccessToken,
        );

        expect(updated.body.data.updatedAt).toBeDefined();
        expect(updated.body.data.updatedAt).not.toEqual(
          oldPost.body.data.updatedAt,
        );
      });
    });
  });

  describe('/ (DELETE) delete a post ', () => {
    async function deletePostRequest(
      id: string,
      accessToken?: string,
    ): Promise<{ body: { id: string; message: string }; statusCode: number }> {
      const { body, statusCode } = await request(app.getHttpServer())
        .delete(PREFIX + PostRoutes.REMOVE + id)
        .set('Authorization', accessToken || userAccessToken);

      return { body, statusCode };
    }

    describe('scenario : user delete its own post', () => {
      it('should return the deleted post id', async () => {
        const createdPost = await createPostRequest();

        const deleted = await deletePostRequest(createdPost.body.data.id);

        expect(deleted.body.message).toEqual(PostMessages.DELETED);
        expect(deleted.body.id).toBe(createdPost.body.data.id);
      });
    });

    describe("scenario : user delete another user's post", () => {
      it('should throw Forbidden Error', async () => {
        const createdPost = await createPostRequest();

        const { userAccessToken: invalid_token } = await takeToken();

        const updated = await deletePostRequest(
          createdPost.body.data.id,
          invalid_token,
        );

        expect(updated.statusCode).toBe(403);
      });
    });

    describe('scenario : if user an admin', () => {
      it('should return the deleted post id', async () => {
        const createdPost = await createPostRequest();

        const { userAccessToken } = await takeToken(Role.ADMIN);

        const deleted = await deletePostRequest(
          createdPost.body.data.id,
          userAccessToken,
        );

        expect(deleted.body.message).toEqual(PostMessages.DELETED);
      });
    });
  });

  describe('/ (PUT) change the post status ', () => {
    async function changePostStatusRequest(
      id: string,
      accessToken?: string,
    ): Promise<{
      body: { id: string; published: boolean; message: string };
      statusCode: number;
    }> {
      const { body, statusCode } = await request(app.getHttpServer())
        .put('/posts/change_post_status/' + id)
        .set('Authorization', accessToken || userAccessToken);

      return { body, statusCode };
    }

    describe('scenario : user change its own post status', () => {
      it('should return the post id', async () => {
        const createdPost = await createPostRequest();

        const updated = await changePostStatusRequest(createdPost.body.data.id);

        expect(createdPost.body.data.published).not.toBe(
          updated.body.published,
        );
      });
    });

    describe("scenario : user change another user's post status", () => {
      it('should throw Forbidden Error', async () => {
        const createdPost = await createPostRequest();

        const { userAccessToken: invalid_token } = await takeToken();

        const updated = await changePostStatusRequest(
          createdPost.body.data.id,
          invalid_token,
        );

        expect(updated.statusCode).toBe(403);
      });
    });

    describe('scenario : if user an admin', () => {
      it('should return the post id', async () => {
        const createdPost = await createPostRequest();

        const { userAccessToken } = await takeToken(Role.ADMIN);

        const updated = await changePostStatusRequest(
          createdPost.body.data.id,
          userAccessToken,
        );

        expect(createdPost.body.data.published).not.toBe(
          updated.body.published,
        );
      });
    });
  });
});
