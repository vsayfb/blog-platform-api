import { Inject, Injectable } from '@nestjs/common';
import { Connection } from 'amqplib';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { NotificationObject } from 'src/account_notifications/entities/notification.entity';
import { NotificationsGateway } from 'src/gateways/notifications.gateway';
import { CreatedPostDto } from 'src/posts/response-dto/created-post.dto';
import { RABBIT_CLIENT } from 'src/rabbit/constants';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
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
        const content = msg.content.toString() as unknown as {
          subject: string;
          author: SelectedAccountFields;
          post: CreatedPostDto;
        };

        const { subject, author, post } = content;

        const subs = await this.subscriptionsService.getSubscribers(
          content.author.id,
        );

        subs.forEach((sub) => {
          this.notificationsGateway.pushNotification({
            action: subject,
            notifable: { id: sub.id },
            object: NotificationObject.POST,
            post,
            sender: author,
            created_at: new Date(),
            updated_at: new Date(),
          } as any);
        });

        channel.ack(msg);
      },
      { noAck: false },
    );
  }
}
