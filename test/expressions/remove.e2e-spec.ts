jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { ExpressionRoutes } from 'src/expressions/enums/expression-routes';
import { ExpressionMessages } from 'src/expressions/enums/expressions-messages';
import { EXPRESSIONS_ROUTE } from 'src/lib/constants';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import * as request from 'supertest';

jest.mock('src/gateways/notifications.gateway');

describe('(DELETE) remove', () => {
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

  async function removeExpression(id: string, token: string) {
    const result: {
      body: {
        id: string;
        message: ExpressionMessages;
      };
    } = await request(server)
      .delete(EXPRESSIONS_ROUTE + ExpressionRoutes.REMOVE + id)
      .set('Authorization', token);

    return result.body;
  }

  describe('scenario : if user remove another user expression', () => {
    test('should throw Forbidden', async () => {
      const user = await helpersService.loginRandomAccount(app);
      const anotherUser = await helpersService.loginRandomAccount(app);

      const created = await helpersService.createRandomExpression(
        app,
        user.token,
      );

      const result = await removeExpression(created.data.id, anotherUser.token);

      expect(result.message).toBe('Forbidden resource');
    });
  });

  describe('scenario : if user remove own expression', () => {
    test('should return removed message', async () => {
      const user = await helpersService.loginRandomAccount(app);

      const created = await helpersService.createRandomExpression(
        app,
        user.token,
      );

      const result = await removeExpression(created.data.id, user.token);

      expect(result.message).toBe(ExpressionMessages.DELETED);
    });
  });
});
