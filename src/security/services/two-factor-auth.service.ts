import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountsService } from 'src/accounts/services/accounts.service';
import { CodesService } from 'src/codes/codes.service';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { IDeleteService } from 'src/lib/interfaces/delete-service.interface';
import { IFindService } from 'src/lib/interfaces/find-service.interface';
import { IUpdateService } from 'src/lib/interfaces/update-service.interface';
import { NotificationFactory } from 'src/notifications/services/verification-factory.service';
import { NotificationBy } from 'src/notifications/types/notification-by';
import { Repository } from 'typeorm';
import { TwoFactorAuth, TFAVia } from '../entities/two-factor-auth.entity';
import { SelectedTFAFields } from '../types/selected-tfa';
import { TFAProcess } from '../types/tfa-process';

@Injectable()
export class TwoFactorAuthService
  implements ICreateService, IUpdateService, IFindService, IDeleteService
{
  constructor(
    @InjectRepository(TwoFactorAuth)
    private readonly twoFactorAuthRepository: Repository<TwoFactorAuth>,
    private readonly notificationFactory: NotificationFactory,
    private readonly accountsService: AccountsService,
  ) {}

  async getOneByID(id: string): Promise<TwoFactorAuth> {
    return this.twoFactorAuthRepository.findOne({
      where: { id },
      relations: { account: true },
    });
  }

  async getOneByAccountID(accountID: string): Promise<SelectedTFAFields> {
    return this.twoFactorAuthRepository.findOne({
      where: { account: { id: accountID } },
    });
  }

  async create({
    via,
    accountID,
  }: {
    via: TFAVia;
    accountID: string;
  }): Promise<TwoFactorAuth> {
    const created = await this.twoFactorAuthRepository.save({
      account: { id: accountID },
      via,
    });

    delete created.account;

    return created;
  }

  async update(subject: TwoFactorAuth, via: TFAVia): Promise<TwoFactorAuth> {
    subject.via = via;

    const updated = await this.twoFactorAuthRepository.save(subject);

    delete updated.account;

    return updated;
  }

  async delete(data: { subject: TwoFactorAuth }): Promise<string> {
    const ID = data.subject.id;

    await this.twoFactorAuthRepository.remove(data.subject);

    return ID;
  }

  

  getAll(): Promise<TwoFactorAuth[]> {
    return this.twoFactorAuthRepository.find({ relations: { account: true } });
  }
}
