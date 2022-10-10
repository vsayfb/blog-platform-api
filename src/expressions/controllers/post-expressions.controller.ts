import { Get, Injectable, Param, Post, UseGuards } from '@nestjs/common';
import { Account } from 'src/accounts/decorator/account.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtPayload } from 'src/lib/jwt.payload';
import { CreatedPostExpressionDto } from '../dto/created-post-expression.dto';
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
export class PostExpressionsController
  extends ExpressionsController
  implements IExpressionsController
{
  @Get(ExpressionRoutes.POST_LIKES + ':id')
  async findLikes(@Param('id') postID: string): Promise<{
    data: SelectedExpressionFields[];
    message: ExpressionMessages;
  }> {
    return {
      data: await this.expressionsService.getSubjectLikes({
        type: ExpressionSubject.POST,
        id: postID,
      }),
      message: ExpressionMessages.ALL_FOUND,
    };
  }

  @Get(ExpressionRoutes.POST_DISLIKES + ':id')
  async findDislikes(@Param('id') postID: string): Promise<{
    data: SelectedExpressionFields[];
    message: ExpressionMessages;
  }> {
    return {
      data: await this.expressionsService.getSubjectDislikes({
        type: ExpressionSubject.POST,
        id: postID,
      }),
      message: ExpressionMessages.ALL_FOUND,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(ExpressionRoutes.LIKE_TO_POST + ':id')
  async like(
    @Account() account: JwtPayload,
    @Param('id') postID: string,
  ): Promise<{
    data: CreatedPostExpressionDto;
    message: ExpressionMessages;
  }> {
    return (await super.create({
      subject: ExpressionSubject.POST,
      data: {
        accountID: account.sub,
        subjectID: postID,
        type: ExpressionType.LIKE,
      },
    })) as any;
  }

  @UseGuards(JwtAuthGuard)
  @Post(ExpressionRoutes.DISLIKE_TO_POST + ':id')
  async dislike(
    @Account() account: JwtPayload,
    @Param('id') postID: string,
  ): Promise<{ data: CreatedPostExpressionDto; message: ExpressionMessages }> {
    return (await super.create({
      subject: ExpressionSubject.POST,
      data: {
        accountID: account.sub,
        subjectID: postID,
        type: ExpressionType.DISLIKE,
      },
    })) as any;
  }
}
