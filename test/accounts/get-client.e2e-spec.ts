jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AccountRoutes } from 'src/accounts/enums/account-routes';
import { JwtPayload } from 'src/lib/jwt.payload';
import { ACCOUNTS_ROUTE } from 'src/lib/constants';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';

describe('(GET) client ', () => {
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

  it('should return the jwt payload', async () => {
    const user = await helpersService.loginRandomAccount(app);

    const result: {
      body: JwtPayload;
    } = await request(server)
      .get(ACCOUNTS_ROUTE + AccountRoutes.CLIENT)
      .set('Authorization', user.token);

    expect(result.body.username).toEqual(user.user.username);
  });
});
