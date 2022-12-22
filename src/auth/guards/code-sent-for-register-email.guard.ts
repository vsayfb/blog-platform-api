import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CodesService } from 'src/codes/codes.service';
import { CodeMessages } from 'src/codes/enums/code-messages';

@Injectable()
export class CodeSentForRegisterEmail implements CanActivate {
  constructor(private readonly codesService: CodesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.body.email) return false;

    const sent = await this.codesService.getOneByReceiverAndType(
      request.body.email,
      'register_email',
    );

    if (sent) throw new ForbiddenException(CodeMessages.ALREADY_SENT);

    return true;
  }
}
