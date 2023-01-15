import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHED_ROUTES } from 'src/cache/constants/cached-routes';
import { CacheJsonService } from 'src/cache/services/cache-json.service';
import { IFindService } from 'src/lib/interfaces/find-service.interface';
import { IUpdateService } from 'src/lib/interfaces/update-service.interface';
import { Like, Repository } from 'typeorm';
import { Account } from '../entities/account.entity';
import { PasswordManagerService } from '../services/password-manager.service';
import { AccountWithCredentials } from '../types/account-with-credentials';
import { SelectedAccountFields } from '../types/selected-account-fields';

export const CREDENTIALS = {
  id: true,
  username: true,
  display_name: true,
  image: true,
  via: true,
  role: true,
  email: true,
  password: true,
  mobile_phone: true,
  created_at: true,
};

@Injectable()
export class AccountsService implements IFindService, IUpdateService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    private readonly passwordManagerService: PasswordManagerService,
    private readonly cacheJsonService: CacheJsonService,
  ) {}

  async getOneByID(id: string): Promise<SelectedAccountFields> {
    return this.accountsRepository.findOneBy({ id });
  }

  async update(
    subject: Account,
    updateDto: Record<string, any>,
  ): Promise<SelectedAccountFields> {
    let updatedFields: Record<string, string> = {};

    for (const key in updateDto) {
      const element = updateDto[key];

      if ((element || element === null) && element !== subject[key]) {
        if (key === 'password') {
          subject[key] = await this.passwordManagerService.hashPassword(
            element,
          );
        } else {
          subject[key] = element;
        }

        updatedFields = { ...updatedFields, [key]: element };
      }
    }

    if (!Object.keys(updatedFields).length) throw new ForbiddenException();

    await this.accountsRepository.save(subject);

    this.cacheJsonService.updateFields(
      CACHED_ROUTES.CLIENT_ACCOUNT + subject.id,
      updatedFields,
    );

    return this.getOneByID(subject.id);
  }

  async getCredentialsByUsernameOrEmailOrPhone(
    value: string,
  ): Promise<AccountWithCredentials> {
    return await this.accountsRepository.findOne({
      where: [
        {
          username: value,
        },
        {
          email: value,
        },
        {
          mobile_phone: value,
        },
      ],
      relations: { two_factor_auth: true },
      select: CREDENTIALS,
    });
  }

  async getCredentials(accountID: string): Promise<AccountWithCredentials> {
    return await this.accountsRepository.findOne({
      where: { id: accountID },
      select: CREDENTIALS,
      relations: { two_factor_auth: true },
    });
  }

  async getOneByEmail(email: string): Promise<SelectedAccountFields> {
    return this.accountsRepository.findOne({ where: { email } });
  }

  async getOneByMobilePhone(phone: string): Promise<SelectedAccountFields> {
    return this.accountsRepository.findOne({ where: { mobile_phone: phone } });
  }

  async getOneByUsername(username: string): Promise<SelectedAccountFields> {
    return this.accountsRepository.findOne({ where: { username } });
  }

  async searchByUsername(username: string): Promise<SelectedAccountFields[]> {
    return this.accountsRepository.find({
      where: { username: Like(`%${username}%`) },
      take: 10,
    });
  }

  async getAll(): Promise<Account[]> {
    return await this.accountsRepository.find({});
  }
}
