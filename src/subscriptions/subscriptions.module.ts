import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from 'src/follow/entities/follow.entity';
import { FollowModule } from 'src/follow/follow.module';

@Module({
  imports: [FollowModule, TypeOrmModule.forFeature([Follow])],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
