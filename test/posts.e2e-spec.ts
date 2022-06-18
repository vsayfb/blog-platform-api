import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as path from 'path';
import { AppModule } from 'src/app.module';
import { DatabaseService } from 'src/database/database.service';
import { UNAUTHORIZED } from 'src/common/error-messages';
import { Post } from 'src/posts/entities/post.entity';
import { UploadsService } from 'src/uploads/uploads.service';

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

  const dto = {
    title: 'foo-title-foo-title',
    content: 'foo-content-foo-content',
    tags: ['nodejs', 'software'],
  };

  let access_token: string;

  beforeAll(async () => {
    await databaseService.createTestUser();

    // take a token
    const { body } = await request(app.getHttpServer())
      .post('/auth/login')
      .send(databaseService.getTestUser());

    access_token = body.access_token;
  });

  describe('/ (POST) new post', () => {
    describe('the given user is not logged in', () => {
      it('should return 401 Unauthorized', async () => {
        const result = await request(app.getHttpServer())
          .post('/posts/')
          .send({});

        expect(result.body.message).toBe(UNAUTHORIZED);
      });
    });

    describe('the given user is logged in', () => {
      describe('scenario : the user uploads a title image for a post', () => {
        it('should not be null [titleImage] field in response', async () => {
          // don't upload an image to cloud
          jest
            .spyOn(uploadsService, 'uploadImage')
            .mockResolvedValue('https://fooimage.com');

          const testTitleImageFile = path.join(
            path.resolve() + '/src/' + '/helpers/' + 'barisabi.jpg',
          );

          const result: { body: Post } = await request(app.getHttpServer())
            .post(`/posts?published=false`)
            .set('Authorization', `Bearer ${access_token}`)
            .field('title', dto.title)
            .field('content', dto.content)
            .attach('titleImage', testTitleImageFile);

          expect(result.body.titleImage).not.toBeNull();
          expect(result.body.title).toBe(dto.title);
        });
      });

      describe('scenario : user does not upload a title image for the post', () => {
        it('should be null [titleImage] field in response', async () => {
          const result: { body: Post } = await request(app.getHttpServer())
            .post(`/posts`)
            .set('Authorization', `Bearer ${access_token}`)
            .send(dto);

          expect(result.body.titleImage).toEqual(null);
          expect(result.body.title).toBe(dto.title);
        });
      });
    });
  });

  describe('/ (GET) a post ', () => {
    let postUrl: string = '';

    beforeAll(async () => {
      const result: { body: Post } = await request(app.getHttpServer())
        .post(`/posts`)
        .set('Authorization', `Bearer ${access_token}`)
        .send(dto);

      postUrl = result.body.url;
    });

    it('should return the post', async () => {
      const result: { body: Post } = await request(app.getHttpServer()).get(
        '/posts/' + postUrl,
      );

      expect(result.body.title).toBe(dto.title);
    });
  });

  afterAll(async () => {
    // remove user method automatically remove posts entities of relation its, beacuse of used cascade true
    await databaseService.removeTestUser();
    await databaseService.clearTableRows('tag');
    await databaseService.closeDatabase();
    await app.close();
  });
});
