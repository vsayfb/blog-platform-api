import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity';
import { AccountsModule } from 'src/accounts/accounts.module';

@Module({
  imports: [TypeOrmModule.forFeature([Follow]), AccountsModule],
  controllers: [FollowController],
  providers: [FollowService],
})
export class FollowModule {}
