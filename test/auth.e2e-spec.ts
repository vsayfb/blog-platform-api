import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { DatabaseService } from 'src/database/database.service';
import { RegisterType } from 'src/accounts/entities/account.entity';
import { accountStub } from 'src/accounts/tests/stub/account.stub';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;

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
    databaseService.dropTable('account');
  });

  describe('/ (POST) new local account', () => {
    it('should return an account', async () => {
      const dto = accountStub();

      const result = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto);

      expect(result.body).toEqual({
        id: expect.any(String),
        ...dto,
        via: RegisterType.LOCAL,
      });

      expect(result.status).toBe(201);
    });
  });
});
