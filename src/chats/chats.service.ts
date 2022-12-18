import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { ArrayContains, Repository } from 'typeorm';
import { AccountsService } from '../accounts/services/accounts.service';
import { AccountMessages } from '../accounts/enums/account-messages';
import { Message } from '../messages/entities/message.entity';
import { ChatMessages } from './enums/chat-messages';
import { ChatViewDto } from './dto/chat-view.dto';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { IFindService } from 'src/lib/interfaces/find-service.interface';

@Injectable()
export class ChatsService implements ICreateService, IFindService {
  constructor(
    @InjectRepository(Chat) private chatsRepository: Repository<Chat>,
    @InjectRepository(Message) private messagesRepository: Repository<Message>,
  ) {}

  async create({
    initiatorID,
    toID,
    firstMessage,
  }: {
    initiatorID: string;
    toID: string;
    firstMessage: string;
  }): Promise<Chat> {
    if (toID === initiatorID) {
      throw new ForbiddenException(ChatMessages.CANT_CHAT);
    }

    await this.checkChatExists([initiatorID, toID]);

    const chat = await this.chatsRepository.save({
      members: [{ id: initiatorID }, { id: toID }],
    });

    await this.messagesRepository.save({
      chat,
      sender: { id: initiatorID },
      content: firstMessage,
    });

    return await this.chatsRepository.findOne({
      where: { id: chat.id },
      relations: { messages: true, members: true },
    });
  }

  private async checkChatExists(membersIds: string[]) {
    // in future user's may have a chat group
    // therefore do not allow the creation bi-directional chat only again
    if (membersIds.length !== 2) return false;

    const chats = await this.getAll();

    // convert that to sql query
    chats.map((c) => {
      if (c.members.length === 2) {
        const exists = membersIds.filter((id) =>
          c.members.some((m) => m.id == id),
        );

        if (exists.length == 2)
          throw new ForbiddenException(ChatMessages.ALREADY_CREATED);
      }
    });

    return false;
  }

  async getAccountChats(accountID: string): Promise<ChatViewDto[]> {
    const result = await this.chatsRepository
      .createQueryBuilder('chats')
      .leftJoin('chats.members', 'members')
      .andWhere('members.id=:memberID', { memberID: accountID })
      .leftJoinAndSelect('chats.messages', 'messages')
      .leftJoinAndSelect('messages.sender', 'messages.sender')
      .getMany();

    return result.map((c) => {
      //@ts-ignore
      c.last_message = c.messages[c.messages.length - 1];
      delete c.messages;
      return c;
    }) as unknown as ChatViewDto[];
  }

  async getAccountChatCount(accountID: string): Promise<number> {
    return await this.chatsRepository.count({
      where: { members: { id: accountID }, messages: { seen: false } },
    });
  }

  async getOne(memberID: string, id: string): Promise<Chat> {
    const chat = await this.chatsRepository.findOne({
      where: { id },
      relations: { members: true, messages: true },
    });

    return chat.members.some((m) => m.id === memberID) ? chat : null;
  }

  async getOneByID(id: string): Promise<Chat> {
    return await this.chatsRepository.findOne({
      where: { id },
      relations: { members: true },
    });
  }

  async getAll(): Promise<Chat[]> {
    return await this.chatsRepository.find({ relations: { members: true } });
  }
}
