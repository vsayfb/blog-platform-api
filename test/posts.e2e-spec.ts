import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DatabaseService } from 'src/database/database.service';
import { Account } from 'src/accounts/entities/account.entity';

describe('PostsController (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;
  let user: Account;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    databaseService = moduleRef.get<DatabaseService>(DatabaseService);
  });

  afterAll(async () => {
    await app.close();
    databaseService.dropTable('post');
  });

  describe('/ (POST) new post', () => {
    describe('given the user is not logged in', () => {
      it('should return 401 Unauthorized', async () => {
        const result = await request(app.getHttpServer())
          .post('/posts/')
          .send({});

        expect(result.body).toEqual({
          statusCode: 401,
          message: 'Unauthorized',
        });
      });
    });

    describe('given the user is logged in', () => {
      let access_token: string;

      beforeAll(async () => {
        await databaseService.createTestUser();

        const { body } = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            username: DatabaseService.testUsername,
            password: DatabaseService.testPassword,
          });

        access_token = body.access_token;
      });

      afterAll(() => {
        databaseService.removeTestUser();
      });

      describe('scenario : given the dto is empty', () => {
        it('should return 400 status code', async () => {
          const dto = {};

          const result = await request(app.getHttpServer())
            .post('/posts')
            .set('Authorization', `Bearer ${access_token}`)
            .send(dto);

          expect(result.statusCode).toBe(400);
        });
      });

      describe('scenario : the given dto is fulfilled and the user logs in', () => {
        it('should return 200 status code and the post', async () => {
          const dto = { title: 'foo-title-foo-title' };

          const result = await request(app.getHttpServer())
            .post('/posts')
            .set('Authorization', `Bearer ${access_token}`)
            .send(dto);

          expect(result.statusCode).toBe(201);
          expect(result.body.title).toEqual(dto.title);
        });
      });
    });
  });
});
