import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayload } from 'src/lib/jwt.payload';
import { MailsService } from 'src/mails/mails.service';
import { UploadsService } from 'src/uploads/uploads.service';
import { Like, Repository } from 'typeorm';
import { AccountProfileDto } from './dto/account-profile.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account, RegisterType } from './entities/account.entity';
import { AccountMessages } from './enums/account-messages';
import { SelectedAccountFields } from './types/selected-account-fields';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    private readonly mailService: MailsService,
    private readonly uploadsService: UploadsService,
  ) {}

  async getOne(id: string): Promise<SelectedAccountFields> {
    return this.accountsRepository.findOne({ where: { id } });
  }

  async getAccount(
    userNameOrEmail: string,
  ): Promise<SelectedAccountFields & { email: string; password: string }> {
    return await this.accountsRepository.findOne({
      where: [
        {
          username: userNameOrEmail,
        },
        {
          email: userNameOrEmail,
        },
      ],
      select: {
        id: true,
        username: true,
        display_name: true,
        image: true,
        role: true,
        email: true,
        password: true,
      },
    });
  }

  async getProfile(username: string): Promise<AccountProfileDto> {
    const profile = await this.accountsRepository
      .createQueryBuilder('account')
      .where('account.username=:username', { username })
      .leftJoinAndSelect('account.posts', 'posts')
      .leftJoinAndSelect('account.comments', 'comments')
      .leftJoin('account.followers', 'followers')
      .loadRelationCountAndMap('account.followers', 'account.followers')
      .leftJoin('account.followed', 'followed')
      .loadRelationCountAndMap('account.followed', 'account.followed')
      .getOne();

    if (!profile) throw new NotFoundException(AccountMessages.NOT_FOUND);

    return profile as any;
  }

  async createLocalAccount(
    data: CreateAccountDto,
  ): Promise<SelectedAccountFields> {
    const usernameTaken = await this.getOneByUsername(data.username);

    if (usernameTaken)
      throw new ForbiddenException(AccountMessages.USERNAME_TAKEN);

    const emailTaken = await this.getOneByEmail(data.email);

    if (emailTaken) throw new ForbiddenException(AccountMessages.EMAIL_TAKEN);

    delete data.verification_code;

    return await this.saveAccount(data);
  }

  async createAccountViaGoogle(data: {
    email: string;
    username: string;
    password: string;
    display_name: string;
  }): Promise<SelectedAccountFields> {
    return await this.saveAccount(data, RegisterType.GOOGLE);
  }

  private async saveAccount(data: CreateAccountDto, via?: RegisterType) {
    const { display_name, username, id, image, role, created_at } =
      await this.accountsRepository.save({ ...data, via });

    return {
      display_name,
      username,
      id,
      image,
      role,
      created_at,
    };
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

  async beginRegisterVerification(
    username: string,
    email: string,
  ): Promise<{ message: string }> {
    const emailRegistered = await this.accountsRepository.findOne({
      where: { email },
    });

    if (emailRegistered)
      throw new ForbiddenException(AccountMessages.EMAIL_TAKEN);

    const usernameRegistered = await this.accountsRepository.findOne({
      where: { username },
    });

    if (usernameRegistered)
      throw new ForbiddenException(AccountMessages.USERNAME_TAKEN);

    return await this.mailService.sendVerificationCode({ username, email });
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
}
