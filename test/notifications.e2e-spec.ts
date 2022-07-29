jest.setTimeout(30000);

import { INestApplication } from '@nestjs/common';
import { DatabaseUser, TestDatabaseService } from './database/database.service';
import { HelpersService } from './helpers/helpers.service';
import { initializeEndToEndTestModule } from './utils/initializeEndToEndTestModule';
import * as request from 'supertest';
import { FollowRoutes } from 'src/follow/enums/follow-routes';
import { NotificationRoutes } from 'src/notifications/enums/notification-routes';
import { Notification } from 'src/notifications/entities/notification.entity';
import { NotificationMessages } from 'src/notifications/enums/notification-messages';
import { Follow } from 'src/follow/entities/follow.entity';
import { FollowMessages } from 'src/follow/enums/follow-messages';
import { CommentRoutes } from 'src/comments/enums/comment-routes';

const PREFIX = '/notifications';

describe('Notifications (e2e)', () => {
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

  async function createNotification(
    followerToken: string,
    followedUsername: string,
  ) {
    // follow a user for new notification
    const result: {
      body: { data: Follow; message: FollowMessages };
      statusCode: number;
    } = await request(server)
      .post('/follow' + FollowRoutes.FOLLOW + followedUsername)
      .set('Authorization', followerToken);

    return result;
  }

  async function getNotifications(token: string) {
    const result = await request(server)
      .get(PREFIX + NotificationRoutes.ME)
      .set('Authorization', token);

    return result;
  }

  describe('/ (GET) findMyNotifications', () => {
    let user: { user: DatabaseUser; token: string };
    let otherUser: { user: DatabaseUser; token: string };

    beforeAll(async () => {
      user = await helpersService.loginRandomAccount(app);
      otherUser = await helpersService.loginRandomAccount(app);
    });

    test('should return an array of notifications', async () => {
      await createNotification(otherUser.token, user.user.username);

      const notifications = await getNotifications(user.token);

      expect(notifications.body.message).toEqual(
        NotificationMessages.ALL_FOUND,
      );
    });
  });

  describe('/ (PATCH) changeNotificationStatus', () => {
    let user: { user: DatabaseUser; token: string };
    let otherUser: { user: DatabaseUser; token: string };
    let notificationID: string;

    async function changeNotificationStatus(
      token: string,
      notificationID: string,
    ) {
      const result: {
        body: { data: Notification; message: NotificationMessages };
        statusCode: number;
      } = await request(server)
        .patch(PREFIX + NotificationRoutes.SEEN + notificationID)
        .set('Authorization', token);

      return result;
    }

    beforeAll(async () => {
      user = await helpersService.loginRandomAccount(app);

      otherUser = await helpersService.loginRandomAccount(app);

      await createNotification(otherUser.token, user.user.username);

      const notifications = await getNotifications(user.token);

      notificationID = notifications.body.data[0].id;
    });

    describe("scenario : other user changes user's notification status", () => {
      test('should return Forbidden Resource', async () => {
        const result = await changeNotificationStatus(
          otherUser.token,
          notificationID,
        );

        expect(result.statusCode).toBe(403);
      });
    });

    describe('scenario : user changes own notification status', () => {
      test('should return notification updated message', async () => {
        const result = await changeNotificationStatus(
          user.token,
          notificationID,
        );

        expect(result.body.message).toEqual(NotificationMessages.HIDDEN);
      });
    });
  });
});
