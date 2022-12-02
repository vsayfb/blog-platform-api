import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { JwtPayload } from 'src/lib/jwt.payload';
import { CommentViewDto } from '../dto/comment-view.dto';
import { CommentExpressionType } from '../entities/comment-expression.entity';
import { CommentMessages } from '../enums/comment-messages';
import { CommentExpressionsService } from '../services/comment-expressions.service';

@Injectable()
export class CheckClientActionsOnComment implements NestInterceptor {
  constructor(
    private readonly commentExpressionsService: CommentExpressionsService,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request: { user: JwtPayload | false } = context
      .switchToHttp()
      .getRequest();

    const client = request.user;

    return next.handle().pipe(
      map(
        async (value: { data: CommentViewDto[]; message: CommentMessages }) => {
          const comments = value.data.map((c) => {
            //@ts-ignore
            c.liked_by = false;
            //@ts-ignore
            c.disliked_by = false;
            return c;
          });

          if (client) {
            for await (const comment of comments) {
              const exp =
                await this.commentExpressionsService.checkAnyExpressionLeft(
                  client.sub,
                  comment.id,
                );

              if (exp) {
                const type: CommentExpressionType = exp.expression;

                switch (type) {
                  case CommentExpressionType.LIKE:
                    //@ts-ignore
                    comment.liked_by = true;
                    break;

                  case CommentExpressionType.DISLIKE:
                    //@ts-ignore
                    comment.disliked_by = true;
                    break;

                  default:
                    break;
                }
              }
            }
          }

          return {
            data: comments,
            message: CommentMessages.ALL_FOUND,
          };
        },
      ),
    );
  }
}
