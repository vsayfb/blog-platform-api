import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { MANAGE_DATA_SERVICE } from 'src/lib/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/accounts/entities/account.entity';
import { UploadsModule } from 'src/uploads/uploads.module';

@Module({
  imports: [TypeOrmModule.forFeature([Account]), UploadsModule],
  controllers: [ProfilesController],
  providers: [
    ProfilesService,
    { provide: MANAGE_DATA_SERVICE, useClass: ProfilesService },
  ],
})
export class ProfilesModule {}
