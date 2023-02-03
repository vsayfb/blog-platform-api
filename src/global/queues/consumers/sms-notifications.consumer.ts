import { Inject, Injectable } from '@nestjs/common';
import { Connection } from 'amqplib';
import { RABBIT_CLIENT } from 'src/global/rabbit/constants';
import { SmsService } from 'src/sms/sms.service';
import { QUEUES } from '../constants/queue.constant';

@Injectable()
export class SmsNotificationsConsumer {
  constructor(
    @Inject(RABBIT_CLIENT) private readonly rabbitMQ: Connection,
    private readonly smsService: SmsService,
  ) {}

  async consume() {
    const channel = await this.rabbitMQ.createChannel();

    const { queue } = await channel.assertQueue(QUEUES.SMS_NOTIFICATIONS, {
      durable: false,
      messageTtl: 300000,
    });

    channel.consume(
      queue,
      async (msg) => {
        try {
          const content = JSON.parse(msg.content.toString()) as unknown as {
            to: string;
            data: string;
          };

          const { to, data } = content;

          await this.smsService.send(to, data);

          channel.ack(msg);
        } catch (error) {
          console.log('queue error', error);
        }
      },
      { noAck: false },
    );
  }
}
