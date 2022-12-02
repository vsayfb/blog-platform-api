import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpressionMessages } from 'src/expressions/enums/expression-messages';
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
  }): Promise<{
    id: string;
    created_at: Date;
    expression: CommentExpressionType;
  }> {
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

    return this.commentExpressionRepository.findOne({
      where: { id: result.id },
    });
  }

  async delete(commentID: string, accountID: string): Promise<string> {
    const exp = await this.commentExpressionRepository.findOne({
      where: { comment: { id: commentID }, account: { id: accountID } },
    });

    if (!exp) throw new ForbiddenException(ExpressionMessages.NOT_FOUND);

    const ID = exp.id;

    await this.commentExpressionRepository.remove(exp);

    return ID;
  }
}
