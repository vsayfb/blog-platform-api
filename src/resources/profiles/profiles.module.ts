import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { MANAGE_DATA_SERVICE } from 'src/lib/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/resources/accounts/entities/account.entity';
import { UploadsModule } from 'src/uploads/uploads.module';
import { CacheManagerModule } from 'src/cache/cache-manager.module';
import { FollowModule } from '../follow/follow.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    FollowModule,
    UploadsModule,
    CacheManagerModule,
  ],
  controllers: [ProfilesController],
  providers: [
    ProfilesService,
    { provide: MANAGE_DATA_SERVICE, useClass: ProfilesService },
  ],
})
export class ProfilesModule {}
