import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { AccountsModule } from '../accounts/accounts.module';
import { ChatMessage } from '../messages/entities/chat-message.entity';
import { CacheManagerModule } from 'src/cache/cache-manager.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, ChatMessage]),
    AccountsModule,
    CacheManagerModule,
  ],
  controllers: [ChatsController],
  providers: [ChatsService, { provide: 'SERVICE', useClass: ChatsService }],
  exports: [ChatsService],
})
export class ChatsModule {}
