import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
    private readonly t2aRepository: Repository<TwoFactorAuth>,
  ) {}

  async getOneByID(accountID: string): Promise<TwoFactorAuth> {
    return this.t2aRepository.findOne({
      where: { account: { id: accountID } },
      relations: { account: true },
    });
  }

  async create({
    accountID,
    via,
  }: {
    accountID: string;
    via: TFAVia;
  }): Promise<TwoFactorAuth> {
    const created = await this.t2aRepository.save({
      account: { id: accountID },
      via,
    });

    delete created.account;

    return created;
  }

  async update(subject: TwoFactorAuth, via: TFAVia): Promise<TwoFactorAuth> {
    subject.via = via;

    const updated = await this.t2aRepository.save(subject);

    delete updated.account;

    return updated;
  }

  async delete(subject: TwoFactorAuth): Promise<string> {
    const ID = subject.id;

    await this.t2aRepository.recover(subject);

    return ID;
  }

  getAll(): Promise<TwoFactorAuth[]> {
    return this.t2aRepository.find({});
  }
}
