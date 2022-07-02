import { JwtPayload } from './../jwt.payload';
import { ICrudService } from 'src/lib/interfaces/ICrudService';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  MethodNotAllowedException,
} from '@nestjs/common';
import { Action, CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { PostsService } from 'src/posts/posts.service';
import { Request } from 'express';
import { Tag } from 'src/tags/entities/tag.entity';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    @Inject('SERVICE') private readonly service: ICrudService<any>,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request & { user: JwtPayload } = context
      .switchToHttp()
      .getRequest();

    const action = this.detectActionType(req.method);

    const subject = await this.service.getOneByID(req.params.id);

    const ability = this.caslAbilityFactory.createForUser(req.user);

    if (ability.can(action, subject)) return true;

    return false;
  }

  detectActionType(method: string): Action {
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
