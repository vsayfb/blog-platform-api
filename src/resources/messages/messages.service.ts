import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { ChatsService } from '../chats/chats.service';
import { ChatMessages } from '../chats/enums/chat-messages';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { IFindService } from 'src/lib/interfaces/find-service.interface';
import { ChatMessage } from './types/new-message';
import { CacheJsonService } from 'src/cache/services/cache-json.service';
import { AccountChat } from 'src/resources/chats/types/account-chat';
import { CACHED_ROUTES } from 'src/cache/constants/cached-routes';

@Injectable()
export class MessagesService implements ICreateService, IFindService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    private readonly chatsService: ChatsService,
    private readonly cacheJsonService: CacheJsonService,
  ) {}

  async create({
    content,
    senderID,
    chatID,
  }: {
    content: string;
    senderID: string;
    chatID: string;
  }): Promise<ChatMessage> {
    const chat = await this.chatsService.getOneByID(chatID);

    if (!chat) throw new NotFoundException(ChatMessages.NOT_FOUND);

    const message = await this.messagesRepository.save({
      chat,
      sender: { id: senderID },
      content,
    });

    const newMessage = await this.messagesRepository.findOne({
      where: { id: message.id },
      relations: { sender: true },
    });

    // update last message of chat
    const cacheChat: AccountChat = {
      ...chat,
      last_message: {
        ...newMessage,
        chat_id: chat.id,
      },
    };

    chat.members.map((m) => {
      this.cacheJsonService.updateInArray(
        CACHED_ROUTES.CLIENT_CHATS + m.id,
        chat.id,
        cacheChat,
      );
    });

    return {
      ...newMessage,
      chat_id: chat.id,
    };
  }

  async getAccountMessages(senderID: string) {
    return await this.messagesRepository.find({
      where: { sender: { id: senderID } },
    });
  }

  async getOneByID(id: string): Promise<any> {
    return await this.messagesRepository.findOne({ where: { id } });
  }

  async getAll(): Promise<any[]> {
    return await this.messagesRepository.find({});
  }
}
