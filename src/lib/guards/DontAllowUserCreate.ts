import { Subjects } from '../../global/casl/casl-ability.factory';
import {
  Action,
  CaslAbilityFactory,
} from '../../global/casl/casl-ability.factory';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  MethodNotAllowedException,
} from '@nestjs/common';
import { CASL_SUBJECT } from 'src/lib/constants';

@Injectable()
export class DontAllowUserCreate implements CanActivate {
  constructor(
    @Inject(CASL_SUBJECT) private readonly subject: Subjects,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    if (req.method !== 'POST') throw new MethodNotAllowedException();

    const ability = this.caslAbilityFactory.createForClient({
      client: req.user,
    });

    if (ability.can(Action.Create, this.subject)) return true;

    return false;
  }
}
