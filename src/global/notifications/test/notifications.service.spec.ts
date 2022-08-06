import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { jwtPayloadStub } from 'src/auth/stub/jwt-payload.stub';
import { mockRepository } from '../../../../test/utils/mockRepository';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { NotificationsService } from '../services/notifications.service';
import { notificationStub } from '../stub/notification-stub';
import { CreateNotificationDto } from '../dto/create-notification-dto';

describe('NotificationsService', () => {
  let notificationsService: NotificationsService;
  let notificationsRepository: Repository<Notification>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useClass: Repository<Notification>,
        },
      ],
    }).compile();

    notificationsService =
      module.get<NotificationsService>(NotificationsService);

    notificationsRepository = module.get<Repository<Notification>>(
      getRepositoryToken(Notification),
    );

    mockRepository(notificationsRepository, Notification);
  });

  describe('create', () => {
    describe('when create is called', () => {
      const dto: CreateNotificationDto = {
        senderID: notificationStub().sender.id,
        notifableID: notificationStub().notifable.id,
        action: notificationStub().action,
      };
      let result: Notification;

      beforeEach(async () => {
        jest.spyOn(notificationsService, 'getOneByID');

        result = await notificationsService.create(dto);
      });

      test('calls notificationsRepository.save', () => {
        expect(notificationsRepository.save).toBeCalledWith({
          sender: { id: dto.senderID },
          notifable: { id: dto.notifableID },
          action: dto.action,
        });
      });

      test('calls this.getOneByID', () => {
        expect(notificationsService.getOneByID).toHaveBeenCalled();
      });

      it('should return the created notification', () => {
        expect(result).toEqual(notificationStub());
      });
    });
  });

  describe('getAccountNotifications', () => {
    describe('when getAccountNotifications is called', () => {
      let result: Notification[];
      const account = jwtPayloadStub();

      beforeEach(async () => {
        result = await notificationsService.getAccountNotifications(
          account.sub,
        );
      });

      test('calls notificationsRepository.save', () => {
        expect(notificationsRepository.find).toBeCalledWith({
          where: { notifable: { id: account.sub } },
          relations: { notifable: false },
        });
      });

      it('should return the an array of notifications', () => {
        expect(result).toEqual([notificationStub()]);
      });
    });
  });

  describe('delete', () => {
    describe('when delete is called', () => {
      let result: string;
      const notification = notificationStub();

      beforeEach(async () => {
        result = await notificationsService.delete(notification);
      });

      test('calls notificationsRepository.remove', () => {
        expect(notificationsRepository.remove).toHaveBeenCalledWith(
          notification,
        );
      });

      it('should return deleted notification id', () => {
        expect(result).toEqual(notification.id);
      });
    });
  });

  describe('update', () => {
    describe('when update is called', () => {
      let result: string;
      const notification = notificationStub();

      beforeEach(async () => {
        result = await notificationsService.update(notification);
      });

      test('calls notificationsRepository.save', () => {
        expect(notificationsRepository.save).toHaveBeenCalledWith(notification);
      });

      it('should return updated notification id', () => {
        expect(result).toEqual(notification.id);
      });
    });
  });

  describe('getOneByID', () => {
    describe('when getOneByID is called', () => {
      let result: Notification;
      const notificationID = notificationStub().id;

      beforeEach(async () => {
        result = await notificationsService.getOneByID(notificationID);
      });

      test('calls notificationsRepository.findOne', () => {
        expect(notificationsRepository.findOne).toHaveBeenCalledWith({
          where: { id: notificationID },
        });
      });

      it('should return the notification', () => {
        expect(result).toEqual(notificationStub());
      });
    });
  });

  describe('getOne', () => {
    describe('when getOne is called', () => {
      let result: Notification;
      const username = notificationStub().notifable.username;

      beforeEach(async () => {
        result = await notificationsService.getOne(username);
      });

      test('calls notificationsRepository.findOne', () => {
        expect(notificationsRepository.findOne).toHaveBeenCalledWith({
          where: { notifable: { username } },
        });
      });

      it('should return the notification', () => {
        expect(result).toEqual(notificationStub());
      });
    });
  });

  describe('getAll', () => {
    describe('when getAll is called', () => {
      let result: Notification[];

      beforeEach(async () => {
        result = await notificationsService.getAll();
      });

      test('calls notificationsRepository.find', () => {
        expect(notificationsRepository.find).toHaveBeenCalledWith();
      });

      it('should return an array of notifications', () => {
        expect(result).toEqual([notificationStub()]);
      });
    });
  });
});
