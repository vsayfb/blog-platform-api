import { USERNAME_AVAILABLE } from './../src/lib/api-messages/api-messages';
import { USERNAME_TAKEN } from 'src/lib/api-messages';
import { AccessToken } from '../src/auth/dto/access-token.dto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../src/database/database.service';
import * as request from 'supertest';
import { generateFakeUser } from 'test/helpers/faker/generateFakeUser';
import { loginAccount } from './helpers/loginAccount';

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

  async function takeToken(): Promise<{
    user: { username: string; password: string };
    access_token: string;
  }> {
    const { username, password } = await databaseService.createRandomTestUser();

    const { user, access_token } = await loginAccount(app, username, password);

    return { user, access_token };
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
        role: expect.any(String),
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

    describe('when a username is submitted in an inappropriate format', () => {
      it('should return messages with error', async () => {
        const result = await sendAvailableRequest('us_23_!_');

        expect(result.body.message).toEqual(expect.any(Array));
        expect(result.body.error).toBe('Bad Request');
      });
    });

    describe('when unregistered username sent', () => {
      it('should return username available message', async () => {
        const result = await sendAvailableRequest('micheal');

        expect(result.body.message).toBe(USERNAME_AVAILABLE);
      });
    });

    describe('when registered username sent', () => {
      it('should return username taken message with error', async () => {
        const { user } = await takeToken();

        const result = await sendAvailableRequest(user.username);

        expect(result.body.message).toBe(USERNAME_TAKEN);
        expect(result.body.error).toBe('Bad Request');
      });
    });
  });
});
