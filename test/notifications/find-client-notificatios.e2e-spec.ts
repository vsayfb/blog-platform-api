jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { NotificationMessages } from 'src/global/notifications/enums/notification-messages';
import { NotificationRoutes } from 'src/global/notifications/enums/notification-routes';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import * as request from 'supertest';
import { NOTIFICATIONS_ROUTE } from 'src/lib/constants';

jest.mock('src/gateways/notifications.gateway');

describe('(GET) client notifications', () => {
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

  describe('/ (GET) findMyNotifications', () => {
    test('should return an array of notifications', async () => {
      const account = await helpersService.loginRandomAccount(app);

      const result = await request(server)
        .get(NOTIFICATIONS_ROUTE + NotificationRoutes.CLIENT)
        .set('Authorization', account.token);

      expect(result.body.message).toEqual(NotificationMessages.ALL_FOUND);
    });
  });
});
