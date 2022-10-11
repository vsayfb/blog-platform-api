jest.setTimeout(30000);

import { NotificationsGateway } from 'src/gateways/notifications.gateway';
import { initializeEndToEndTestModule } from '../helpers/utils/initializeEndToEndTestModule';
import { io, Socket } from 'socket.io-client';
import { INestApplication } from '@nestjs/common';
import { HelpersService } from '../helpers/helpers.service';
import { NotificationsService } from 'src/global/notifications/services/notifications.service';
import { NotificationActions } from 'src/global/notifications/enums/notification-actions';
import { Notification } from 'src/global/notifications/entities/notification.entity';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import {
  DatabaseUser,
  TestDatabaseService,
} from '../helpers/database/database.service';

describe('NotificationsGateway', () => {
  let notificationsGateway: NotificationsGateway;
  let helpersService: HelpersService;
  let notificationsService: NotificationsService;
  let testDatabaseService: TestDatabaseService;
  let app: INestApplication;
  let appUrl: string;

  beforeAll(async () => {
    const { moduleRef, nestApp } = await initializeEndToEndTestModule();

    app = nestApp;

    const { address, port } = app.getHttpServer().listen().address();

    appUrl = `http://[${address}]:${port}`;

    notificationsGateway =
      moduleRef.get<NotificationsGateway>(NotificationsGateway);

    helpersService = moduleRef.get<HelpersService>(HelpersService);

    testDatabaseService =
      moduleRef.get<TestDatabaseService>(TestDatabaseService);

    notificationsService =
      moduleRef.get<NotificationsService>(NotificationsService);
  });

  afterAll(async () => {
    await testDatabaseService.disconnectDatabase();
  });

  function initializeClientSocket(token?: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      const socket = io(`${appUrl}/notifications`, {
        auth: { token },
      });

      socket.on('connect', () => {
        resolve(socket);
      });

      socket.on('connect_error', (reason) => {
        reject(reason);
      });
    });
  }

  function destroyClientSocket(socket: Socket) {
    return new Promise((resolve, reject) => {
      socket.disconnect();

      if (socket.disconnected) resolve(true);
      else reject('Error');
    });
  }

  describe('handleConnection', () => {
    describe('when handleConnection is called', () => {
      describe('scenario : if user has not a token', () => {
        test('notifications socket count should be 0', async () => {
          const socket = await initializeClientSocket();

          expect(notificationsGateway.socketCount).toBe(0);

          await destroyClientSocket(socket);
        });
      });
      describe('scenario : if user has a token', () => {
        let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

        beforeEach(async () => {
          const user = await helpersService.loginRandomAccount(app);

          socket = await initializeClientSocket(user.token);
        });

        afterEach(async () => {
          await destroyClientSocket(socket);
        });

        test('notifications socket count should be 1', () => {
          expect(notificationsGateway.socketCount).toBe(1);
        });
      });
    });
  });

  describe('handleDisconnect', () => {
    describe('when handleDisconnect is called', () => {
      let socket: Socket;

      beforeEach(async () => {
        const user = await helpersService.loginRandomAccount(app);

        socket = await initializeClientSocket(user.token);
      });

      afterEach(async () => {
        await destroyClientSocket(socket);
      });

      test('should reduce the number of sockets by one', async () => {
        const currentSocketCount = notificationsGateway.socketCount;

        expect(currentSocketCount).toBe(1);

        notificationsGateway.handleDisconnect(socket as any);

        expect(notificationsGateway.socketCount).toBe(currentSocketCount - 1);
      });
    });
  });

  describe('pushNotification', () => {
    describe('when pushNotification is called', () => {
      let notification: Notification;
      let notifableSocket: Socket;
      let senderSocket: Socket;

      let senderUser: { token: string; user: DatabaseUser };

      beforeEach(async () => {
        const notifableUser = await helpersService.loginRandomAccount(app);

        senderUser = await helpersService.loginRandomAccount(app);

        notifableSocket = await initializeClientSocket(notifableUser.token);

        senderSocket = await initializeClientSocket(senderUser.token);

        notification = await notificationsService.create({
          action: NotificationActions.Followed,
          notifableID: notifableUser.user.id,
          senderID: senderUser.user.id,
        });
      });

      afterEach(async () => {
        await destroyClientSocket(notifableSocket);
        await destroyClientSocket(senderSocket);
      });

      test('should emit the notification to the client', async () => {
        notifableSocket.on('notification', (notification: Notification) => {
          expect(notification).toEqual({
            id: notification.id,
            action: NotificationActions.Followed,
            seen: false,
            sender: expect.objectContaining({ id: senderUser.user.id }),
            post: null,
            comment: null,
            createdAt: expect.any(String),
          });
        });

        expect(notificationsGateway.socketCount).toBe(2);

        await notificationsGateway.pushNotification(notification);
      });
    });
  });
});
