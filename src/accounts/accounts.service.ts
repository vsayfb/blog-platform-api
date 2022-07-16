import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { JwtPayload } from 'src/lib/jwt.payload';
import { MailsService } from 'src/mails/mails.service';
import { Post } from 'src/posts/entities/post.entity';
import { UploadsService } from 'src/uploads/uploads.service';
import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account, RegisterType, Role } from './entities/account.entity';
import { AccountMessages } from './enums/account-messages';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    private readonly mailService: MailsService,
    private readonly uploadsService: UploadsService,
  ) {}

  async getOne(id: string): Promise<Account> {
    return this.accountsRepository.findOne({ where: { id } });
  }

  async getAccount(userNameOrEmail: string): Promise<{
    id: string;
    username: string;
    password: string;
    display_name: string;
    email: string;
    image: string | null;
    role: Role;
  }> {
    return this.accountsRepository.findOne({
      where: [
        {
          username: userNameOrEmail,
        },
        {
          email: userNameOrEmail,
        },
      ],
      select: [
        'id',
        'username',
        'password',
        'email',
        'display_name',
        'image',
        'role',
      ],
    });
  }

  async getProfile(username: string): Promise<{
    id: string;
    username: string;
    display_name: string;
    image: string | null;
    via: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    posts: Post[];
    comments: Comment[];
    followers: number;
    followed: number;
  }> {
    const profile: any = await this.accountsRepository
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

    return profile;
  }

  async createLocalAccount(data: CreateAccountDto): Promise<Account> {
    const { email, username } = data;

    const usernameTaken = await this.getOneByUsername(username);

    if (usernameTaken)
      throw new ForbiddenException(AccountMessages.USERNAME_TAKEN);

    const emailTaken = await this.getOneByEmail(email);

    if (emailTaken) throw new ForbiddenException(AccountMessages.EMAIL_TAKEN);

    delete data.verification_code;

    return await this.accountsRepository.save(data);
  }

  async createAccountViaGoogle(data: {
    email: string;
    username: string;
    password: string;
    display_name: string;
  }): Promise<Account> {
    return await this.accountsRepository.save({
      ...data,
      via: RegisterType.GOOGLE,
    });
  }

  async changeProfileImage(
    req_account: JwtPayload,
    file: Express.Multer.File,
  ): Promise<{ newImage: string }> {
    const account = await this.getAccount(req_account.username);

    const newFileName = await this.uploadsService.uploadProfileImage(file);

    account.image = newFileName;

    await this.accountsRepository.save(account);

    return { newImage: newFileName };
  }

  async beginRegisterVerification(
    username: string,
    email: string,
  ): Promise<{ message: string } | ForbiddenException> {
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

  async getOneByEmail(email: string): Promise<Account> {
    return this.accountsRepository.findOne({ where: { email } });
  }

  async getOneByUsername(username: string): Promise<Account> {
    return this.accountsRepository.findOne({ where: { username } });
  }
}
