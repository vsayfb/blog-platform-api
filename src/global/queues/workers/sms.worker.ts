import { Inject, Injectable } from '@nestjs/common';
import { Channel, Connection } from 'amqplib';
import { RABBIT_CLIENT } from 'src/global/rabbit/constants';
import { SmsNotificationsConsumer } from '../consumers/sms-notifications.consumer';
import { QUEUES } from '../constants/queue.constant';

@Injectable()
export class SmsWorker {
  private channel: Channel;

  constructor(
    @Inject(RABBIT_CLIENT) private readonly rabbitMQ: Connection,
    private readonly smsNotificationsConsumer: SmsNotificationsConsumer,
  ) {
    this.rabbitMQ.createChannel().then((ch) => {
      this.channel = ch;

      this.smsNotificationsConsumer.consume();
    });
  }

  produce(data: { to: string; content: string }, priority = 0) {
    this.channel.sendToQueue(
      QUEUES.SMS_NOTIFICATIONS,
      Buffer.from(JSON.stringify(data)),
      {
        priority,
      },
    );
  }
}
