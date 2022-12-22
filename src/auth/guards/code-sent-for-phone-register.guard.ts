import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CodesService } from 'src/codes/codes.service';
import { CodeMessages } from 'src/codes/enums/code-messages';

@Injectable()
export class CodeSentForMobilePhoneRegister implements CanActivate {
  constructor(private readonly codesService: CodesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.body.mobile_phone) return false;

    const sent = await this.codesService.getOneByReceiverAndType(
      request.body.mobile_phone,
      'register_mobile_phone',
    );

    if (sent) throw new ForbiddenException(CodeMessages.ALREADY_SENT);

    return true;
  }
}
