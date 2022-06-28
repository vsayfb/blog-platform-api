import { USERNAME_TAKEN } from 'src/lib/error-messages';
import { AccessToken } from '../src/auth/dto/access-token.dto';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { RegisterViewDto } from '../src/accounts/dto/register-view.dto';
import { AppModule } from '../src/app.module';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../src/database/database.service';
import * as request from 'supertest';
import { generateFakeUser } from 'src/lib/fakers/generateFakeUser';

describe('AccountController (e2e)', () => {
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

  afterAll(async () => {
    await databaseService.clearTableRows('account');
    await databaseService.closeDatabase();
    await app.close();
  });

  async function takeToken() {
    const user = generateFakeUser();

    await databaseService.createTestUser({ ...user });

    const result: { body: AccessToken } = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: user.username, password: user.password });

    return { user, access_token: result.body.access_token };
  }

  describe('GET me', () => {
    it('should return the jwt payload', async () => {
      const { access_token, user } = await takeToken();

      const expected = await request(app.getHttpServer())
        .get('/accounts/me')
        .set('Authorization', `Bearer ${access_token}`);

      expect(expected.body).toEqual({
        username: user.username,
        image: null,
        sub: expect.any(String),
        iat: expect.any(Number),
        exp: expect.any(Number),
      });
    });
  });

  describe('GET is_available_username', () => {
    async function sendAvailableRequest(username: string) {
      const result = await request(app.getHttpServer()).get(
        `/accounts/is_available_username?username=${username}`,
      );

      return result;
    }

    describe('when invalid username sent', () => {
      it('should return Bad Request', async () => {
        const result = await sendAvailableRequest('us_23_!_');

        expect(result.status).toBe(400);
      });
    });

    describe('when unregistered username sent', () => {
      it('should return true', async () => {
        const result = await sendAvailableRequest('micheal');

        expect(result.body.message).toBe('The username is available.');
      });
    });

    describe('when registered username sent', () => {
      it('should return false', async () => {
        const { user } = await takeToken();

        const result = await sendAvailableRequest(user.username);

        expect(result.body.message).toBe(USERNAME_TAKEN);
      });
    });
  });
});
