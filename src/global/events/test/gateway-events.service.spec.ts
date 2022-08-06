import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from 'src/global/notifications/services/notifications.service';
import { notificationStub } from 'src/global/notifications/stub/notification-stub';
import { SocketAuthGuard } from '../../../gateways/guards/socket-auth.guard';
import { NotificationsGateway } from '../../../gateways/notifications.gateway';
import { GatewayEventsService } from '../gateway-events.service';

jest.mock('src/global/notifications/services/notifications.service');
jest.mock('src/gateways/notifications.gateway');

describe('GatewayEventsService', () => {
  let gatewayEventsService: GatewayEventsService;
  let notificationsGateway: NotificationsGateway;
  let notificationsService: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GatewayEventsService,
        NotificationsService,
        NotificationsGateway,
        { provide: SocketAuthGuard, useValue: {} },
      ],
    }).compile();

    gatewayEventsService =
      module.get<GatewayEventsService>(GatewayEventsService);

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
        result = await gatewayEventsService.newNotification(notification.id);
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
