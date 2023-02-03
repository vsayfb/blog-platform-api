import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { AccountsModule } from '../accounts/accounts.module';
import { Message } from '../messages/entities/message.entity';
import { CacheManagerModule } from 'src/cache/cache-manager.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, Message]),
    AccountsModule,
    CacheManagerModule,
  ],
  controllers: [ChatsController],
  providers: [ChatsService, { provide: 'SERVICE', useClass: ChatsService }],
  exports: [ChatsService],
})
export class ChatsModule {}
