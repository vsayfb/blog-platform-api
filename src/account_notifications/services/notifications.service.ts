import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHED_ROUTES } from 'src/cache/constants/cached-routes';
import { CacheJsonService } from 'src/cache/services/cache-json.service';
import { IDeleteService } from 'src/lib/interfaces/delete-service.interface';
import { IFindService } from 'src/lib/interfaces/find-service.interface';
import { IUpdateService } from 'src/lib/interfaces/update-service.interface';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationActions,
} from '../entities/notification.entity';
import { AccountNotification } from '../types/account-notification';

@Injectable()
export class NotificationsService
  implements IFindService, IDeleteService, IUpdateService
{
  constructor(
    @InjectRepository(Notification)
    protected readonly notificationsRepository: Repository<Notification>,
    protected readonly cacheJsonService: CacheJsonService,
  ) {}

  async getAccountNotifications(
    accountID: string,
  ): Promise<AccountNotification[]> {
    return this.notificationsRepository.find({
      where: { notifable: { id: accountID } },
      relations: { notifable: false },
    });
  }

  async getAccountNotificationCount(accountID: string): Promise<number> {
    return this.notificationsRepository.count({
      where: { notifable: { id: accountID }, seen: false },
    });
  }

  async delete(subject: Notification): Promise<string> {
    const removedNotification = { ...subject };

    await this.notificationsRepository.remove(subject);

    this.cacheJsonService.removeFromArray(
      CACHED_ROUTES.CLIENT_NOTIFS + subject.notifable.id,
      removedNotification,
    );

    return removedNotification.id;
  }

  async deleteNotificationByIds(
    senderID: string,
    notifableID: string,
    action: NotificationActions,
  ): Promise<void> {
    const notification = await this.notificationsRepository.findOne({
      where: {
        notifable: { id: notifableID },
        sender: { id: senderID },
        action,
      },
    });

    await this.delete(notification);
  }

  async update(subject: Notification): Promise<string> {
    subject.seen = true;

    await this.notificationsRepository.save(subject);

    this.cacheJsonService.removeFromArray(
      CACHED_ROUTES.CLIENT_NOTIFS + subject.notifable.id,
      subject,
    );

    return subject.id;
  }

  async getOneByID(id: string): Promise<Notification> {
    return await this.notificationsRepository.findOne({
      where: { id },
      relations: { notifable: true },
    });
  }

  async getAll(): Promise<Notification[]> {
    return this.notificationsRepository.find();
  }
}
