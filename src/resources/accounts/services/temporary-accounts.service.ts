import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLocalAccount } from 'src/auth/types/create-local-account';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { IDeleteService } from 'src/lib/interfaces/delete-service.interface';
import { IFindService } from 'src/lib/interfaces/find-service.interface';
import { Repository } from 'typeorm';
import { TemporaryAccount } from '../entities/temporary-account.entity';

@Injectable()
export class TemporaryAccountsService
  implements ICreateService, IDeleteService, IFindService
{
  constructor(
    @InjectRepository(TemporaryAccount)
    private readonly tempAccountsRepository: Repository<TemporaryAccount>,
  ) {}

  async getOneByID(id: string): Promise<TemporaryAccount> {
    return this.tempAccountsRepository.findOneBy({ id });
  }

  async getAll(): Promise<TemporaryAccount[]> {
    return this.tempAccountsRepository.find();
  }

  async create(
    data: CreateLocalAccount,
  ): Promise<CreateLocalAccount & TemporaryAccount> {
    return await this.tempAccountsRepository.save(data);
  }

  async getOneByEmailOrMobilePhone(value: string): Promise<TemporaryAccount> {
    return await this.tempAccountsRepository.findOneBy([
      { email: value },
      { mobile_phone: value },
    ]);
  }

  async getOneByEmail(email: string): Promise<TemporaryAccount> {
    return this.tempAccountsRepository.findOneBy({ email });
  }

  async getOneByUsername(username: string): Promise<TemporaryAccount> {
    return this.tempAccountsRepository.findOneBy({ username });
  }

  async getOneByMobilePhone(mobilePhone: string): Promise<TemporaryAccount> {
    return this.tempAccountsRepository.findOneBy({ mobile_phone: mobilePhone });
  }

  async deleteByUsernameIfExist(username: string): Promise<void> {
    const account = await this.getOneByUsername(username);

    if (account) await this.tempAccountsRepository.remove(account);
  }

  async delete(account: TemporaryAccount): Promise<string> {
    const ID = account.id;

    await this.tempAccountsRepository.remove(account);

    return ID;
  }
}
