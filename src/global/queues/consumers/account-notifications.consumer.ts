import { Inject, Injectable } from '@nestjs/common';
import { Connection } from 'amqplib';
import { NotificationsService } from 'src/account_notifications/services/notifications.service';
import { CACHED_ROUTES } from 'src/cache/constants/cached-routes';
import { CacheJsonService } from 'src/cache/services/cache-json.service';
import { NotificationsGateway } from 'src/gateways/notifications.gateway';
import { RABBIT_CLIENT } from 'src/rabbit/constants';
import { QUEUES } from '../constants/queue.constant';

@Injectable()
export class AccountNotificationsConsumer {
  constructor(
    @Inject(RABBIT_CLIENT) private readonly rabbitMQ: Connection,
    private readonly notificationsService: NotificationsService,
    private readonly cacheJsonService: CacheJsonService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async consume() {
    const channel = await this.rabbitMQ.createChannel();

    const { queue } = await channel.assertQueue(QUEUES.ACCOUNT_NOTIFICATIONS, {
      durable: true,
    });

    channel.consume(
      queue,
      async (msg) => {
        const notificationID = msg.content.toString();

        const notification = await this.notificationsService.getOneByID(
          notificationID,
        );

        this.cacheJsonService.insertToArray(
          CACHED_ROUTES.CLIENT_NOTIFS + notification.notifable.id,
          notification,
        );

        this.notificationsGateway.pushNotification(notification);

        channel.ack(msg);
      },
      { noAck: false },
    );
  }
}
