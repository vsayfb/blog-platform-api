import { BadGatewayException, Inject, Injectable } from '@nestjs/common';
import { Connection } from 'amqplib';
import { MailsService } from 'src/mails/mails.service';
import { RABBIT_CLIENT } from 'src/global/rabbit/constants';
import { QUEUES } from '../constants/queue.constant';

@Injectable()
export class RegisterMailsConsumer {
  constructor(
    @Inject(RABBIT_CLIENT) private readonly rabbitMQ: Connection,
    private readonly mailsService: MailsService,
  ) {}

  async consume() {
    const channel = await this.rabbitMQ.createChannel();

    const { queue } = await channel.assertQueue(
      QUEUES.REGISTER_MAIL_NOTIFICATION,
      {
        durable: false,
        messageTtl: 300000,
      },
    );
    channel.consume(
      queue,
      async (msg) => {
        try {
          const content = JSON.parse(msg.content.toString()) as unknown as {
            to: string;
            subject: string;
            template: string;
            username: string;
            code: string;
          };

          const { to, subject, template, username, code } = content;

          await this.mailsService.sendTemplate(to, subject, template, {
            username,
            code,
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
