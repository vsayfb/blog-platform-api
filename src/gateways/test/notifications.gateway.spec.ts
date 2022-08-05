import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from 'src/notifications/services/notifications.service';
import { notificationStub } from 'src/notifications/stub/notification-stub';
import { NotificationsGateway } from '../notifications.gateway';
import { NotificationsGatewayService } from '../services/notifications-gateway.service';

jest.mock('src/notifications/services/notifications.service');

describe('NotificationsGateway', () => {
  let notificationsGateway: NotificationsGateway;
  let notificationsService: NotificationsService;
  let notificationsGatewayService: NotificationsGatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        NotificationsGatewayService,
        NotificationsService,
        { provide: JwtService, useValue: {} },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    notificationsGateway =
      module.get<NotificationsGateway>(NotificationsGateway);

    notificationsGatewayService = module.get<NotificationsGatewayService>(
      NotificationsGatewayService,
    );

    notificationsService =
      module.get<NotificationsService>(NotificationsService);
  });

  describe('pushNotification', () => {
    describe('when pushNotification is called', () => {
      let result: void;

      const notification = notificationStub();

      const senderSocket = {
        to: () => senderSocket,
        emit: () => senderSocket,
      };

      beforeEach(async () => {
        jest
          .spyOn(NotificationsGateway.prototype, 'getSenderSocket' as any)
          .mockResolvedValue(senderSocket);

        jest
          .spyOn(NotificationsGateway.prototype, 'getNotifableSocketID' as any)
          .mockResolvedValue('');

        result = await notificationsGateway.pushNotification(notification);
      });

      test('calls getSenderSocket method', () => {
        //@ts-ignore
        expect(notificationsGateway.getSenderSocket).toHaveBeenCalledWith(
          notification.sender.id,
        );
      });

      test('calls getNotifableSocketID method', () => {
        //@ts-ignore
        expect(notificationsGateway.getNotifableSocketID).toHaveBeenCalledWith(
          notification.notifable.id,
        );
      });

      it('should return undefined (void)', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
