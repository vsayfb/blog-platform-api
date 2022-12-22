import {
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Client } from 'src/auth/decorator/client.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EXPRESSIONS_ROUTE } from 'src/lib/constants';
import { JwtPayload } from 'src/lib/jwt.payload';
import {
  PostExpression,
  PostExpressionType,
} from 'src/posts/entities/post-expression.entity';
import { PostExpressionsService } from 'src/posts/services/post-expressions.service';
import { ExpressionMessages } from '../enums/expression-messages';
import { ExpressionRoutes } from '../enums/expression-routes';
import { PostExpressionNotificationInterceptor } from '../interceptors/post-expression-notification.interceptor';

@ApiTags(EXPRESSIONS_ROUTE)
@Controller(EXPRESSIONS_ROUTE)
@UseGuards(JwtAuthGuard)
export class PostExpressionsController {
  constructor(
    private readonly postExpressionsService: PostExpressionsService,
  ) {}

  @UseInterceptors(PostExpressionNotificationInterceptor)
  @Post(ExpressionRoutes.LIKE + '/post/' + ':id')
  async likePost(
    @Client() client: JwtPayload,
    @Param('id') postID: string,
  ): Promise<{
    data: PostExpression;
    message: ExpressionMessages;
  }> {
    return {
      data: await this.postExpressionsService.create({
        accountID: client.sub,
        postID,
        expression: PostExpressionType.LIKE,
      }),
      message: ExpressionMessages.LEFT,
    };
  }

  @UseInterceptors(PostExpressionNotificationInterceptor)
  @Post(ExpressionRoutes.DISLIKE + '/post/' + ':id')
  async dislikePost(
    @Client() client: JwtPayload,
    @Param('id') postID: string,
  ): Promise<{
    data: PostExpression;
    message: ExpressionMessages;
  }> {
    return {
      data: await this.postExpressionsService.create({
        accountID: client.sub,
        postID,
        expression: PostExpressionType.DISLIKE,
      }),
      message: ExpressionMessages.LEFT,
    };
  }

  @Delete('post' + ExpressionRoutes.DELETE + ':id')
  async removeExpression(
    @Param('id') postID: string,
    @Client() client: JwtPayload,
  ): Promise<{ id: string; message: ExpressionMessages }> {
    return {
      id: await this.postExpressionsService.delete(postID, client.sub),
      message: ExpressionMessages.REMOVED,
    };
  }
}
