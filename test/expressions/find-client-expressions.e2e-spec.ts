jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { AccountExpressionsDto } from 'src/expressions/dto/account-expressions.dto';
import { ExpressionRoutes } from 'src/expressions/enums/expression-routes';
import { ExpressionMessages } from 'src/expressions/enums/expressions-messages';
import { EXPRESSIONS_ROUTE } from 'src/lib/constants';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import * as request from 'supertest';

jest.mock('src/gateways/notifications.gateway');

describe('(GET) find client expressions', () => {
  let app: INestApplication;
  let helpersService: HelpersService;
  let databaseService: TestDatabaseService;
  let server: any;

  beforeAll(async () => {
    const { nestApp, database, helpers } = await initializeEndToEndTestModule();

    app = nestApp;
    helpersService = helpers;
    databaseService = database;
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await databaseService.clearAllTables();
    await databaseService.disconnectDatabase();
    await app.close();
  });

  test('should return an array of expressions', async () => {
    const account = await helpersService.loginRandomAccount(app);

    const result: {
      body: { data: AccountExpressionsDto[]; message: ExpressionMessages };
    } = await request(server)
      .get(EXPRESSIONS_ROUTE + ExpressionRoutes.CLIENT)
      .set('Authorization', account.token);

    expect(result.body.message).toBe(ExpressionMessages.ALL_FOUND);
  });
});
