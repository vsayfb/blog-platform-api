import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobsService } from 'src/jobs/jobs.service';
import { MailsService } from 'src/mails/mails.service';
import { UploadsService } from 'src/uploads/uploads.service';
import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account, RegisterType } from './entities/account.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    private readonly mailService: MailsService,
    private readonly uploadsService: UploadsService,
  ) {}

  async getAccount(userNameOrEmail: string) {
    return this.accountsRepository.findOne({
      where: [
        {
          username: userNameOrEmail,
        },
        {
          email: userNameOrEmail,
        },
      ],
    });
  }

  async createLocalAccount(data: CreateAccountDto) {
    const { email, username } = data;

    const usernameTaken = await this.getOneByUsername(username);

    if (usernameTaken) throw new ForbiddenException('Username taken.');

    const emailTaken = await this.getOneByEmail(email);

    if (emailTaken) throw new ForbiddenException('Email taken.');

    return await this.accountsRepository.save(data);
  }

  async createAccountViaGoogle(data: {
    email: string;
    username: string;
    password: string;
  }) {
    return await this.accountsRepository.save({
      ...data,
      via: RegisterType.GOOGLE,
    });
  }

  async changeProfileImage(req_account: Account, file: Express.Multer.File) {
    console.log(req_account);

    const account = await this.getAccount(req_account.username);

    const newFileName = await this.uploadsService.upload(file);

    account.image = newFileName;

    await this.accountsRepository.save(account);

    return { message: 'Image updated!' };
  }

  async beginRegisterVerification(
    email: string,
  ): Promise<{ message: string } | ForbiddenException> {
    const account = await this.accountsRepository.findOne({ where: { email } });

    if (account) throw new ForbiddenException('This email already registered.');

    await this.mailService.sendVerificationCode(email);

    return { message: 'The code sent.' };
  }

  async getOneByEmail(email: string) {
    return this.accountsRepository.findOne({ where: { email } });
  }

  async getOneByUsername(username: string) {
    return this.accountsRepository.findOne({ where: { username } });
  }
}
