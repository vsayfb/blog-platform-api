import { ForbiddenException, Injectable } from '@nestjs/common';
import { AccountsRepository } from './accounts.repository';
import { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountsService {
  constructor(private accountsRepository: AccountsRepository) {}

  async getAccount(userNameOrEmail: string) {
    return this.accountsRepository.findByUsernameOrEmail(userNameOrEmail);
  }

  async createAccount(data: CreateAccountDto) {
    const { email, username } = data;

    const usernameTaken = await this.accountsRepository.existsByUsername(
      username,
    );

    if (usernameTaken) throw new ForbiddenException('Username taken.');

    const emailTaken = await this.accountsRepository.existsByEmail(email);

    if (emailTaken) throw new ForbiddenException('Email taken.');

    return await this.accountsRepository.createEntity(data);
  }
}
