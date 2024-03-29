import { Inject, Injectable } from '@nestjs/common';
import { Connection } from 'amqplib';
import { NotificationObject } from 'src/resources/account_notifications/entities/account-notification.entity';
import { NotificationsGateway } from 'src/gateways/notifications.gateway';
import { CreatedPostDto } from 'src/resources/posts/response-dto/created-post.dto';
import { RABBIT_CLIENT } from 'src/global/rabbit/constants';
import { SubscriptionsService } from 'src/resources/subscriptions/subscriptions.service';
import { QUEUES } from '../constants/queue.constant';

@Injectable()
export class SubscriberNotificationsConsumer {
  constructor(
    @Inject(RABBIT_CLIENT) private readonly rabbitMQ: Connection,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async consume() {
    const channel = await this.rabbitMQ.createChannel();

    const { queue } = await channel.assertQueue(
      QUEUES.SUBSCRIBER_NOTIFICATIONS,
      {
        durable: true,
      },
    );

    channel.consume(
      queue,
      async (msg) => {
        try {
          const content = JSON.parse(msg.content.toString()) as unknown as {
            subject: string;
            post: CreatedPostDto;
          };

          const { subject, post } = content;

          console.log(content);

          const subs = await this.subscriptionsService.getSubscribers(
            post.author.id,
          );

          subs.forEach((sub) => {
            this.notificationsGateway.pushNotification({
              action: subject,
              notifable: { id: sub.id },
              object: NotificationObject.POST,
              post,
              sender: post.author,
              created_at: new Date(),
              updated_at: new Date(),
            } as any);
          });

          channel.ack(msg);
        } catch (error) {
          console.log('queue error', error);
        }
      },
      { noAck: false },
    );
  }
}
