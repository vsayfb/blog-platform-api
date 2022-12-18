import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { IFindService } from 'src/lib/interfaces/find-service.interface';
import { IUpdateService } from 'src/lib/interfaces/update-service.interface';
import { JwtPayload } from 'src/lib/jwt.payload';
import { UploadsService } from 'src/uploads/uploads.service';
import { Like, Repository } from 'typeorm';
import { CreateAccountDto } from '../dto/create-account.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';
import { Account } from '../entities/account.entity';
import { AccountMessages } from '../enums/account-messages';
import { PasswordManagerService } from '../services/password-manager.service';
import { AccountWithCredentials } from '../types/account-with-credentials';
import { SelectedAccountFields } from '../types/selected-account-fields';

@Injectable()
export class AccountsService
  implements IFindService, ICreateService, IUpdateService
{
  private readonly credentials = {
    id: true,
    username: true,
    display_name: true,
    image: true,
    role: true,
    email: true,
    password: true,
    phone: true,
    created_at: true,
  };

  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    private readonly passwordManagerService: PasswordManagerService,
  ) {}

  async create(data: CreateAccountDto): Promise<SelectedAccountFields> {
    delete data.verification_code;

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
    return this.accountsRepository.findOneBy({ id });
  }

  async update(
    subject: Account,
    updateDto: any,
  ): Promise<SelectedAccountFields> {
    console.log(updateDto);

    let anyChanges = false;

    for (const key in updateDto) {
      const element = updateDto[key];

      if (element) {
        subject[key] = element;
        anyChanges = true;
      }
    }

    if (anyChanges) await this.accountsRepository.save(subject);

    return this.getOneByID(subject.id);
  }

  async getCredentialsByUsernameOrEmail(
    userNameOrEmail: string,
  ): Promise<AccountWithCredentials> {
    return await this.accountsRepository.findOne({
      where: [
        {
          username: userNameOrEmail,
        },
        {
          email: userNameOrEmail,
        },
      ],
      select: this.credentials,
    });
  }

  async getCredentials(accountID: string): Promise<AccountWithCredentials> {
    return await this.accountsRepository.findOne({
      where: { id: accountID },
      select: this.credentials,
    });
  }

  async getOneByEmail(email: string): Promise<SelectedAccountFields> {
    return this.accountsRepository.findOne({ where: { email } });
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
