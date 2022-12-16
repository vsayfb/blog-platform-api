import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { Repository } from 'typeorm';
import { Account, RegisterType } from '../entities/account.entity';
import { AccountMessages } from '../enums/account-messages';
import { SelectedAccountFields } from '../types/selected-account-fields';
import { PasswordManagerService } from './password-manager.service';

@Injectable()
export class GoogleAccountsService implements ICreateService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly passwordManagerService: PasswordManagerService,
  ) {}

  async create(data: {
    email: string;
    given_name: string;
    family_name: string;
  }): Promise<SelectedAccountFields> {
    const { given_name, family_name, email } = data;

    const emailTaken = await this.accountRepository.findOneBy({ email });

    if (emailTaken) throw new ForbiddenException(AccountMessages.EMAIL_TAKEN);

    const hashedPassword = await this.passwordManagerService.hashPassword(
      Math.random().toString(36).substring(2, 8),
    );

    const username = (given_name + family_name).replace(/ /g, '').toLowerCase();

    const display_name = given_name + ' ' + family_name;

    const newGoogleAccount = await this.accountRepository.save({
      email,
      username,
      display_name,
      image: `https://robohash.org/${username}.png`,
      password: hashedPassword,
      via: RegisterType.GOOGLE,
    });

    return await this.accountRepository.findOneBy({ id: newGoogleAccount.id });
  }

  async getOneByEmail(
    email: string,
  ): Promise<SelectedAccountFields & { email: string; password: string }> {
    return await this.accountRepository.findOne({
      where: { email, via: RegisterType.GOOGLE },
      select: [
        'id',
        'username',
        'display_name',
        'image',
        'role',
        'email',
        'password',
      ],
    });
  }
}
