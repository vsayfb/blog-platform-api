import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { BookmarksService } from 'src/bookmarks/bookmarks.service';
import { JwtPayload } from 'src/lib/jwt.payload';
import { PublicPostDto } from '../response-dto/public-post.dto';
import { PostExpressionType } from '../entities/post-expression.entity';
import { PostMessages } from '../enums/post-messages';
import { PostExpressionsService } from '../services/post-expressions.service';

@Injectable()
export class CheckClientActionsOnPost implements NestInterceptor {
  private bookmarkService: BookmarksService;

  constructor(
    private moduleRef: ModuleRef,
    private readonly postExpresionService: PostExpressionsService,
  ) {
    this.bookmarkService = this.moduleRef.get(BookmarksService, {
      strict: false,
    });
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<
    Promise<{
      data: PublicPostDto & {
        bookmarked_by: boolean;
        liked_by: boolean;
        disliked_by: boolean;
      };
      message: PostMessages;
    }>
  > {
    const request: Request & { user: JwtPayload | null } = context
      .switchToHttp()
      .getRequest();

    const client = request.user;

    return next.handle().pipe(
      map(
        async (value: { data: PublicPostDto; message: PostMessages.FOUND }) => {
          let bookmarked_by = false;
          let liked_by = false;
          let disliked_by = false;

          if (client) {
            bookmarked_by = !!(await this.bookmarkService.getByPostAndAccount(
              client.sub,
              value.data.id,
            ));

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
        },
      ),
    );
  }
}
