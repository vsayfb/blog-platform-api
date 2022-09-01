import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreatedCommentExpressionDto } from '../dto/created-comment-expression.dto';
import { ExpressionType } from '../entities/expression.entity';
import { ExpressionMessages } from '../enums/expressions-messages';
import { SelectedExpressionFields } from '../types/selected-expression-fields';
import { ExpressionsService } from './expressions.service';

@Injectable()
export class CommentExpressionsService extends ExpressionsService {
  async createCommentExpression(data: {
    commentID: string;
    accountID: string;
    type: ExpressionType;
  }): Promise<CreatedCommentExpressionDto> {
    const { commentID, accountID, type } = data;

    await this.checkAlreadyLeft(commentID, accountID);

    const saved = await this.expressionsRepository.save({
      comment: { id: commentID },
      left: { id: accountID },
      type,
    });

    return this.expressionsRepository.findOne({
      where: { id: saved.id },
      relations: { left: true, post: true },
    }) as any;
  }

  private async checkAlreadyLeft(
    commentID: string,
    accountID: string,
  ): Promise<void> {
    const exp = await this.expressionsRepository.findOneBy({
      comment: { id: commentID },
      left: { id: accountID },
    });

    if (exp)
      throw new ForbiddenException(ExpressionMessages.ALREADY_LEFT_TO_COMMENT);

    return;
  }

  async getCommentLikes(
    commentID: string,
  ): Promise<SelectedExpressionFields[]> {
    return this.expressionsRepository.find({
      where: { comment: { id: commentID }, type: ExpressionType.LIKE },
    }) as any;
  }

  async getCommentDislikes(
    commentID: string,
  ): Promise<SelectedExpressionFields[]> {
    return this.expressionsRepository.find({
      where: { comment: { id: commentID }, type: ExpressionType.DISLIKE },
    }) as any;
  }
}
