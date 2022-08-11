import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { ArrayContains, Repository } from 'typeorm';
import { AccountsService } from '../accounts/accounts.service';
import { AccountMessages } from '../accounts/enums/account-messages';
import { Message } from '../messages/entities/message.entity';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat) private readonly chatsRepository: Repository<Chat>,
    private readonly accountsService: AccountsService,
  ) {}

  async create(dto: { initiatorID: string; toID: string }) {
    const initiatorAccount = await this.accountsService.getOne(dto.initiatorID);

    const to = await this.accountsService.getOne(dto.toID);

    if (!to) throw new NotFoundException(AccountMessages.NOT_FOUND);

    const { id } = await this.chatsRepository.save({
      members: [initiatorAccount, to],
    });

    return this.chatsRepository.findOne({
      where: { id },
    });
  }

  getAccountChats(memberID: string) {
    return this.chatsRepository.find({
      where: { members: ArrayContains([memberID]) },
    });
  }

  findOne(memberID: string, id: string) {
    return this.chatsRepository.findOne({
      where: { id, members: ArrayContains([memberID]) },
      relations: { members: true },
    });
  }

  async addMessageToChat(chat: Chat, message: Message): Promise<void> {
    chat.messages.push(message);

    await this.chatsRepository.save(chat);
  }

  getOneByID(id: string): Promise<Chat> {
    return this.chatsRepository.findOne({
      where: { id },
      relations: { members: true },
    });
  }
}
