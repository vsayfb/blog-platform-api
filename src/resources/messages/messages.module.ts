import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatsModule } from '../chats/chats.module';
import { CacheManagerModule } from 'src/cache/cache-manager.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage]),
    ChatsModule,
    CacheManagerModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
