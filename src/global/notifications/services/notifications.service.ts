import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICrudService } from 'src/lib/interfaces/ICrudService';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from '../dto/create-notification-dto';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationsService implements ICrudService<Notification> {
  @InjectRepository(Notification)
  protected readonly notificationsRepository: Repository<Notification>;

  async create(notification: CreateNotificationDto): Promise<Notification> {
    const created = await this.notificationsRepository.save({
      sender: { id: notification.senderID },
      notifable: { id: notification.notifableID },
      action: notification.action,
    });

    return this.getOneByID(created.id);
  }

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

  getOne(username: string): Promise<Notification> {
    return this.notificationsRepository.findOne({
      where: { notifable: { username } },
    });
  }

  getAll(): Promise<Notification[]> {
    return this.notificationsRepository.find();
  }
}
