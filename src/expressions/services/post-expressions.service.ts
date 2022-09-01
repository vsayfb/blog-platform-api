import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreatedPostExpressionDto } from '../dto/created-post-expression.dto';
import { ExpressionType } from '../entities/expression.entity';
import { ExpressionMessages } from '../enums/expressions-messages';
import { ExpressionsService } from './expressions.service';

@Injectable()
export class PostExpressionsService extends ExpressionsService {
  async createPostExpression(data: {
    postID: string;
    accountID: string;
    type: ExpressionType;
  }): Promise<CreatedPostExpressionDto> {
    const { postID, accountID, type } = data;

    await this.checkAlreadyLeft(postID, accountID);

    const saved = await this.expressionsRepository.save({
      post: { id: postID },
      left: { id: accountID },
      type,
    });

    return this.expressionsRepository.findOne({
      where: { id: saved.id },
      relations: { left: true, post: true },
    }) as any;
  }

  private async checkAlreadyLeft(postID: string, accountID: string): Promise<void> {
    const exp = await this.expressionsRepository.findOneBy({
      post: { id: postID },
      left: { id: accountID },
    });

    if (exp)
      throw new ForbiddenException(ExpressionMessages.ALREADY_LEFT_TO_POST);

    return;
  }
}
