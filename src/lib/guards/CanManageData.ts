import { JwtPayload } from '../jwt.payload';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  MethodNotAllowedException,
} from '@nestjs/common';
import {
  Action,
  CaslAbilityFactory,
} from 'src/global/casl/casl-ability.factory';
import { Request } from 'express';
import { MANAGE_DATA_SERVICE } from '../constants';
import { IFindService } from '../interfaces/find-service.interface';

@Injectable()
export class CanManageData implements CanActivate {
  constructor(
    @Inject(MANAGE_DATA_SERVICE) private readonly service: IFindService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request & { user: JwtPayload; data: any } = context
      .switchToHttp()
      .getRequest();

    const action = this.detectActionType(req.method);

    const subject = await this.service.getOneByID(req.params.id);

    const ability = this.caslAbilityFactory.createForUser({ user: req.user });

    if (ability.can(action, subject)) {
      req.data = subject;
      return true;
    }

    return false;
  }

  private detectActionType(method: string): Action {
    /** just allow below methods because if req method is post
     * there is no subject will find by getOneByID method
     * so the subject will be undefined
     * (for any unknown subject or action CASL returns false)
     * and casl will forbid every create actions  */

    const allowedMethods = {
      GET: Action.Read,
      PATCH: Action.Update,
      PUT: Action.Update,
      DELETE: Action.Delete,
    };

    const action = allowedMethods[method];

    if (action) return action;

    throw new MethodNotAllowedException();
  }
}
