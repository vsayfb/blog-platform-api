import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { ArrayContains, In, Repository } from 'typeorm';
import { AccountsService } from '../accounts/accounts.service';
import { AccountMessages } from '../accounts/enums/account-messages';
import { ICrudService } from '../lib/interfaces/ICrudService';
import { Message } from '../messages/entities/message.entity';

@Injectable()
export class ChatsService implements ICrudService<Chat> {
  constructor(
    @InjectRepository(Chat) private readonly chatsRepository: Repository<Chat>,
    private readonly accountsService: AccountsService,
  ) {}

  async create(dto: { initiatorID: string; withAccountID: string }) {
    const initiatorAccount = await this.accountsService.getOne(dto.initiatorID);

    const withAccount = await this.accountsService.getOne(dto.withAccountID);

    if (!withAccount) throw new NotFoundException(AccountMessages.NOT_FOUND);

    const { id } = await this.chatsRepository.save({
      members: [initiatorAccount, withAccount],
    });

    return this.chatsRepository.findOne({
      where: { id },
    });
  }

  findAll(memberID: string) {
    return this.chatsRepository.findOne({
      where: { members: ArrayContains([memberID]) },
    });
  }

  findOne(memberID: string, id: string) {
    return this.chatsRepository.findOne({
      where: { id, members: ArrayContains([memberID]) },
      relations: { members: true },
    });
  }

  async delete(subject: Chat): Promise<string> {
    const chatID = subject.id;

    await this.chatsRepository.remove(subject);

    return chatID;
  }

  async deleteChatMember(chat: Chat, memberID: string): Promise<string> {
    chat.members = chat.members.filter((m) => m.id !== memberID);

    await this.chatsRepository.save(chat);

    return chat.id;
  }

  addMessageToChat(chat: Chat, message: Message) {
    chat.messages.push(message);

    return this.chatsRepository.save(chat);
  }

  getAll(): Promise<Chat[]> {
    return this.chatsRepository.find();
  }

  getOne(where: string): Promise<any> {
    return Promise.resolve(undefined);
  }

  getOneByID(id: string): Promise<Chat> {
    return this.chatsRepository.findOne({
      where: { id },
      relations: { members: true },
    });
  }

  update(subject: Chat, updateDto?: any): Promise<any> {
    return Promise.resolve(undefined);
  }
}
