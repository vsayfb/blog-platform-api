import { ForbiddenException, Injectable } from '@nestjs/common';
import { AccountsRepository } from './accounts.repository';
import { CreateAccountDto } from './dto/create-account.dto';
import { RegisterType } from './entities/account.entity';

@Injectable()
export class AccountsService {
  constructor(private accountsRepository: AccountsRepository) {}

  async getAccount(userNameOrEmail: string) {
    return this.accountsRepository.findByUsernameOrEmail(userNameOrEmail);
  }

  async createLocalAccount(data: CreateAccountDto) {
    const { email, username } = data;

    const usernameTaken = await this.accountsRepository.existsByUsername(
      username,
    );

    if (usernameTaken) throw new ForbiddenException('Username taken.');

    const emailTaken = await this.accountsRepository.existsByEmail(email);

    if (emailTaken) throw new ForbiddenException('Email taken.');

    return await this.accountsRepository.createEntity(data);
  }

  async createAccountViaGoogle(data: CreateAccountDto) {
    return await this.accountsRepository.createEntity({
      ...data,
      via: RegisterType.GOOGLE,
    });
  }
}
