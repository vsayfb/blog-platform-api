import { Injectable } from '@nestjs/common';
import { INotificationService } from '../interfaces/notification-service.interface';
import { NotificationBy } from '../types/notification-by';
import { EmailNotificationService } from './email-notification.service';
import { MobilePhoneNotificationService } from './mobile-phone-notification.service';

@Injectable()
export class NotificationFactory {
  constructor(
    private readonly mobilePhoneNotificationService: MobilePhoneNotificationService,
    private readonly emailNotificationService: EmailNotificationService,
  ) {}

  createNotification(by: NotificationBy): INotificationService {
    switch (by) {
      case 'mobile_phone':
        return this.mobilePhoneNotificationService;

      case 'email':
        return this.emailNotificationService;

      default:
        throw new Error('Illegal argument exception');
    }
  }
}
