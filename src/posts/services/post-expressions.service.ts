import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpressionMessages } from 'src/expressions/enums/expression-messages';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { IDeleteService } from 'src/lib/interfaces/delete-service.interface';
import { Repository } from 'typeorm';
import {
  PostExpression,
  PostExpressionType,
} from '../entities/post-expression.entity';

@Injectable()
export class PostExpressionsService implements ICreateService {
  constructor(
    @InjectRepository(PostExpression)
    private readonly postExpressionRepository: Repository<PostExpression>,
  ) {}

  async checkAnyExpressionLeft(accountID: string, postID: string) {
    const expression = await this.postExpressionRepository.findOne({
      where: { account: { id: accountID }, post: { id: postID } },
    });

    return expression;
  }

  async create(data: {
    accountID: string;
    postID: string;
    expression: PostExpressionType;
  }): Promise<{
    id: string;
    created_at: Date;
    expression: PostExpressionType;
  }> {
    const { accountID, postID, expression } = data;

    const exp = await this.checkAnyExpressionLeft(accountID, postID);

    if (exp) throw new ForbiddenException(ExpressionMessages.ALREADY_LEFT);

    const result = await this.postExpressionRepository.save({
      account: { id: accountID },
      post: { id: postID },
      expression,
    });

    return this.postExpressionRepository.findOne({ where: { id: result.id } });
  }

  async delete(postID: string, accountID: string): Promise<string> {
    const exp = await this.postExpressionRepository.findOne({
      where: { post: { id: postID }, account: { id: accountID } },
    });

    if (!exp) throw new ForbiddenException(ExpressionMessages.NOT_FOUND);

    const ID = exp.id;

    await this.postExpressionRepository.remove(exp);

    return ID;
  }
}
