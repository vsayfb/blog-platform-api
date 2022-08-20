import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { ArrayContains, Repository } from 'typeorm';
import { AccountsService } from '../accounts/accounts.service';
import { AccountMessages } from '../accounts/enums/account-messages';
import { ChatViewDto } from './dto/chat-view.dto';
import { Message } from '../messages/entities/message.entity';
import { ChatMessages } from './enums/chat-messages';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat) private readonly chatsRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    private readonly accountsService: AccountsService,
  ) {}

  async create(dto: {
    initiatorID: string;
    toID: string;
    firstMessage: string;
  }): Promise<Chat> {
    const initiatorAccount = await this.accountsService.getOne(dto.initiatorID);

    const to = await this.accountsService.getOne(dto.toID);

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
    const chat = await this.chatsRepository.findOne({
      where: { members: [{ id: membersIds[0] }, { id: membersIds[1] }] },
      relations: { members: true },
    });

    // if a chat is found with memberIds, they already have a chat, so there is no need for a new chat
    if (chat?.members?.length <= 2)
      throw new ForbiddenException(ChatMessages.ALREADY_CREATED);

    return false;
  }

  async getAccountChats(memberID: string): Promise<ChatViewDto[]> {
    return (await this.chatsRepository.find({
      where: { members: ArrayContains([memberID]) },
      relations: { members: true },
    })) as unknown as ChatViewDto[];
  }

  async findOne(memberID: string, id: string): Promise<Chat> {
    return await this.chatsRepository.findOne({
      where: { id, members: ArrayContains([memberID]) },
      relations: { members: true, messages: true },
    });
  }

  getOneByID(id: string): Promise<Chat> {
    return this.chatsRepository.findOne({
      where: { id },
      relations: { members: true },
    });
  }
}
