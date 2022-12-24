import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { VerificationCode } from 'src/global/verification_codes/entities/code.entity';
import { CodeMessages } from 'src/global/verification_codes/enums/code-messages';
import { VerificationCodesService } from 'src/global/verification_codes/verification-codes.service';

@Injectable()
export class VerifyTFAProcess implements CanActivate {
  constructor(
    private readonly verificationCodesService: VerificationCodesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: {
      body: { verification_code: string };
      params: { token: string };
      used_verification_code?: VerificationCode;
    } = context.switchToHttp().getRequest();

    const code = await this.verificationCodesService.getOneByCodeAndToken(
      req.body.verification_code,
      req.params.token,
    );

    if (!code) throw new ForbiddenException(CodeMessages.INVALID_CODE);

    if (
      !code.process.includes('enable_tfa') ||
      !code.process.includes('disable_tfa')
    ) {
      return false;
    }

    req.used_verification_code = code;

    return true;
  }
}
