import { Inject, Injectable } from '@nestjs/common';
import { Connection } from 'amqplib';
import { LoggingService } from 'src/logging/logging.service';
import { LogData } from 'src/logging/types/log-data.type';
import { RABBIT_CLIENT } from 'src/global/rabbit/constants';
import { QUEUES } from '../constants/queue.constant';

@Injectable()
export class LogsConsumer {
  constructor(
    @Inject(RABBIT_CLIENT) private readonly rabbit: Connection,
    private readonly loggingService: LoggingService,
  ) {}

  async consume() {
    const channel = await this.rabbit.createChannel();

    const q = await channel.assertQueue(QUEUES.APPLICATION_LOGS, {
      durable: true,
    });

    channel.consume(
      q.queue,
      (msg) => {
        try {
          const message = JSON.parse(
            msg.content.toString(),
          ) as unknown as LogData;

          this.loggingService.log(message);

          channel.ack(msg);
        } catch (error) {
          console.log('queue error', error);
        }
      },
      { noAck: false },
    );
  }
}
