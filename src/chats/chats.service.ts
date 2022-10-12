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
    private accountsService: AccountsService,
  ) {}

  async create(dto: {
    initiatorID: string;
    toID: string;
    firstMessage: string;
  }): Promise<Chat> {
    const initiatorAccount = await this.accountsService.getOneByID(
      dto.initiatorID,
    );

    const to = await this.accountsService.getOneByID(dto.toID);

    if (!to) throw new NotFoundException(AccountMessages.NOT_FOUND);

    await this.checkChatExists([dto.initiatorID, dto.toID]);

    const chat = await this.chatsRepository.save({
      members: [initiatorAccount, to],
    });

    await this.messagesRepository.save({
      chat,
      sender: initiatorAccount,
      content: dto.firstMessage,
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

  async getAccountChats(memberID: string): Promise<ChatViewDto[]> {
    const chats = await this.chatsRepository.find({
      relations: { members: true },
    });

    return chats.filter((c) =>
      c.members.some((c) => c.id === memberID),
    ) as unknown as ChatViewDto[];
  }

  async getOne(memberID: string, id: string): Promise<Chat> {
    return await this.chatsRepository.findOne({
      where: { id, members: ArrayContains([memberID]) },
      relations: { members: true, messages: true },
    });
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
