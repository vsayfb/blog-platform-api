import { FakeUser } from './helpers/faker/generateFakeUser';
import { Role } from './../src/accounts/entities/account.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DatabaseService } from 'src/database/database.service';
import { UNAUTHORIZED } from 'src/lib/api-messages';
import { Post } from 'src/posts/entities/post.entity';
import { UploadsService } from 'src/uploads/uploads.service';
import { generateFakePost } from './helpers/faker/generateFakePost';
import { loginAccount } from './helpers/loginAccount';

describe('PostsController (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;
  let uploadsService: UploadsService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    databaseService = moduleRef.get<DatabaseService>(DatabaseService);
    uploadsService = moduleRef.get<UploadsService>(UploadsService);
  });

  let access_token: string;

  async function takeToken(role?: Role): Promise<{ access_token: string }> {
    let user: FakeUser;

    if (role) user = await databaseService.createRandomTestUser(role);
    else user = await databaseService.createRandomTestUser(role);
    // take a token
    const result = await loginAccount(app, user.username, user.password);

    return { access_token: `Bearer ${result.access_token}` };
  }

  beforeAll(async () => {
    access_token = (await takeToken()).access_token;
  });

  afterAll(async () => {
    await databaseService.clearTableRows('account');
    await databaseService.clearTableRows('tag');
    await databaseService.closeDatabase();
    await app.close();
  });

  async function createPostRequest(invalidToken?: string) {
    const dto = generateFakePost();

    const result = await request(app.getHttpServer())
      .post('/posts/')
      .set('Authorization', invalidToken || access_token)
      .send(dto);

    return result;
  }

  describe('/ (POST) new post', () => {
    describe('the given user is not logged in', () => {
      it('should return 401 Unauthorized', async () => {
        const result = await createPostRequest('invalid');

        expect(result.body.message).toBe(UNAUTHORIZED);
      });
    });

    describe('the given user is logged in', () => {
      it('should return the created post', async () => {
        const result: { body: Post } = await createPostRequest();

        expect(result.body.title).toEqual(expect.any(String));
      });
    });
  });

  describe('/ (GET) a post with url', () => {
    it('should return the post', async () => {
      const createdPost: { body: Post } = await createPostRequest();

      const result: { body: Post } = await request(app.getHttpServer()).get(
        '/posts/' + createdPost.body.url,
      );

      expect(result.body.title).toBe(createdPost.body.title);
    });
  });

  describe('/ (GET) a post with id', () => {
    let privatePost: Post;

    beforeAll(async () => {
      privatePost = (await createPostRequest()).body;
    });

    describe('scenario : if user wants read own post by id', () => {
      it('should return the post', async () => {
        const result = await request(app.getHttpServer())
          .get('/posts/id?id=' + privatePost.id)
          .set('Authorization', access_token);

        expect(result.statusCode).toBe(200);
      });
    });

    describe("scenario : if user wants read other user's post by id", () => {
      it('should throw Forbidden Exception', async () => {
        const user = await takeToken();

        const result = await request(app.getHttpServer())
          .get('/posts/id?id=' + privatePost.id)
          .set('Authorization', user.access_token);

        expect(result.statusCode).toBe(403);
      });
    });

    describe('scenario : if a user wants to read a post by id when admin', () => {
      it('should return the post', async () => {
        const user = await takeToken(Role.ADMIN);

        const result = await request(app.getHttpServer())
          .get('/posts/id?id=' + privatePost.id)
          .set('Authorization', user.access_token);

        expect(result.statusCode).toBe(200);
      });
    });
  });

  describe('/ (PATCH) update the post ', () => {
    describe('scenario : user update its own post', () => {
      it('should return the updated post', async () => {
        const oldPost = await createPostRequest();

        const updated: { body: Post } = await request(app.getHttpServer())
          .patch('/posts/' + oldPost.body.id)
          .set('Authorization', access_token)
          .send(generateFakePost());

        expect(updated.body.updatedAt).toBeDefined();
        expect(updated.body.updatedAt).not.toEqual(oldPost.body.updatedAt);
      });
    });

    describe("scenario : user updates another user's post", () => {
      it('should throw Forbidden Error', async () => {
        const oldPost = await createPostRequest();

        const { access_token: invalid_token } = await takeToken();

        const updated = await request(app.getHttpServer())
          .patch('/posts/' + oldPost.body.id)
          .set('Authorization', invalid_token)
          .send(generateFakePost());

        expect(updated.statusCode).toBe(403);
      });
    });

    describe('scenario : if user an admin', () => {
      it('should return the updated post', async () => {
        const oldPost = await createPostRequest();

        const { access_token } = await takeToken(Role.ADMIN);

        const updated: { body: Post } = await request(app.getHttpServer())
          .patch('/posts/' + oldPost.body.id)
          .set('Authorization', access_token)
          .send(generateFakePost());

        expect(updated.body.updatedAt).toBeDefined();
        expect(updated.body.updatedAt).not.toEqual(oldPost.body.updatedAt);
      });
    });
  });
});
