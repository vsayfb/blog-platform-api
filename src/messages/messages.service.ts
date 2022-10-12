import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { ChatsService } from '../chats/chats.service';
import { ChatMessages } from '../chats/enums/chat-messages';
import { MessageViewDto } from './dto/message-view.dto';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { IFindService } from 'src/lib/interfaces/find-service.interface';

@Injectable()
export class MessagesService implements ICreateService, IFindService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    private readonly chatsService: ChatsService,
  ) {}

  async create(dto: {
    content: string;
    initiatorID: string;
    chatID: string;
  }): Promise<MessageViewDto> {
    const chat = await this.chatsService.getOneByID(dto.chatID);

    if (!chat) throw new NotFoundException(ChatMessages.NOT_FOUND);

    const message = await this.messagesRepository.save({
      chat,
      sender: { id: dto.initiatorID },
      content: dto.content,
    });

    const result = await this.messagesRepository.findOne({
      where: { id: message.id },
      relations: { sender: true },
    });

    return {
      chatID: chat.id,
      content: message.content,
      sender: result.sender,
      created_at: message.created_at,
      updated_at: message.updated_at,
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
