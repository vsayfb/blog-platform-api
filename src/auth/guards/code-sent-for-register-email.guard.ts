import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CodeMessages } from 'src/verification_codes/enums/code-messages';
import { VerificationCodesService } from 'src/verification_codes/verification-codes.service';

@Injectable()
export class CodeSentForRegisterEmail implements CanActivate {
  constructor(private readonly codesService: VerificationCodesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.body.email) return false;

    const sent = await this.codesService.getOneByReceiverAndProcess(
      request.body.email,
      'register_email',
    );

    if (sent) throw new ForbiddenException(CodeMessages.ALREADY_SENT);

    return true;
  }
}
