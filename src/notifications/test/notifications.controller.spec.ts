import { Test, TestingModule } from '@nestjs/testing';
import { jwtPayloadStub } from 'src/auth/stub/jwt-payload.stub';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { Notification } from '../entities/notification.entity';
import { NotificationMessages } from '../enums/notification-messages';
import { NotificationsController } from '../notifications.controller';
import { FollowNotificationsService } from '../services/follow-notifications.service';
import { NotificationsService } from '../services/notifications.service';
import { notificationStub } from '../stub/notification-stub';

jest.mock('src/notifications/services/notifications.service');

describe('NotificationsController', () => {
  let notificationsController: NotificationsController;

  let notificationsService: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        NotificationsService,
        { provide: 'SERVICE', useClass: NotificationsService },
        CaslAbilityFactory,
      ],
    }).compile();

    notificationsController = module.get<NotificationsController>(
      NotificationsController,
    );

    notificationsService =
      module.get<NotificationsService>(NotificationsService);
  });

  describe('findMyNotifications', () => {
    describe('when findMyNotifications is called', () => {
      let result: { data: Notification[]; message: NotificationMessages };
      const ME = jwtPayloadStub();

      beforeEach(async () => {
        result = await notificationsController.findMyNotifications(ME);
      });

      test('calls notificationsService.getAccountNotifications', () => {
        expect(
          notificationsService.getAccountNotifications,
        ).toHaveBeenCalledWith(ME.sub);
      });

      it('should return the array of notifications', () => {
        expect(result.data).toEqual([notificationStub()]);
      });
    });
  });

  describe('changeNotificationStatus', () => {
    describe('when changeNotificationStatus is called', () => {
      let result: { id: string; message: NotificationMessages };
      const notification = notificationStub();

      beforeEach(async () => {
        result = await notificationsController.changeNotificationStatus(
          notification,
        );
      });

      test('calls notificationsService.update', () => {
        expect(notificationsService.update).toHaveBeenCalledWith(notification);
      });

      it('should return the updated notification id ', () => {
        expect(result.id).toEqual(notification.id);
      });
    });
  });
});
