jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AccountRoutes } from 'src/accounts/enums/account-routes';
import { ACCOUNTS_ROUTE } from 'src/lib/constants';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import { AccountProfileDto } from 'src/profiles/dto/profile.dto';
import { AccountMessages } from 'src/accounts/enums/account-messages';
import { generateFakeUser } from 'test/helpers/utils/generateFakeUser';

describe('(GET) find profile ', () => {
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

  describe('scenario : a profile is found', () => {
    test('it should return a profile', async () => {
      const user = await helpersService.loginRandomAccount(app);

      const result: {
        body: { data: AccountProfileDto; message: AccountMessages.FOUND };
      } = await request(server).get(
        ACCOUNTS_ROUTE + AccountRoutes.PROFILE + user.user.username,
      );

      expect(result.body.message).toBe(AccountMessages.FOUND);
    });
  });

  describe('scenario : a profile is not found', () => {
    test('it should return the account not found message', async () => {
      const result = await request(server).get(
        ACCOUNTS_ROUTE + AccountRoutes.PROFILE + generateFakeUser().username,
      );

      expect(result.body.message).toBe(AccountMessages.NOT_FOUND);
    });
  });
});
