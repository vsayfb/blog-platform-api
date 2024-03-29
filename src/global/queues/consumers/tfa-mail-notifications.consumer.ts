import { Inject, Injectable } from '@nestjs/common';
import { Connection } from 'amqplib';
import { MailsService } from 'src/mails/mails.service';
import { RABBIT_CLIENT } from 'src/global/rabbit/constants';
import { QUEUES } from '../constants/queue.constant';

@Injectable()
export class TfaMailNotificationsConsumer {
  constructor(
    @Inject(RABBIT_CLIENT) private readonly rabbitMQ: Connection,
    private readonly mailsService: MailsService,
  ) {}

  async consume() {
    const channel = await this.rabbitMQ.createChannel();

    const { queue } = await channel.assertQueue(QUEUES.TFA_MAIL_NOTIFICATIONS, {
      durable: false,
      messageTtl: 120000,
    });

    channel.consume(
      queue,
      async (msg) => {
        try {
          const content = JSON.parse(msg.content.toString()) as unknown as {
            to: string;
            subject: string;
            data: string;
          };

          const { to, subject, data } = content;

          await this.mailsService.send(to, subject, data);

          channel.ack(msg);
        } catch (error) {
          console.log('queue error', error);
        }
      },
      { noAck: false },
    );
  }
}
