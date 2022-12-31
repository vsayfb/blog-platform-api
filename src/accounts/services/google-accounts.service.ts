import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { Repository } from 'typeorm';
import { Account, RegisterType } from '../entities/account.entity';
import { AccountMessages } from '../enums/account-messages';
import { AccountWithCredentials } from '../types/account-with-credentials';
import { SelectedAccountFields } from '../types/selected-account-fields';
import { CREDENTIALS } from './accounts.service';
import { PasswordManagerService } from './password-manager.service';

@Injectable()
export class GoogleAccountsService implements ICreateService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    private readonly passwordManagerService: PasswordManagerService,
  ) {}

  private async generateUniqueUsername(text: string) {
    let username = text;

    // TODO

    // length -> (2,16)
    // only allow underscore special char -> /[^A-Za-z0-9_]/g
    // min two letters -> /[A-Za-z]/gi
    // max two underscores -> /[_]/gi

    return username;
  }

  async create(data: {
    email: string;
    givenName: string;
    familyName: string;
  }): Promise<SelectedAccountFields> {
    const { givenName, familyName, email } = data;

    const emailTaken = await this.accountsRepository.findOneBy({ email });

    if (emailTaken) throw new ForbiddenException(AccountMessages.EMAIL_TAKEN);

    const hashedPassword = await this.passwordManagerService.hashPassword(
      Math.random().toString(36).substring(2, 8),
    );

    const displayName = givenName + ' ' + familyName;

    const username = await this.generateUniqueUsername(givenName + familyName);

    const newGoogleAccount = await this.accountsRepository.save({
      email,
      username,
      display_name: displayName,
      image: `https://robohash.org/${username}.png`,
      password: hashedPassword,
      via: RegisterType.GOOGLE,
    });

    return await this.accountsRepository.findOneBy({ id: newGoogleAccount.id });
  }

  async getOneByID(
    id: string,
  ): Promise<SelectedAccountFields & { email: string; password: string }> {
    return await this.accountsRepository.findOne({
      where: { id, via: RegisterType.GOOGLE },
    });
  }

  async getCredentialsByEmail(email: string): Promise<AccountWithCredentials> {
    const result = await this.accountsRepository.findOne({
      where: {
        via: RegisterType.GOOGLE,
        email,
      },
      select: CREDENTIALS,
      relations: { two_factor_auth: true },
    });

    return result;
  }
}
