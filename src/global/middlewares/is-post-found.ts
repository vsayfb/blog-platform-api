import {
  Injectable,
  NestMiddleware,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PostMessages } from 'src/posts/enums/post-messages';
import { PostsService } from 'src/posts/posts.service';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class IsPostFoundByIdParam implements NestMiddleware {
  constructor(private readonly postsService: PostsService) {}

  async use(req: Request & { foundData?: any }, _res: Response, next: NextFunction) {
    await new ParseUUIDPipe().transform(req.params.id, undefined);

    const post = await this.postsService.getOneByID(req.params.id);

    if (!post) throw new NotFoundException(PostMessages.NOT_FOUND);

    req.foundData = post;

    next();
  }
}
