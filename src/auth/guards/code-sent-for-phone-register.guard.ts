import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CodeMessages } from 'src/verification_codes/enums/code-messages';
import { VerificationCodesService } from 'src/verification_codes/verification-codes.service';

@Injectable()
export class CodeSentForMobilePhoneRegister implements CanActivate {
  constructor(private readonly codesService: VerificationCodesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.body.mobile_phone) return false;

    const sent = await this.codesService.getOneByReceiverAndProcess(
      request.body.mobile_phone,
      'register_mobile_phone',
    );

    if (sent) throw new ForbiddenException(CodeMessages.ALREADY_SENT);

    return true;
  }
}
