import { Inject, Injectable } from '@nestjs/common';
import { Channel, Connection } from 'amqplib';
import { LogData } from 'src/logging/types/log-data.type';
import { RABBIT_CLIENT } from 'src/rabbit/constants';
import { QUEUES } from '../constants/queue.constant';
import { LogsConsumer } from '../consumers/logs.consumer';

@Injectable()
export class LoggingWorker {
  private channel: Channel;

  constructor(
    @Inject(RABBIT_CLIENT) private readonly rabbit: Connection,
    private readonly logsConsumer: LogsConsumer,
  ) {
    this.rabbit.createChannel().then(async (c) => {
      this.channel = c;

      this.logsConsumer.consume();
    });
  }

  produce(log: LogData) {
    this.channel.sendToQueue(
      QUEUES.APPLICATION_LOGS,
      Buffer.from(JSON.stringify(log)),
      {
        persistent: true,
      },
    );
  }
}
