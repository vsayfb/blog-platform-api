import { DynamicModule, Logger, Module } from '@nestjs/common';
import { RABBIT_CLIENT, RABBIT_CONNECTION_URI } from './constants';
import { RabbitService } from './rabbit.service';

const rabbitClient = {
  provide: RABBIT_CLIENT,
  useFactory: async (rabbitService: RabbitService, logger: Logger) => {
    try {
      return await rabbitService.getClient();
    } catch (err: any) {
      logger.error('[RABBIT MODULE] ' + err.message);
    }
  },
  inject: [RabbitService, Logger],
};

@Module({})
export class RabbitModule {
  static forRoot({ uri }: { uri: string }): DynamicModule {
    return {
      global: true,
      module: RabbitModule,
      providers: [
        RabbitService,
        Logger,
        {
          provide: RABBIT_CONNECTION_URI,
          useValue: uri,
        },
        rabbitClient,
      ],
      exports: [RABBIT_CLIENT],
    };
  }
}
