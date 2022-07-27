jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AccountMessages } from 'src/accounts/enums/account-messages';
import { AccountRoutes } from 'src/accounts/enums/account-routes';
import { JwtPayload } from 'src/lib/jwt.payload';
import { AccountProfileDto } from 'src/accounts/dto/account-profile.dto';
import { TestDatabaseService } from './database/database.service';
import { HelpersService } from './helpers/helpers.service';
import { initializeEndToEndTestModule } from './utils/initializeEndToEndTestModule';
import { generateFakeUser } from './utils/generateFakeUser';

const PREFIX = '/accounts';

describe('AccountController (e2e)', () => {
  let app: INestApplication;
  let databaseService: TestDatabaseService;
  let helpersService: HelpersService;
  let server: any;

  beforeAll(async () => {
    const { nestApp, database, helpers } = await initializeEndToEndTestModule();

    app = nestApp;
    databaseService = database;
    helpersService = helpers;
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await databaseService.clearAllTables();
    await databaseService.disconnectDatabase();
    await app.close();
  });

  describe('GET me', () => {
    it('should return the jwt payload', async () => {
      const user = await helpersService.loginRandomAccount(app);

      const result: {
        body: JwtPayload;
      } = await request(server)
        .get(PREFIX + AccountRoutes.FIND_ME)
        .set('Authorization', user.token);

      expect(result.body).toEqual({
        username: user.user.username,
        display_name: user.user.display_name,
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
        const user = await helpersService.loginRandomAccount(app);

        const result: {
          body: { data: AccountProfileDto; message: AccountMessages.FOUND };
        } = await request(server).get(
          PREFIX + AccountRoutes.PROFILE + user.user.username,
        );

        expect(result.body.message).toBe(AccountMessages.FOUND);
      });
    });

    describe('scenario : a profile not found', () => {
      test('it should return an account not found', async () => {
        const result = await request(server).get(
          PREFIX + AccountRoutes.PROFILE + generateFakeUser().username,
        );

        expect(result.body.message).toBe(AccountMessages.NOT_FOUND);
      });
    });
  });

  describe('GET is_available_username', () => {
    async function sendAvailableRequest(username: string) {
      const result = await request(server).get(
        PREFIX + AccountRoutes.IS_AVAILABLE_USERNAME + `?username=${username}`,
      );

      return result;
    }

    describe('when unregistered username sent', () => {
      it('should return username available message', async () => {
        const result = await sendAvailableRequest('micheal');

        expect(result.body.message).toBe(AccountMessages.USERNAME_AVAILABLE);
      });
    });

    describe('when registered username sent', () => {
      it('should return username taken message with error', async () => {
        const { user } = await helpersService.loginRandomAccount(app);

        const result = await sendAvailableRequest(user.username);

        expect(result.body.message).toBe(AccountMessages.USERNAME_TAKEN);
      });
    });
  });
});
