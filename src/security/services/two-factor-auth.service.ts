import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { IDeleteService } from 'src/lib/interfaces/delete-service.interface';
import { IFindService } from 'src/lib/interfaces/find-service.interface';
import { IUpdateService } from 'src/lib/interfaces/update-service.interface';
import { Repository } from 'typeorm';
import { TwoFactorAuth, TFAVia } from '../entities/two-factor-auth.entity';
import { SelectedTFAFields } from '../types/selected-tfa';

@Injectable()
export class TwoFactorAuthService
  implements ICreateService, IUpdateService, IFindService, IDeleteService
{
  constructor(
    @InjectRepository(TwoFactorAuth)
    private readonly twoFactorAuthRepository: Repository<TwoFactorAuth>,
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

  async delete(tfa: TwoFactorAuth): Promise<string> {
    const ID = tfa.id;

    await this.twoFactorAuthRepository.remove(tfa);

    return ID;
  }

  getAll(): Promise<TwoFactorAuth[]> {
    return this.twoFactorAuthRepository.find({ relations: { account: true } });
  }
}
