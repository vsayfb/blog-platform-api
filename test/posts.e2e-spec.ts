import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DatabaseService } from 'src/database/database.service';
import { Account } from 'src/accounts/entities/account.entity';
import { UNAUTHORIZED } from 'src/common/error-messages';

describe('PostsController (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;
  let user: Account;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    databaseService = moduleRef.get<DatabaseService>(DatabaseService);
  });

  afterAll(async () => {
    await databaseService.clearTableRows('post');
    await app.close();
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
      let access_token: string;

      beforeAll(async () => {
        await databaseService.createTestUser();

        // take a token
        const { body } = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            username: DatabaseService.testUsername,
            password: DatabaseService.testUserCorrectPassword,
          });

        access_token = body.access_token;
      });

      afterAll(async () => {
        await databaseService.removeTestUser();
      });

      it('should return the post', async () => {
        const dto = { title: 'foo-title-foo-title' };

        const result = await request(app.getHttpServer())
          .post('/posts')
          .set('Authorization', `Bearer ${access_token}`)
          .send(dto);

        expect(result.body.title).toEqual(dto.title);
      });
    });
  });
});
