import { Injectable } from '@nestjs/common';
import { NotificationsService } from 'src/notifications/services/notifications.service';
import { NotificationsGateway } from '../notifications.gateway';

@Injectable()
export class NotificationsGatewayService {
  constructor(
    private readonly notificationsGateway: NotificationsGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  async sendNotification(notificationID: string) {
    const notification = await this.notificationsService.getOneByID(
      notificationID,
    );

    await this.notificationsGateway.pushNotification(notification);
  }
}
