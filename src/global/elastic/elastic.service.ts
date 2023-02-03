import { Inject, Injectable } from '@nestjs/common';
import { Client, ClientOptions } from '@elastic/elasticsearch';
import { ELASTIC_CLIENT_OPTS } from './constants';

@Injectable()
export class ElasticService {
  private client: Client;

  constructor(
    @Inject(ELASTIC_CLIENT_OPTS) private readonly opts: ClientOptions,
  ) {}

  async getClient() {
    if (!this.client) {
      this.client = new Client(this.opts);
    }

    return this.client;
  }
}
