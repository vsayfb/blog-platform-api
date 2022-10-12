import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { AccountExpressionsDto } from '../dto/account-expressions.dto';
import {
  Expression,
  ExpressionSubject,
  ExpressionType,
} from '../entities/expression.entity';
import { ExpressionMessages } from '../enums/expressions-messages';
import { ICreateService } from 'src/lib/interfaces/create-service.interface';
import { IFindService } from 'src/lib/interfaces/find-service.interface';
import { IDeleteService } from 'src/lib/interfaces/delete-service.interface';

@Injectable()
export class ExpressionsService
  implements IFindService, ICreateService, IDeleteService
{
  @InjectRepository(Expression)
  protected readonly expressionsRepository: Repository<Expression>;

  getOneByID(id: string): Promise<Expression> {
    return this.expressionsRepository.findOne({
      where: { id },
      relations: { left: true },
    });
  }

  getAll(): Promise<Expression[]> {
    return this.expressionsRepository.find();
  }

  async getAccountExpressions(
    accountID: string,
  ): Promise<AccountExpressionsDto[]> {
    return (await this.expressionsRepository.find({
      where: { left: { id: accountID } },
      relations: { left: false, post: true },
    })) as any;
  }

  async create({
    subject,
    data,
  }: {
    subject: ExpressionSubject;
    data: {
      subjectID: string;
      accountID: string;
      type: ExpressionType;
    };
  }): Promise<any> {
    const { subjectID, accountID, type } = data;

    await this.checkAlreadyLeft({
      [subject]: { id: subjectID },
      left: { id: accountID },
    });

    const expression = await this.expressionsRepository.save({
      [subject]: { id: subjectID },
      left: { id: accountID },
      type,
    });

    return this.expressionsRepository.findOne({
      where: { id: expression.id },
      relations: { left: true, [subject]: true },
    }) as any;
  }

  async getSubjectLikes(subject: { type: ExpressionSubject; id: string }) {
    return await this.expressionsRepository.find({
      where: { [subject.type]: { id: subject.id }, type: ExpressionType.LIKE },
      relations: { left: true },
    });
  }

  async getSubjectDislikes(subject: { type: ExpressionSubject; id: string }) {
    return await this.expressionsRepository.find({
      where: {
        [subject.type]: { id: subject.id },
        type: ExpressionType.DISLIKE,
      },
      relations: { left: true },
    });
  }

  async delete(exp: Expression): Promise<string> {
    const ID = exp.id;

    await this.expressionsRepository.remove(exp);

    return ID;
  }

  protected async checkAlreadyLeft(where: FindOptionsWhere<Expression>) {
    const left = await this.expressionsRepository.findOne({
      where,
      relations: { left: true, post: true },
    });

    if (left) throw new ForbiddenException(ExpressionMessages.ALREADY_LEFT);
  }
}
