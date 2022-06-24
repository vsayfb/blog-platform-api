import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DEV_DATABASE, NODE_ENV, PROD_DATABASE } from 'src/lib/env';
import { DatabaseService } from './database.service';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url:
          configService.get(NODE_ENV) === 'production'
            ? configService.get(PROD_DATABASE)
            : configService.get(DEV_DATABASE),
        entities: [join(__dirname, '**', '*.entity.{ts,js}')],

        ssl: { rejectUnauthorized: false },
      }),

      inject: [ConfigService],
    }),
  ],
  providers: [DatabaseService],
})
export class DatabaseModule {}
