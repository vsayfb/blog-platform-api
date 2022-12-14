import { Module } from '@nestjs/common';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Social } from './entity/social.entity';
import { MANAGE_DATA_SERVICE } from 'src/lib/constants';

@Module({
  imports: [TypeOrmModule.forFeature([Social])],
  controllers: [SocialController],
  providers: [
    SocialService,
    { provide: MANAGE_DATA_SERVICE, useClass: SocialService },
  ],
  exports: [SocialService],
})
export class SocialModule {}
