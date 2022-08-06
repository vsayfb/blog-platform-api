import { Subjects } from '../../global/casl/casl-ability.factory';
import { Action, CaslAbilityFactory } from '../../global/casl/casl-ability.factory';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  MethodNotAllowedException,
} from '@nestjs/common';

@Injectable()
export class NotAllowUserCreate implements CanActivate {
  constructor(
    @Inject('SUBJECT') private readonly subject: Subjects,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    if (req.method !== 'POST') throw new MethodNotAllowedException();

    const ability = this.caslAbilityFactory.createForUser({ user: req.user });

    if (ability.can(Action.Create, this.subject)) return true;

    return false;
  }
}
