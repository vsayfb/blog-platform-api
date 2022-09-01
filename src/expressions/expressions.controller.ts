import { Controller, Delete, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Account } from 'src/accounts/decorator/account.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { CanManageData } from 'src/lib/guards/CanManageData';
import { JwtPayload } from 'src/lib/jwt.payload';
import { AccountExpressionsDto } from './dto/account-expressions.dto';
import { Expression } from './entities/expression.entity';
import { ExpressionRoutes } from './enums/expression-routes';
import { ExpressionMessages } from './enums/expressions-messages';
import { ExpressionsService } from './services/expressions.service';

@Controller('expressions')
@ApiTags('expressions')
export class ExpressionsController {
  constructor(private readonly expressionsService: ExpressionsService) {}

  @UseGuards(JwtAuthGuard)
  @Get(ExpressionRoutes.ME)
  async findMyExpressions(
    @Account() me: JwtPayload,
  ): Promise<{ data: AccountExpressionsDto[]; message: ExpressionMessages }> {
    return {
      data: await this.expressionsService.getAccountExpressions(me.sub),
      message: ExpressionMessages.ALL_FOUND,
    };
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @Delete(ExpressionRoutes.REMOVE + ':id')
  async remove(
    @Data() expression: Expression,
  ): Promise<{ id: string; message: ExpressionMessages }> {
    return {
      id: await this.expressionsService.delete(expression),
      message: ExpressionMessages.DELETED,
    };
  }
}
