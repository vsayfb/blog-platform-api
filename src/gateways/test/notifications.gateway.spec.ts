import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { GatewayEventsService } from 'src/global/events/__mocks__/gateway-events.service';
import { NotificationsService } from 'src/global/notifications/services/notifications.service';
import { notificationStub } from 'src/global/notifications/stub/notification-stub';
import { NotificationsGateway } from '../notifications.gateway';

jest.mock('src/global/notifications/services/notifications.service');

describe('NotificationsGateway', () => {
  let notificationsGateway: NotificationsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        GatewayEventsService,
        NotificationsService,
        { provide: JwtService, useValue: {} },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    notificationsGateway =
      module.get<NotificationsGateway>(NotificationsGateway);
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
