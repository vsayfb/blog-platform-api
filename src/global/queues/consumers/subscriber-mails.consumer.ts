import { Inject, Injectable } from '@nestjs/common';
import { Connection } from 'amqplib';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { MailsService } from 'src/mails/mails.service';
import { CreatedPostDto } from 'src/posts/response-dto/created-post.dto';
import { RABBIT_CLIENT } from 'src/rabbit/constants';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { QUEUES } from '../constants/queue.constant';

@Injectable()
export class SubscriberMailsConsumer {
  constructor(
    @Inject(RABBIT_CLIENT) private readonly rabbitMQ: Connection,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly mailsService: MailsService,
  ) {}

  async consume() {
    const channel = await this.rabbitMQ.createChannel();

    const { queue } = await channel.assertQueue(
      QUEUES.SUBSCRIBER_MAILS_NOTIFICATIONS,
      {
        durable: true,
      },
    );

    channel.consume(
      queue,
      async (msg) => {
        try {
          const content = JSON.parse(msg.content.toString()) as unknown as {
            author: SelectedAccountFields;
            subject: string;
            post: CreatedPostDto;
          };

          const { author, subject, post } = content;

          const subs = await this.subscriptionsService.getSubscribers(
            author.id,
          );

          this.mailsService.send(
            subs.map((s) => s.email).join(', '),
            `@${author.username} ${subject}`,
            post.content,
          );

          channel.ack(msg);
        } catch (error) {
          console.log('queue error', error);
        }
      },
      { noAck: false },
    );
  }
}
