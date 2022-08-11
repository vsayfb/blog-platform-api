import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { ChatsService } from '../chats/chats.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    private readonly chatsService: ChatsService,
  ) {}

  async create(
    createMessageDto: CreateMessageDto,
    initiatorID: string,
    toID: string,
    chatID?: string,
  ) {
    let chat = await this.chatsService.getOneByID(chatID);

    if (!chat) {
      chat = await this.chatsService.create({
        initiatorID,
        toID,
      });
    }

    const message = await this.messagesRepository.save({
      chat,
      sender: { id: initiatorID },
      content: createMessageDto.content,
    });

    await this.chatsService.addMessageToChat(chat, message);

    const result = await this.messagesRepository.findOne({
      where: { id: message.id },
      relations: { sender: true },
    });

    return { chatID: chat.id, content: message.content, sender: result.sender };
  }

  getAccountMessages(senderID: string) {
    return this.messagesRepository.find({
      where: { sender: { id: senderID } },
    });
  }
}
