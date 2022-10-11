jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AccountRoutes } from 'src/accounts/enums/account-routes';
import { ACCOUNTS_ROUTE } from 'src/lib/constants';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import { AccountMessages } from 'src/accounts/enums/account-messages';

describe('(GET) is available username ', () => {
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

  async function sendAvailableRequest(username: string) {
    const result = await request(server).get(
      ACCOUNTS_ROUTE +
        AccountRoutes.IS_AVAILABLE_USERNAME +
        `?username=${username}`,
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
