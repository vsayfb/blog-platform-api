import { InjectRepository } from '@nestjs/typeorm';
import { CreateLocalAccount } from 'src/auth/types/create-local-account';
import { Brackets, Repository } from 'typeorm';
import { Account, RegisterType } from '../entities/account.entity';
import { AccountWithCredentials } from '../types/account-with-credentials';
import { SelectedAccountFields } from '../types/selected-account-fields';
import { CREDENTIALS } from './accounts.service';
import { PasswordManagerService } from './password-manager.service';

export class LocalAccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    private readonly passwordManagerService: PasswordManagerService,
  ) {}

  async create(data: CreateLocalAccount): Promise<SelectedAccountFields> {
    const hashedPassword = await this.passwordManagerService.hashPassword(
      data.password,
    );

    const created = await this.accountsRepository.save({
      ...data,
      image: `https://robohash.org/${data.username}.png`,
      password: hashedPassword,
    });

    return await this.accountsRepository.findOneBy({ id: created.id });
  }

  async getOneByID(id: string): Promise<SelectedAccountFields> {
    return this.accountsRepository.findOne({
      where: { id, via: RegisterType.LOCAL },
    });
  }

  async getCredentialsByUsernameOrEmailOrPhone(
    value: string,
  ): Promise<AccountWithCredentials> {
    return await this.accountsRepository
      .createQueryBuilder('account')
      .where('account.via = :via', { via: RegisterType.LOCAL })
      .andWhere(
        new Brackets((qb) => {
          qb.where('account.username = :username', {
            username: value,
          })
            .orWhere('account.email = :email', { email: value })
            .orWhere('account.mobile_phone = :mobile_phone', {
              mobile_phone: value,
            });
        }),
      )
      .select(Object.keys(CREDENTIALS).map((c) => 'account.' + c))
      .leftJoinAndSelect('account.two_factor_auth', 'two_factor_auth')
      .getOne();
  }
}
