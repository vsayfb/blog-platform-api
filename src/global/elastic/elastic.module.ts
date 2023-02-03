import { ClientOptions } from '@elastic/elasticsearch';
import { DynamicModule, Logger, Module } from '@nestjs/common';
import { ELASTIC_CLIENT, ELASTIC_CLIENT_OPTS } from './constants';
import { ElasticService } from './elastic.service';

const elasticClient = {
  provide: ELASTIC_CLIENT,
  useFactory: async (elasticService: ElasticService, logger: Logger) => {
    try {
      return await elasticService.getClient();
    } catch (err: any) {
      logger.error('[ELASTIC MODULE] ' + err.message);
    }
  },
  inject: [ElasticService, Logger],
};

@Module({})
export class ElasticModule {
  static forRoot({ clientOpts }: { clientOpts: ClientOptions }): DynamicModule {
    return {
      global: true,
      module: ElasticModule,
      providers: [
        ElasticService,
        Logger,
        {
          provide: ELASTIC_CLIENT_OPTS,
          useValue: clientOpts,
        },
        elasticClient,
      ],
      exports: [ELASTIC_CLIENT],
    };
  }
}
