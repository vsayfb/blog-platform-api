import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from 'src/notifications/services/notifications.service';
import { notificationStub } from 'src/notifications/stub/notification-stub';
import { SocketAuthGuard } from '../guards/socket-auth.guard';
import { NotificationsGateway } from '../notifications.gateway';
import { NotificationsGatewayService } from '../services/notifications-gateway.service';

jest.mock('src/notifications/services/notifications.service');
jest.mock('src/gateways/notifications.gateway');

describe('NotificationsGatewayService', () => {
  let notificationsGatewayService: NotificationsGatewayService;
  let notificationsGateway: NotificationsGateway;
  let notificationsService: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGatewayService,
        NotificationsService,
        NotificationsGateway,
        { provide: SocketAuthGuard, useValue: {} },
      ],
    }).compile();

    notificationsGatewayService = module.get<NotificationsGatewayService>(
      NotificationsGatewayService,
    );

    notificationsService =
      module.get<NotificationsService>(NotificationsService);

    notificationsGateway =
      module.get<NotificationsGateway>(NotificationsGateway);
  });

  describe('sendNotification', () => {
    describe('when sendNotification is called', () => {
      let result: void;

      const notification = notificationStub();

      beforeEach(async () => {
        result = await notificationsGatewayService.sendNotification(
          notification.id,
        );
      });

      test('calls notificationsService.getOneByID', () => {
        expect(notificationsService.getOneByID).toHaveBeenCalledWith(
          notification.id,
        );
      });

      test('calls notificationsGateway.pushNotification', () => {
        expect(notificationsGateway.pushNotification).toHaveBeenCalledWith(
          notification,
        );
      });

      it('should return undefined (void)', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
