jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { NotificationMessages } from 'src/account_notifications/enums/notification-messages';
import { NotificationRoutes } from 'src/account_notifications/enums/notification-routes';
import { TestDatabaseService } from 'test/helpers/database/database.service';
import { HelpersService } from 'test/helpers/helpers.service';
import { initializeEndToEndTestModule } from 'test/helpers/utils/initializeEndToEndTestModule';
import * as request from 'supertest';
import { FOLLOW_ROUTE, NOTIFICATIONS_ROUTE } from 'src/lib/constants';
import { FollowMessages } from 'src/follow/enums/follow-messages';
import { Follow } from 'src/follow/entities/follow.entity';
import { FollowRoutes } from 'src/follow/enums/follow-routes';

jest.mock('src/gateways/notifications.gateway');

describe('(PATCH) make visibility seen', () => {
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

  async function changeNotificationStatus(
    token: string,
    notificationID: string,
  ) {
    const result: {
      body: { data: Notification; message: NotificationMessages };
      statusCode: number;
    } = await request(server)
      .patch(NOTIFICATIONS_ROUTE + NotificationRoutes.SEEN + notificationID)
      .set('Authorization', token);

    return result;
  }

  async function getNotifications(token: string) {
    const result = await request(server)
      .get(NOTIFICATIONS_ROUTE + NotificationRoutes.CLIENT)
      .set('Authorization', token);

    return result;
  }

  async function createNotification(
    followerToken: string,
    followedUsername: string,
  ) {
    // follow a user for new notification
    const result: {
      body: { data: Follow; message: FollowMessages };
      statusCode: number;
    } = await request(server)
      .post(FOLLOW_ROUTE + FollowRoutes.FOLLOW + followedUsername)
      .set('Authorization', followerToken);

    return result;
  }

  describe("scenario :  user changes other user's notification visibility", () => {
    test('should return forbidden resource message', async () => {
      const user = await helpersService.loginRandomAccount(app);

      const otherUser = await helpersService.loginRandomAccount(app);

      await createNotification(otherUser.token, user.user.username);

      const notifications = await getNotifications(user.token);

      const result = await changeNotificationStatus(
        otherUser.token,
        notifications.body.data[0].id,
      );

      expect(result.statusCode).toBe(403);
    });
  });

  describe('scenario : user changes own notification status', () => {
    test('should return notification updated message', async () => {
      const user = await helpersService.loginRandomAccount(app);

      const otherUser = await helpersService.loginRandomAccount(app);

      await createNotification(otherUser.token, user.user.username);

      const notifications = await getNotifications(user.token);

      const result = await changeNotificationStatus(
        user.token,
        notifications.body.data[0].id,
      );

      expect(result.body.message).toEqual(NotificationMessages.HIDDEN);
    });
  });
});
