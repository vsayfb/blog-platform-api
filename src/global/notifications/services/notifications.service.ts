import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IDeleteService } from 'src/lib/interfaces/delete-service.interface';
import { IFindService } from 'src/lib/interfaces/find-service.interface';
import { IUpdateService } from 'src/lib/interfaces/update-service.interface';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationsService
  implements IFindService, IDeleteService, IUpdateService
{
  @InjectRepository(Notification)
  protected readonly notificationsRepository: Repository<Notification>;

  async getAccountNotifications(accountID: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { notifable: { id: accountID } },
      relations: { notifable: false },
    });
  }

  async delete(subject: Notification): Promise<string> {
    const ID = subject.id;

    await this.notificationsRepository.remove(subject);

    return ID;
  }

  async deleteNotificationByIds(
    senderID: string,
    notifableID: string,
  ): Promise<void> {
    const notification = await this.notificationsRepository.findOne({
      where: { notifable: { id: notifableID }, sender: { id: senderID } },
    });

    await this.delete(notification);
  }

  async update(subject: Notification): Promise<string> {
    subject.seen = false;

    await this.notificationsRepository.save(subject);

    return subject.id;
  }

  async getOneByID(id: string): Promise<Notification> {
    return await this.notificationsRepository.findOne({
      where: { id },
    });
  }

  async getAll(): Promise<Notification[]> {
    return this.notificationsRepository.find();
  }
}
