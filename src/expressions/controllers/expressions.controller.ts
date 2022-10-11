import { Controller, Delete, Get, Inject, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Account } from 'src/accounts/decorator/account.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EXPRESSIONS_ROUTE } from 'src/lib/constants';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { CanManageData } from 'src/lib/guards/CanManageData';
import { JwtPayload } from 'src/lib/jwt.payload';
import { AccountExpressionsDto } from '../dto/account-expressions.dto';
import {
  Expression,
  ExpressionSubject,
  ExpressionType,
} from '../entities/expression.entity';
import { ExpressionRoutes } from '../enums/expression-routes';
import { ExpressionMessages } from '../enums/expressions-messages';
import { ExpressionsService } from '../services/expressions.service';

@Controller(EXPRESSIONS_ROUTE)
@ApiTags(EXPRESSIONS_ROUTE)
export class ExpressionsController
  implements ICreateController, IDeleteController
{
  @Inject(ExpressionsService)
  protected readonly expressionsService: ExpressionsService;

  @UseGuards(JwtAuthGuard)
  @Get(ExpressionRoutes.CLIENT)
  async findMyExpressions(@Account() client: JwtPayload): Promise<{
    data: AccountExpressionsDto[];
    message: ExpressionMessages.ALL_FOUND;
  }> {
    return {
      data: await this.expressionsService.getAccountExpressions(client.sub),
      message: ExpressionMessages.ALL_FOUND,
    };
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @Delete(ExpressionRoutes.REMOVE + ':id')
  async delete(
    @Data() expression: Expression,
  ): Promise<{ id: string; message: ExpressionMessages.DELETED }> {
    return {
      id: await this.expressionsService.delete(expression),
      message: ExpressionMessages.DELETED,
    };
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
  }): Promise<{ data: Expression; message: ExpressionMessages.CREATED }> {
    return {
      data: await this.expressionsService.create({ subject, data }),
      message: ExpressionMessages.CREATED,
    };
  }
}
