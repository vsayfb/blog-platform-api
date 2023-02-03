import { Inject, Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';
import { Connection, Options } from 'amqplib';
import { RABBIT_CONNECTION_URI } from './constants';

@Injectable()
export class RabbitService {
  constructor(
    @Inject(RABBIT_CONNECTION_URI)
    private readonly options: Options.Connect,
  ) {}

  private connected = false;
  private connection: amqp.Connection;

  async getClient(): Promise<Connection> {
    if (this.connected) {
      return this.connection;
    }

    try {
      const conn = await amqp.connect(this.options);

      this.connected = true;

      return conn;
    } catch (error) {
      throw error;
    }
  }
}
