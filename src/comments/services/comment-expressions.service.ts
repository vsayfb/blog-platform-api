import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpressionMessages } from 'src/expressions/enums/expression-messages';
import { CommentsNotificationService } from 'src/global/notifications/services/comments-notification.service';
import { NotificationActions } from 'src/global/notifications/entities/notification.entity';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { Repository } from 'typeorm';
import {
  CommentExpression,
  CommentExpressionType,
} from '../entities/comment-expression.entity';
import { CommentsService } from './comments.service';

@Injectable()
export class CommentExpressionsService implements ICreateService {
  constructor(
    @InjectRepository(CommentExpression)
    private readonly commentExpressionRepository: Repository<CommentExpression>,
    private readonly commentNotificationService: CommentsNotificationService,
    private readonly commentsService: CommentsService,
  ) {}

  async checkAnyExpressionLeft(accountID: string, commentID: string) {
    const expression = await this.commentExpressionRepository.findOne({
      where: { account: { id: accountID }, comment: { id: commentID } },
    });

    return expression;
  }

  async create(data: {
    accountID: string;
    commentID: string;
    expression: CommentExpressionType;
  }): Promise<CommentExpression> {
    const { accountID, commentID, expression } = data;

    const comment = await this.commentsService.getOneByID(data.commentID);

    if (comment?.author.id === data.accountID) {
      throw new ForbiddenException(ExpressionMessages.CANT_LEFT);
    }

    const exp = await this.checkAnyExpressionLeft(accountID, commentID);

    if (exp) throw new ForbiddenException(ExpressionMessages.ALREADY_LEFT);

    const result = await this.commentExpressionRepository.save({
      account: { id: accountID },
      comment: { id: commentID },
      expression,
    });

    return await this.commentExpressionRepository.findOne({
      where: { id: result.id },
      relations: { account: true, comment: { author: true, post: true } },
    });
  }

  async delete(commentID: string, accountID: string): Promise<string> {
    const exp = await this.commentExpressionRepository.findOne({
      where: { comment: { id: commentID }, account: { id: accountID } },
      relations: { account: true, comment: { author: true } },
    });

    if (!exp) throw new ForbiddenException(ExpressionMessages.NOT_FOUND);

    const ID = exp.id;

    const action =
      exp.expression === CommentExpressionType.LIKE
        ? NotificationActions.LIKED_COMMENT
        : NotificationActions.DISLIKED_COMMENT;

    this.commentNotificationService.deleteNotificationByIds(
      exp.account.id,
      exp.comment.author.id,
      action,
    );

    await this.commentExpressionRepository.remove(exp);

    return ID;
  }
}
