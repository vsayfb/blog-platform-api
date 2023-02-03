import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity';
import { AccountsModule } from 'src/resources/accounts/accounts.module';
import { AccountsNotificationsModule } from 'src/resources/account_notifications/account-notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Follow]),
    AccountsModule,
    AccountsNotificationsModule,
  ],
  controllers: [FollowController],
  providers: [FollowService],
  exports: [FollowService],
})
export class FollowModule {}
