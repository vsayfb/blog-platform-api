import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';
import { Message } from '../messages/entities/message.entity';
import { ChatMessages } from './enums/chat-messages';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { IFindService } from 'src/lib/interfaces/find-service.interface';
import { AccountChat } from './types/account-chat';
import { ChatWithMembers } from './types/chat-members';
import { CacheJsonService } from 'src/cache/services/cache-json.service';
import { CACHED_ROUTES } from 'src/cache/constants/cached-routes';

@Injectable()
export class ChatsService implements ICreateService, IFindService {
  constructor(
    @InjectRepository(Chat) private chatsRepository: Repository<Chat>,
    @InjectRepository(Message) private messagesRepository: Repository<Message>,
    private readonly cacheJsonService: CacheJsonService,
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

    const message = await this.messagesRepository.save({
      chat,
      sender: { id: initiatorID },
      content: firstMessage,
    });

    const newChat = await this.chatsRepository.findOne({
      where: { id: chat.id },
      relations: { messages: true, members: true },
    });

    const cacheChat: AccountChat = {
      id: chat.id,
      members: newChat.members,
      last_message: {
        id: message.id,
        chat_id: chat.id,
        content: message.content,
        sender: newChat.members.find((m) => m.id === initiatorID),
        seen: message.seen,
        created_at: message.created_at,
        updated_at: message.updated_at,
      },
      created_at: chat.created_at,
      updated_at: chat.updated_at,
    };

    this.cacheJsonService.insertToArray(
      CACHED_ROUTES.CLIENT_CHATS + initiatorID,
      cacheChat,
    );

    this.cacheJsonService.insertToArray(
      CACHED_ROUTES.CLIENT_CHATS + toID,
      cacheChat,
    );

    return newChat;
  }

  private async checkChatExists(membersIds: string[]) {
    // in future user's may have a chat group for now just allow two users
    if (membersIds.length !== 2) return false;

    const chats = await this.getAll();

    // convert that to sql query
    chats.map((c) => {
      if (c.members.length === 2) {
        const members = membersIds.filter((id) =>
          c.members.some((m) => m.id === id),
        );

        if (members.length == 2)
          throw new ForbiddenException(ChatMessages.ALREADY_CREATED);
      }
    });

    return false;
  }

  async getAccountChats(accountID: string): Promise<AccountChat[]> {
    const chats = await this.chatsRepository.find({
      relations: { members: true, messages: { sender: true } },
    });

    return chats.filter((c) => {
      //@ts-ignore
      c.last_message = c.messages[c.messages.length - 1];
      //@ts-ignore
      c.last_message.chat_id = c.id;
      delete c.messages;
      return c.members.some((c) => c.id === accountID);
    }) as unknown as AccountChat[];
  }

  async getAccountChatCount(accountID: string): Promise<number> {
    return await this.chatsRepository.count({
      where: { members: { id: accountID } },
    });
  }

  async getOne(memberID: string, id: string): Promise<Chat> {
    const chat = await this.chatsRepository.findOne({
      where: { id },
      relations: { members: true, messages: true },
    });

    return chat.members.some((m) => m.id === memberID) ? chat : null;
  }

  async getOneByID(id: string): Promise<ChatWithMembers> {
    return await this.chatsRepository.findOne({
      where: { id },
      relations: { members: true },
    });
  }

  async getAll(): Promise<ChatWithMembers[]> {
    return await this.chatsRepository.find({ relations: { members: true } });
  }
}
