import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/accounts/entities/account.entity';
import { AccountsService } from 'src/accounts/services/accounts.service';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { IDeleteService } from 'src/lib/interfaces/delete-service.interface';
import { IFindService } from 'src/lib/interfaces/find-service.interface';
import { IUpdateService } from 'src/lib/interfaces/update-service.interface';
import { Repository } from 'typeorm';
import { TwoFactorAuth, TFAVia } from '../entities/two-factor-auth.entity';

@Injectable()
export class TwoFactorAuthService
  implements ICreateService, IUpdateService, IFindService, IDeleteService
{
  constructor(
    @InjectRepository(TwoFactorAuth)
    private readonly twoFactorAuthRepository: Repository<TwoFactorAuth>,
    private readonly accountsService: AccountsService,
  ) {}

  async getOneByID(accountID: string): Promise<TwoFactorAuth> {
    return this.twoFactorAuthRepository.findOne({
      where: { account: { id: accountID } },
      relations: { account: true },
    });
  }

  async create({ accountID }: { accountID: string }): Promise<TwoFactorAuth> {
    const created = await this.twoFactorAuthRepository.save({
      account: { id: accountID },
      via: TFAVia.EMAIL,
    });

    delete created.account;

    return created;
  }

  async createWithPhone({
    accountID,
    phone,
  }: {
    accountID: string;
    phone: string;
  }): Promise<TwoFactorAuth> {
    const account = await this.accountsService.getOneByID(accountID);

    const created = await this.twoFactorAuthRepository.save({
      account,
      via: TFAVia.SMS,
    });

    await this.accountsService.update(account as Account, { phone });

    delete created.account;

    return created;
  }

  async update(subject: TwoFactorAuth, via: TFAVia): Promise<TwoFactorAuth> {
    subject.via = via;

    const updated = await this.twoFactorAuthRepository.save(subject);

    delete updated.account;

    return updated;
  }

  async delete(subject: TwoFactorAuth): Promise<string> {
    const ID = subject.id;

    await this.twoFactorAuthRepository.recover(subject);

    return ID;
  }

  getAll(): Promise<TwoFactorAuth[]> {
    return this.twoFactorAuthRepository.find({});
  }
}
