import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockRepository } from '../../../test/utils/mockRepository';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { FollowNotificationsService } from '../services/follow-notifications.service';
import { accountStub } from 'src/accounts/test/stub/account.stub';
import { randomUUID } from 'crypto';
import { NotificationActions } from '../enums/notification-actions';

describe('FollowNotificationsService', () => {
  let followNotificationsService: FollowNotificationsService;
  let notificationsRepository: Repository<Notification>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        FollowNotificationsService,
        { provide: getRepositoryToken(Notification), useClass: Repository },
      ],
    }).compile();

    followNotificationsService = moduleRef.get<FollowNotificationsService>(
      FollowNotificationsService,
    );
    notificationsRepository = moduleRef.get<Repository<Notification>>(
      getRepositoryToken(Notification),
    );

    mockRepository(notificationsRepository, Notification);
  });

  describe('createFollowedNotification', () => {
    describe('when createFollowedNotification is called ', () => {
      let result: { id: string };
      const dto = {
        senderID: accountStub().id,
        notifableID: randomUUID(),
      };

      beforeEach(async () => {
        result = await followNotificationsService.createFollowedNotification(
          dto,
        );
      });

      test('calls notificationsRepository.save', () => {
        expect(notificationsRepository.save).toHaveBeenCalledWith({
          sender: { id: dto.senderID },
          notifable: { id: dto.notifableID },
          action: NotificationActions.Followed,
        });
      });

      it("should return notification's id", () => {
        expect(result).toEqual({ id: expect.any(String) });
      });
    });
  });
});
