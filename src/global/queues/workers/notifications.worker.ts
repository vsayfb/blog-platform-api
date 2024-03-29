import { Inject, Injectable } from '@nestjs/common';
import { Channel, Connection } from 'amqplib';
import { SelectedAccountFields } from 'src/resources/accounts/types/selected-account-fields';
import { CreatedPostDto } from 'src/resources/posts/response-dto/created-post.dto';
import { RABBIT_CLIENT } from 'src/global/rabbit/constants';
import { AccountNotificationsConsumer } from '../consumers/account-notifications.consumer';
import { SubscriberNotificationsConsumer } from '../consumers/subscriber-notifications.consumer';
import { QUEUES } from '../constants/queue.constant';

@Injectable()
export class NotificationsWorker {
  private channel: Channel;

  constructor(
    @Inject(RABBIT_CLIENT) private readonly rabbitMQ: Connection,
    private readonly accountNotificationsConsumer: AccountNotificationsConsumer,
    private readonly subscriberNotificationsConsumer: SubscriberNotificationsConsumer,
  ) {
    this.rabbitMQ.createChannel().then((ch) => {
      this.channel = ch;

      this.accountNotificationsConsumer.consume();
      this.subscriberNotificationsConsumer.consume();
    });
  }

  produceSubcriberNotifications({
    subject,
    post,
  }: {
    subject: string;
    post: CreatedPostDto;
  }) {
    this.channel.sendToQueue(
      QUEUES.SUBSCRIBER_NOTIFICATIONS,
      Buffer.from(JSON.stringify({ subject, post })),
      {
        persistent: true,
      },
    );
  }

  produceAccountsNotifications(notificationID: string) {
    this.channel.sendToQueue(
      QUEUES.ACCOUNT_NOTIFICATIONS,
      Buffer.from(notificationID),
      {
        persistent: true,
      },
    );
  }
}
