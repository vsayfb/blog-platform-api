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
import { AccountProfileDto } from '../dto/account-profile.dto';
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
    created_at: true,
  };

  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    private readonly uploadsService: UploadsService,
    private readonly passwordManagerService: PasswordManagerService,
  ) {}

  async update(
    subject: Account,
    updateDto: UpdateAccountDto,
  ): Promise<SelectedAccountFields> {
    const sameUsername = subject.username === updateDto.username;
    const sameDisplayname = subject.display_name === updateDto.display_name;

    // TODO -> CHANGE THIS UGLY METHOD AS SOON AS POSSIBLE

    if (sameUsername && sameDisplayname) {
      throw new ForbiddenException('Credentials must be unique.');
    } else if (sameUsername) {
      subject.display_name = updateDto.display_name;
    } else if (sameDisplayname) {
      await this.throwIfUsernameExists(updateDto.username);

      subject.username = updateDto.username;
    } else {
      await this.throwIfUsernameExists(updateDto.username);

      subject.username = updateDto.username;
      subject.display_name = updateDto.display_name;
    }

    await this.accountsRepository.save(subject);

    return this.getOneByID(subject.id);
  }

  async getOneByID(id: string): Promise<SelectedAccountFields> {
    return this.accountsRepository.findOne({ where: { id } });
  }

  async getAccount(userNameOrEmail: string): Promise<AccountWithCredentials> {
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

  async getWithCredentials(accountID: string): Promise<AccountWithCredentials> {
    return await this.accountsRepository.findOne({
      where: { id: accountID },
      select: this.credentials,
    });
  }

  async getProfile(username: string): Promise<AccountProfileDto> {
    const profile = await this.accountsRepository
      .createQueryBuilder('account')
      .where('account.username=:username', { username })
      .loadRelationCountAndMap('account.followers_count', 'account.followers')
      .loadRelationCountAndMap('account.following_count', 'account.followed')
      .getOne();

    if (!profile) throw new NotFoundException(AccountMessages.NOT_FOUND);

    return profile as any;
  }

  async create(data: CreateAccountDto): Promise<SelectedAccountFields> {
    const usernameTaken = await this.getOneByUsername(data.username);

    if (usernameTaken)
      throw new ForbiddenException(AccountMessages.USERNAME_TAKEN);

    const emailTaken = await this.getOneByEmail(data.email);

    if (emailTaken) throw new ForbiddenException(AccountMessages.EMAIL_TAKEN);

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

  async changeProfileImage(
    req_account: JwtPayload,
    file: Express.Multer.File,
  ): Promise<string> {
    const account = await this.getAccount(req_account.username);

    const newImageUrl = await this.uploadsService.uploadProfileImage(file);

    account.image = newImageUrl;

    await this.accountsRepository.save(account);

    return newImageUrl;
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

  private async throwIfUsernameExists(username: string) {
    const account = await this.getOneByUsername(username);

    if (account) throw new ForbiddenException(AccountMessages.USERNAME_TAKEN);
  }
}
