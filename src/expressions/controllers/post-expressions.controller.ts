import { Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Account } from 'src/accounts/decorator/account.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EXPRESSIONS_ROUTE, POSTS_ROUTE } from 'src/lib/constants';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { CanManageData } from 'src/lib/guards/CanManageData';
import { IDeleteController } from 'src/lib/interfaces/delete-controller.interface';
import { JwtPayload } from 'src/lib/jwt.payload';
import {
  PostExpression,
  PostExpressionType,
} from 'src/posts/entities/post-expression.entity';
import { PostExpressionsService } from 'src/posts/services/post-expressions.service';
import { ExpressionMessages } from '../enums/expression-messages';
import { ExpressionRoutes } from '../enums/expression-routes';

@ApiTags(EXPRESSIONS_ROUTE)
@Controller(EXPRESSIONS_ROUTE)
@UseGuards(JwtAuthGuard)
export class PostExpressionsController {
  constructor(
    private readonly postExpressionsService: PostExpressionsService,
  ) {}

  @Post(ExpressionRoutes.LIKE + '/post/' + ':id')
  async likePost(
    @Account() client: JwtPayload,
    @Param('id') postID: string,
  ): Promise<{
    data: { id: string; created_at: Date; expression: PostExpressionType };
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

  @Post(ExpressionRoutes.DISLIKE + '/post/' + ':id')
  async dislikePost(
    @Account() client: JwtPayload,
    @Param('id') postID: string,
  ): Promise<{
    data: { id: string; created_at: Date; expression: PostExpressionType };
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
    @Account() client: JwtPayload,
  ): Promise<{ id: string; message: ExpressionMessages }> {
    return {
      id: await this.postExpressionsService.delete(postID, client.sub),
      message: ExpressionMessages.REMOVED,
    };
  }
}
