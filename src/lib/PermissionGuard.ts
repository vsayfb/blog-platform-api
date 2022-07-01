import { PostsService } from './../posts/posts.service';
import { Action, CaslAbilityFactory } from './../casl/casl-ability.factory';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly postsService: PostsService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const {
      user,
      params: { id },
    } = context.switchToHttp().getRequest();

    const post = await this.postsService.getOne(id);

    const ability = this.caslAbilityFactory.createForUser(user);

    if (ability.can(Action.Update, post)) return true;

    return false;
  }
}
