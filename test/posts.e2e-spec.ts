import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as path from 'path';
import { AppModule } from 'src/app.module';
import { DatabaseService } from 'src/database/database.service';
import { UNAUTHORIZED } from 'src/lib/error-messages';
import { Post } from 'src/posts/entities/post.entity';
import { UploadsService } from 'src/uploads/uploads.service';
import { generateFakeUser } from 'src/lib/fakers/generateFakeUser';
import { generateFakePost } from 'src/lib/fakers/generateFakePost';

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

  beforeAll(async () => {
    const user = generateFakeUser();

    await databaseService.createTestUser({ ...user });

    // take a token
    const { body } = await request(app.getHttpServer())
      .post('/auth/login')
      .send(user);

    access_token = 'Bearer ' + body.access_token;
  });

  afterAll(async () => {
    await databaseService.clearTableRows('account');
    await databaseService.clearTableRows('tag');
    await databaseService.closeDatabase();
    await app.close();
  });

  async function newPostRequest(invalidToken?: string) {
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
        const result = await newPostRequest('invalid');

        expect(result.body.message).toBe(UNAUTHORIZED);
      });
    });

    describe('the given user is logged in', () => {
      it('should return the created post', async () => {
        const result: { body: Post } = await newPostRequest();

        expect(result.body.title).toEqual(expect.any(String));
      });
    });
  });

  describe('/ (GET) a post ', () => {
    it('should return the post', async () => {
      const createdPost: { body: Post } = await newPostRequest();

      const result: { body: Post } = await request(app.getHttpServer()).get(
        '/posts/' + createdPost.body.url,
      );

      expect(result.body.title).toBe(createdPost.body.title);
    });
  });

  describe('/ (PATCH) update the post ', () => {
    it('should return the updated post', async () => {
      const oldPost = await newPostRequest();

      const updated: { body: Post } = await request(app.getHttpServer())
        .patch('/posts/' + oldPost.body.id)
        .set('Authorization', access_token)
        .send(generateFakePost());

      expect(updated.body.title).not.toEqual(oldPost.body.title);
      expect(updated.body.content).not.toEqual(oldPost.body.content);
    });
  });
});
