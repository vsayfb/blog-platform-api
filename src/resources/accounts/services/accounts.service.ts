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
import { AccountMessages } from '../enums/account-messages';

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

  async update(account: Account): Promise<SelectedAccountFields> {
    await this.accountsRepository.save(account);

    if (account.password) delete account.password;

    await this.cacheJsonService.update({
      key: CACHED_ROUTES.CLIENT_ACCOUNT + account.id,
      data: account,
    });

    return this.getOneByID(account.id);
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

  async getCredentialsByID(id: string): Promise<AccountWithCredentials> {
    return await this.accountsRepository.findOne({
      where: { id },
      select: CREDENTIALS,
      relations: { two_factor_auth: true },
    });
  }

  async getOneByEmail(email: string): Promise<SelectedAccountFields> {
    return this.accountsRepository.findOneBy({ email });
  }

  async getOneByMobilePhone(phone: string): Promise<SelectedAccountFields> {
    return this.accountsRepository.findOneBy({ mobile_phone: phone });
  }

  async getOneByUsername(username: string): Promise<SelectedAccountFields> {
    return this.accountsRepository.findOneBy({ username });
  }

  async searchByUsername(username: string): Promise<SelectedAccountFields[]> {
    return this.accountsRepository.find({
      where: { username: Like(`%${username}%`) },
      take: 10,
    });
  }

  async getAll(): Promise<SelectedAccountFields[]> {
    return await this.accountsRepository.find();
  }

  async setPassword(account: Account, password: string): Promise<void> {
    account.password = await this.passwordManagerService.hashPassword(password);
  }

  setMobilePhone(account: Account, mobile_phone: string | null): void {
    if (account.email === null)
      throw new ForbiddenException(AccountMessages.MUST_HAS_PHONE_OR_EMAIL);

    account.mobile_phone = mobile_phone;
  }

  setEmail(account: Account, email: string | null): void {
    if (account.mobile_phone === null)
      throw new ForbiddenException(AccountMessages.MUST_HAS_PHONE_OR_EMAIL);

    account.email = email;
  }

  setDisplayName(account: Account, display_name: string): void {
    account.display_name = display_name;
  }

  setUsername(account: Account, username: string): void {
    account.username = username;
  }
}
