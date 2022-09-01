import { Injectable, Param, Post, UseGuards } from '@nestjs/common';
import { Account } from 'src/accounts/decorator/account.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtPayload } from 'src/lib/jwt.payload';
import { CreatedPostExpressionDto } from '../dto/created-post-expression.dto';
import { ExpressionType } from '../entities/expression.entity';
import { ExpressionRoutes } from '../enums/expression-routes';
import { ExpressionMessages } from '../enums/expressions-messages';
import { PostExpressionsService } from '../services/post-expressions.service';
import { ExpressionsController } from './expressions.controller';

@Injectable()
export class PostExpressionsController extends ExpressionsController {
  constructor(private readonly postExpressionsService: PostExpressionsService) {
    super();
  }

  @UseGuards(JwtAuthGuard)
  @Post(ExpressionRoutes.LIKE_TO_POST + ':id')
  async likePost(
    @Account() account: JwtPayload,
    @Param('id') postID: string,
  ): Promise<{
    data: CreatedPostExpressionDto;
    message: ExpressionMessages;
  }> {
    return {
      data: await this.postExpressionsService.createPostExpression({
        postID,
        type: ExpressionType.LIKE,
        accountID: account.sub,
      }),
      message: ExpressionMessages.CREATED,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(ExpressionRoutes.DISLIKE_TO_POST + ':id')
  async dislikePost(
    @Account() account: JwtPayload,
    @Param('id') postID: string,
  ): Promise<{ data: CreatedPostExpressionDto; message: ExpressionMessages }> {
    return {
      data: await this.postExpressionsService.createPostExpression({
        postID,
        type: ExpressionType.DISLIKE,
        accountID: account.sub,
      }),
      message: ExpressionMessages.CREATED,
    };
  }
}
