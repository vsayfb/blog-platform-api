import { Client } from '@elastic/elasticsearch';
import { Inject, Injectable } from '@nestjs/common';
import { ELASTIC_CLIENT } from 'src/elastic/constants';
import { LogData } from './types/log-data.type';

@Injectable()
export class LoggingService {
  constructor(@Inject(ELASTIC_CLIENT) private readonly elastic: Client) {}

  async log(data: LogData) {
    if (!data.exception) {
      try {
        await this.elastic.index({
          index: 'info',
          document: data,
        });
      } catch (error) {
        console.error('index error', error.message);
      }
    } else {
      try {
        switch (true) {
          case data.exception.status >= 400 && data.exception.status <= 499:
            await this.elastic.index({
              index: 'http_errors',
              document: { ...data, exception: JSON.stringify(data.exception) },
            });
            break;
          default:
            await this.elastic.index({
              index: 'app_errors',
              document: { ...data, exception: JSON.stringify(data.exception) },
            });
            break;
        }
      } catch (error) {
        console.error('index error', error.message);
      }
    }
  }
}
