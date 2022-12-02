import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { map, Observable, of } from 'rxjs';
import { BookmarksService } from 'src/bookmarks/bookmarks.service';
import { JwtPayload } from 'src/lib/jwt.payload';
import { PublicPostDto } from '../dto/public-post.dto';
import { PostExpressionType } from '../entities/post-expression.entity';
import { PostMessages } from '../enums/post-messages';
import { PostExpressionsService } from '../services/post-expressions.service';

@Injectable()
export class CheckClientActions implements NestInterceptor {
  private bookmarkService: BookmarksService;

  constructor(
    private moduleRef: ModuleRef,
    private readonly postExpresionService: PostExpressionsService,
  ) {
    this.bookmarkService = this.moduleRef.get(BookmarksService, {
      strict: false,
    });
  }

  intercept(context: ExecutionContext, next: CallHandler<any>) {
    const request: Request & { user: JwtPayload | null } = context
      .switchToHttp()
      .getRequest();

    const client = request.user;

    return next.handle().pipe(
      map(async (value: { data: PublicPostDto }) => {
        let bookmarked_by = false;
        let liked_by = false;
        let disliked_by = false;

        if (client) {
          bookmarked_by =
            await this.bookmarkService.checkAccountHaveBookmarkOnPost(
              client.sub,
              value.data.id,
            );

          const exp = await this.postExpresionService.checkAnyExpressionLeft(
            client.sub,
            value.data.id,
          );

          if (exp) {
            const type: PostExpressionType = exp.expression;

            switch (type) {
              case PostExpressionType.LIKE:
                liked_by = true;
                break;

              case PostExpressionType.DISLIKE:
                disliked_by = true;
                break;

              default:
                break;
            }
          }
        }

        return {
          data: { ...value.data, bookmarked_by, liked_by, disliked_by },
          message: PostMessages.FOUND,
        };
      }),
    );
  }
}
