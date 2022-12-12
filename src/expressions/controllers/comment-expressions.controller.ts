import {
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Account } from 'src/accounts/decorator/account.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  CommentExpression,
  CommentExpressionType,
} from 'src/comments/entities/comment-expression.entity';
import { CommentExpressionsService } from 'src/comments/services/comment-expressions.service';
import { EXPRESSIONS_ROUTE } from 'src/lib/constants';
import { JwtPayload } from 'src/lib/jwt.payload';
import { ExpressionMessages } from '../enums/expression-messages';
import { ExpressionRoutes } from '../enums/expression-routes';
import { CommentExpressionNotificationInterceptor } from '../interceptors/comment-expression-notification.interceptor';

@ApiTags(EXPRESSIONS_ROUTE)
@Controller(EXPRESSIONS_ROUTE)
@UseGuards(JwtAuthGuard)
export class CommentExpressionsController {
  constructor(
    private readonly commentExpressionsService: CommentExpressionsService,
  ) {}

  @UseInterceptors(CommentExpressionNotificationInterceptor)
  @Post(ExpressionRoutes.LIKE + '/comment/' + ':id')
  async likeComment(
    @Account() client: JwtPayload,
    @Param('id') commentID: string,
  ): Promise<{
    data: CommentExpression;
    message: ExpressionMessages;
  }> {
    return {
      data: await this.commentExpressionsService.create({
        accountID: client.sub,
        commentID,
        expression: CommentExpressionType.LIKE,
      }),
      message: ExpressionMessages.LEFT,
    };
  }

  @UseInterceptors(CommentExpressionNotificationInterceptor)
  @Post(ExpressionRoutes.DISLIKE + '/comment/' + ':id')
  async dislikeComment(
    @Account() client: JwtPayload,
    @Param('id') commentID: string,
  ): Promise<{
    data: CommentExpression;
    message: ExpressionMessages;
  }> {
    return {
      data: await this.commentExpressionsService.create({
        accountID: client.sub,
        commentID,
        expression: CommentExpressionType.DISLIKE,
      }),
      message: ExpressionMessages.LEFT,
    };
  }

  @Delete('comment' + ExpressionRoutes.DELETE + ':id')
  async removeExpression(
    @Param('id') commentID: string,
    @Account() client: JwtPayload,
  ): Promise<{ id: string; message: ExpressionMessages }> {
    return {
      id: await this.commentExpressionsService.delete(commentID, client.sub),
      message: ExpressionMessages.REMOVED,
    };
  }
}
