import { Injectable } from '@nestjs/common';
import { NotificationsService } from 'src/global/notifications/services/notifications.service';
import { NotificationsGateway } from '../../gateways/notifications.gateway';

@Injectable()
export class GatewayEventsService {
  constructor(
    private readonly notificationsGateway: NotificationsGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  async newNotification(notificationID: string) {
    const notification = await this.notificationsService.getOneByID(
      notificationID,
    );

    await this.notificationsGateway.pushNotification(notification);
  }
}
