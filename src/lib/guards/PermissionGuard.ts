import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Action, CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { PostsService } from 'src/posts/posts.service';

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

    const post = await this.postsService.getOneByID(id);

    const ability = this.caslAbilityFactory.createForUser(user);

    if (ability.can(Action.Update, post)) return true;

    return false;
  }
}
