import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AccountsService } from 'src/accounts/services/accounts.service';
import { CreateAccountDto } from 'src/accounts/dto/create-account.dto';
import { CodesService } from 'src/codes/codes.service';
import { CodeMessages } from 'src/codes/enums/code-messages';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { IAuthService } from '../interfaces/auth-service.interface';
import { BaseAuthService } from './base-auth.service';
import { RegisterViewDto } from '../dto/register-view.dto';
import { CodeVerificationProcess } from 'src/codes/entities/code.entity';
import { VerificationBy } from 'src/verifications/types/verification-by';
import { MobilePhoneVerificationService } from 'src/verifications/services/mobile-phone-verification.service';
import { EmailVerificationService } from 'src/verifications/services/email-verification.service';

@Injectable()
export class LocalAuthService extends BaseAuthService implements IAuthService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly codesService: CodesService,
    private readonly mobilePhoneVerificationService: MobilePhoneVerificationService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {
    super();
  }

  async register(data: {
    by: VerificationBy;
    dto: CreateAccountDto & { email?: string; phone?: string };
  }): Promise<RegisterViewDto> {
    const { dto, by } = data;

    const process =
      by === 'mail'
        ? CodeVerificationProcess.REGISTER_EMAIL
        : CodeVerificationProcess.REGISTER_MOBIL_PHONE;

    const receiver = by === 'mail' ? dto.email : dto.phone;

    const code = await this.codesService.getCodeByCredentials(
      dto.verification_code,
      receiver,
      process,
    );

    if (!code) throw new ForbiddenException(CodeMessages.INVALID_CODE);

    const account = await this.accountsService.create(dto);

    this.codesService.delete(code);

    return this.login(account);
  }

  async validateAccount(
    username: string,
    pass: string,
  ): Promise<SelectedAccountFields> | null {
    const account =
      await this.accountsService.getCredentialsByUsernameOrEmailOrPhone(
        username,
      );

    const passwordsMatch = account
      ? await this.passwordManagerService.comparePassword(
          pass,
          account.password,
        )
      : false;

    if (passwordsMatch) {
      delete account.password;
      delete account.email;

      return account;
    }

    return null;
  }

  async beginRegister({
    by,
    username,
    emailOrMobilePhoneNumber,
  }: {
    by: VerificationBy;
    username: string;
    emailOrMobilePhoneNumber: string;
  }) {
    const process =
      by === 'mail'
        ? CodeVerificationProcess.REGISTER_EMAIL
        : CodeVerificationProcess.REGISTER_MOBIL_PHONE;

    const alreadySent = await this.codesService.getOneByReceiverAndType(
      emailOrMobilePhoneNumber,
      process,
    );

    if (alreadySent) throw new BadRequestException(CodeMessages.ALREADY_SENT);

    switch (by) {
      case 'mail':
        await this.emailVerificationService.registerVerification({
          username,
          email: emailOrMobilePhoneNumber,
        });
        break;
      case 'sms':
        await this.mobilePhoneVerificationService.registerVerification({
          username,
          phone_number: emailOrMobilePhoneNumber,
        });
        break;

      default:
        break;
    }
  }
}
