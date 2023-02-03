import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Client } from 'src/auth/decorator/client.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { EXPRESSIONS_ROUTE } from 'src/lib/constants';
import { JwtPayload } from 'src/lib/jwt.payload';
import {
  PostExpression,
  PostExpressionType,
} from 'src/resources/posts/entities/post-expression.entity';
import { PostExpressionsService } from 'src/resources/posts/services/post-expressions.service';
import { ExpressionMessages } from '../enums/expression-messages';
import { ExpressionRoutes } from '../enums/expression-routes';
import { PostExpressionNotificationInterceptor } from '../interceptors/post-expression-notification.interceptor';

@ApiTags(EXPRESSIONS_ROUTE)
@Controller(EXPRESSIONS_ROUTE)
export class PostExpressionsController {
  constructor(
    private readonly postExpressionsService: PostExpressionsService,
  ) {}

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
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

  @Get(ExpressionRoutes.FIND_COUNT_ON_POST + ':id')
  async findExpressionsCount(@Param('id') postID: string): Promise<{
    data: { like_count: number; dislike_count: number };
    message: ExpressionMessages;
  }> {
    return {
      data: await this.postExpressionsService.getCount(postID),
      message: ExpressionMessages.COUNT_FOUND,
    };
  }

  @UseGuards(JwtAuthGuard)
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
