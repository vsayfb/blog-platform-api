import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { VerificationCode } from 'src/verification_codes/entities/code.entity';
import { CodeMessages } from 'src/verification_codes/enums/code-messages';
import { VerificationCodesService } from 'src/verification_codes/verification-codes.service';

/**
 * Validate body with value "verification_code" and validate params with "token" before using this guard.
 *
 * If verification code matches in database verification code, verification code will be put to request.verification_code.
 *
 * You can get verification code with @VerificationCodeObj from request object.
 *
 * You can use @DeleteVerificationCodeInBody interceptor to remove matched code in database.
 */

@Injectable()
export class VerificationCodeMatches implements CanActivate {
  constructor(
    private readonly verificationCodesService: VerificationCodesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: {
      body: { verification_code: string };
      params: { token: string };
      verification_code: VerificationCode;
    } = context.switchToHttp().getRequest();

    const code = await this.verificationCodesService.getOneByCodeAndToken(
      req.body.verification_code,
      req.params.token,
    );

    if (!code) throw new ForbiddenException(CodeMessages.INVALID_CODE);

    req.verification_code = code;

    return true;
  }
}
