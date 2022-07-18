import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../src/database/database.service';
import * as request from 'supertest';
import { loginAccount } from './helpers/loginAccount';
import { AccountMessages } from 'src/accounts/enums/account-messages';
import { AccountRoutes } from 'src/accounts/enums/account-routes';
import { FakeUser, generateFakeUser } from './helpers/faker/generateFakeUser';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { JwtPayload } from 'src/lib/jwt.payload';
import { AccountProfileDto } from 'src/accounts/dto/account-profile.dto';

const PREFIX = '/accounts';

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
    user: { username: string; display_name: string };
    access_token: string;
  }> {
    const { email, password, ...createdUser } =
      await databaseService.createRandomTestUser();

    const { access_token } = await loginAccount(
      app,
      createdUser.username,
      password,
    );

    return { user: createdUser, access_token };
  }

  describe('GET me', () => {
    it('should return the jwt payload', async () => {
      const { access_token, user } = await takeToken();

      const result: {
        body: JwtPayload;
      } = await request(app.getHttpServer())
        .get(PREFIX + AccountRoutes.FIND_ME)
        .set('Authorization', `Bearer ${access_token}`);

      expect(result.body).toEqual({
        username: user.username,
        display_name: user.display_name,
        image: null,
        sub: expect.any(String),
        iat: expect.any(Number),
        exp: expect.any(Number),
        role: expect.any(String),
      });
    });
  });

  describe('GET profile', () => {
    describe('scenario : a profile found', () => {
      test('it should return an account found', async () => {
        const user = await takeToken();

        const result: {
          body: { data: AccountProfileDto; message: AccountMessages.FOUND };
        } = await request(app.getHttpServer()).get(
          PREFIX + AccountRoutes.PROFILE + user.user.username,
        );

        expect(result.body.message).toBe(AccountMessages.FOUND);
      });
    });

    describe('scenario : a profile not found', () => {
      test('it should return account not found', async () => {
        const result = await request(app.getHttpServer()).get(
          PREFIX + AccountRoutes.PROFILE + generateFakeUser().username,
        );

        expect(result.body.message).toBe(AccountMessages.NOT_FOUND);
      });
    });
  });

  describe('GET is_available_username', () => {
    async function sendAvailableRequest(username: string) {
      const result = await request(app.getHttpServer()).get(
        '/accounts' +
          AccountRoutes.IS_AVAILABLE_USERNAME +
          `?username=${username}`,
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

        expect(result.body.message).toBe(AccountMessages.USERNAME_AVAILABLE);
      });
    });

    describe('when registered username sent', () => {
      it('should return username taken message with error', async () => {
        const { user } = await takeToken();

        const result = await sendAvailableRequest(user.username);

        expect(result.body.message).toBe(AccountMessages.USERNAME_TAKEN);
        expect(result.statusCode).toBe(400);
      });
    });
  });
});
