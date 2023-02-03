import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from 'src/resources/follow/entities/follow.entity';
import { FollowModule } from 'src/resources/follow/follow.module';

@Module({
  imports: [FollowModule, TypeOrmModule.forFeature([Follow])],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
