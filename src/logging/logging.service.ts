import { Client } from '@elastic/elasticsearch';
import { Inject, Injectable } from '@nestjs/common';
import { ELASTIC_CLIENT } from 'src/global/elastic/constants';
import { LogData } from './types/log-data.type';

@Injectable()
export class LoggingService {
  constructor(@Inject(ELASTIC_CLIENT) private readonly elastic: Client) {}

  async log(data: LogData) {
    try {
      if (!data.exception) {
        await this.elastic.index({
          index: 'info',
          document: data,
        });
      } else if (data.exception && !data.exception.status) {
        await this.elastic.index({
          index: 'app_errors',
          document: { ...data, exception: JSON.stringify(data.exception) },
        });
      } else if (data.exception.status >= 400 && data.exception.status <= 499) {
        await this.elastic.index({
          index: 'http_errors',
          document: { ...data, exception: JSON.stringify(data.exception) },
        });
      } else if (data.exception.status == 502) {
        await this.elastic.index({
          index: 'bad_gateway',
          document: { ...data, exception: JSON.stringify(data.exception) },
        });
      }
    } catch (error) {
      console.log('index error', error);
    }
  }
}
