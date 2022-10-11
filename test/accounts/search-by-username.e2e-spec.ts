jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AccountRoutes } from 'src/accounts/enums/account-routes';
import { ACCOUNTS_ROUTE } from 'src/lib/constants';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { AccountMessages } from 'src/accounts/enums/account-messages';

describe('(GET) search by username ', () => {
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

  async function sendSearchByUsernameRequest(username: string) {
    let user = await helpersService.loginRandomAccount(app);

    const result: {
      body: { data: SelectedAccountFields[]; message: AccountMessages };
    } = await request(server)
      .get(
        ACCOUNTS_ROUTE +
          AccountRoutes.SEARCH_BY_USERNAME +
          `?username=${username}`,
      )
      .set('Authorization', user.token);

    return result;
  }

  it('should return accounts have been found message', async () => {
    const { user } = await helpersService.loginRandomAccount(app);

    const result = await sendSearchByUsernameRequest(user.username);

    expect(result.body.message).toBe(AccountMessages.FOUND_BY_USERNAME);
  });
});
