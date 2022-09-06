import {
  Get,
  Injectable,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Account } from 'src/accounts/decorator/account.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtPayload } from 'src/lib/jwt.payload';
import { CreatedCommentExpressionDto } from '../dto/created-comment-expression.dto';
import { ExpressionType } from '../entities/expression.entity';
import { ExpressionRoutes } from '../enums/expression-routes';
import { ExpressionMessages } from '../enums/expressions-messages';
import { CommentExpressionsService } from '../services/comment-expressions.service';
import { SelectedExpressionFields } from '../types/selected-expression-fields';
import { ExpressionsController } from './expressions.controller';

@Injectable()
export class CommentExpressionsController extends ExpressionsController {
  constructor(
    private readonly commentExpressionsService: CommentExpressionsService,
  ) {
    super();
  }

  @Get(ExpressionRoutes.COMMENT_LIKES + ':id')
  async findCommentLikes(@Param('id') commentID: string): Promise<{
    data: SelectedExpressionFields[];
    message: ExpressionMessages;
  }> {
    return {
      data: await this.commentExpressionsService.getCommentLikes(commentID),
      message: ExpressionMessages.ALL_FOUND,
    };
  }

  @Get(ExpressionRoutes.COMMENT_DISLIKES + ':id')
  async findCommentDislikes(@Param('id') commentID: string): Promise<{
    data: SelectedExpressionFields[];
    message: ExpressionMessages;
  }> {
    return {
      data: await this.commentExpressionsService.getCommentDislikes(commentID),
      message: ExpressionMessages.ALL_FOUND,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(ExpressionRoutes.LIKE_TO_COMMENT + ':id')
  async likeComment(
    @Account() account: JwtPayload,
    @Param('id') commentID: string,
  ): Promise<{
    data: CreatedCommentExpressionDto;
    message: ExpressionMessages;
  }> {
    return {
      data: await this.commentExpressionsService.createCommentExpression({
        commentID,
        type: ExpressionType.LIKE,
        accountID: account.sub,
      }),
      message: ExpressionMessages.CREATED,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(ExpressionRoutes.DISLIKE_TO_COMMENT + ':id')
  async dislikeComment(
    @Account() account: JwtPayload,
    @Param('id') commentID: string,
  ): Promise<{
    data: CreatedCommentExpressionDto;
    message: ExpressionMessages;
  }> {
    return {
      data: await this.commentExpressionsService.createCommentExpression({
        commentID,
        type: ExpressionType.DISLIKE,
        accountID: account.sub,
      }),
      message: ExpressionMessages.CREATED,
    };
  }
}
