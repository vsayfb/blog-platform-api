import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountExpressionsDto } from '../dto/account-expressions.dto';
import { Expression } from '../entities/expression.entity';

@Injectable()
export class ExpressionsService {
  @InjectRepository(Expression)
  protected readonly expressionsRepository: Repository<Expression>;

  getOneByID(id: string): Promise<Expression> {
    return this.expressionsRepository.findOne({
      where: { id },
      relations: { left: true },
    });
  }

  async getAccountExpressions(
    accountID: string,
  ): Promise<AccountExpressionsDto[]> {
    return (await this.expressionsRepository.find({
      where: { left: { id: accountID } },
      relations: { left: false, post: true },
    })) as any;
  }

  async delete(exp: Expression): Promise<string> {
    const ID = exp.id;

    await this.expressionsRepository.remove(exp);

    return ID;
  }
}
