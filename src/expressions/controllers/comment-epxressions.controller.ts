import { Get, Injectable, Param, Post, UseGuards } from '@nestjs/common';
import { Account } from 'src/accounts/decorator/account.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtPayload } from 'src/lib/jwt.payload';
import { CreatedCommentExpressionDto } from '../dto/created-comment-expression.dto';
import {
  ExpressionSubject,
  ExpressionType,
} from '../entities/expression.entity';
import { ExpressionRoutes } from '../enums/expression-routes';
import { ExpressionMessages } from '../enums/expressions-messages';
import { IExpressionsController } from '../interfaces/expression.interface';
import { SelectedExpressionFields } from '../types/selected-expression-fields';
import { ExpressionsController } from './expressions.controller';

@Injectable()
export class CommentExpressionsController
  extends ExpressionsController
  implements IExpressionsController
{
  @Get(ExpressionRoutes.COMMENT_LIKES + ':id')
  async findLikes(@Param('id') commentID: string): Promise<{
    data: SelectedExpressionFields[];
    message: ExpressionMessages;
  }> {
    return {
      data: await this.expressionsService.getSubjectLikes({
        type: ExpressionSubject.COMMENT,
        id: commentID,
      }),
      message: ExpressionMessages.ALL_FOUND,
    };
  }

  @Get(ExpressionRoutes.COMMENT_DISLIKES + ':id')
  async findDislikes(@Param('id') commentID: string): Promise<{
    data: SelectedExpressionFields[];
    message: ExpressionMessages;
  }> {
    return {
      data: await this.expressionsService.getSubjectDislikes({
        type: ExpressionSubject.COMMENT,
        id: commentID,
      }),
      message: ExpressionMessages.ALL_FOUND,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(ExpressionRoutes.LIKE_TO_COMMENT + ':id')
  async like(
    @Account() account: JwtPayload,
    @Param('id') commentID: string,
  ): Promise<{
    data: CreatedCommentExpressionDto;
    message: ExpressionMessages;
  }> {
    const result = await super.create({
      subject: ExpressionSubject.COMMENT,
      data: {
        accountID: account.sub,
        subjectID: commentID,
        type: ExpressionType.LIKE,
      },
    });

    return result as any;
  }

  @UseGuards(JwtAuthGuard)
  @Post(ExpressionRoutes.DISLIKE_TO_COMMENT + ':id')
  async dislike(
    @Account() account: JwtPayload,
    @Param('id') commentID: string,
  ): Promise<{
    data: CreatedCommentExpressionDto;
    message: ExpressionMessages;
  }> {
    const result = await super.create({
      subject: ExpressionSubject.COMMENT,
      data: {
        accountID: account.sub,
        subjectID: commentID,
        type: ExpressionType.DISLIKE,
      },
    });

    return result as any;
  }
}
