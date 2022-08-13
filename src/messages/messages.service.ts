import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { ChatsService } from '../chats/chats.service';
import { ChatMessages } from '../chats/enums/chat-messages';
import { MessageViewDto } from './dto/message-view.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    private readonly chatsService: ChatsService,
  ) {}

  async create(
    content: string,
    initiatorID: string,
    chatID: string,
  ): Promise<MessageViewDto> {
    const chat = await this.chatsService.getOneByID(chatID);

    if (!chat) throw new NotFoundException(ChatMessages.NOT_FOUND);

    const message = await this.messagesRepository.save({
      chat,
      sender: { id: initiatorID },
      content,
    });

    const result = await this.messagesRepository.findOne({
      where: { id: message.id },
      relations: { sender: true },
    });

    return {
      chatID: chat.id,
      content: message.content,
      sender: result.sender,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }

  getAccountMessages(senderID: string) {
    return this.messagesRepository.find({
      where: { sender: { id: senderID } },
    });
  }
}
