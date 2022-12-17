import {
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CheckPasswordsMatch } from 'src/accounts/guards/check-passwords-match.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SECURITY_ROUTE } from 'src/lib/constants';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { CanManageData } from 'src/lib/guards/CanManageData';
import { ICreateController } from 'src/lib/interfaces/create-controller.interface';
import { IDeleteController } from 'src/lib/interfaces/delete-controller.interface';
import { IUpdateController } from 'src/lib/interfaces/update-controller.interface';
import { TwoFactorAuthDto } from '../dto/two-factor-auth.dto';
import { TwoFactorAuth } from '../entities/two-factor-auth.entity';
import { SecurityMessages } from '../enums/security-messages';
import { SecurityRoutes } from '../enums/security-routes';
import { TwoFactorAuthService } from '../services/two-factor-auth.service';

@Controller(SECURITY_ROUTE + '/2fa')
@ApiTags(SECURITY_ROUTE + '/2fa')
export class TwoFactorAuthController
  implements ICreateController, IUpdateController, IDeleteController
{
  constructor(private readonly twoFactorAuthService: TwoFactorAuthService) {}

  @Post(SecurityRoutes.CREATE + ':id')
  @UseGuards(JwtAuthGuard, CheckPasswordsMatch)
  async create(
    @Param('id') accountID: string,
    dto: TwoFactorAuthDto,
  ): Promise<{ data: TwoFactorAuth; message: SecurityMessages }> {
    return {
      data: await this.twoFactorAuthService.create({ accountID, via: dto.via }),
      message: SecurityMessages.ACTIVATED_2FA,
    };
  }

  @UseGuards(JwtAuthGuard, CanManageData, CheckPasswordsMatch)
  @Patch(SecurityRoutes.UPDATE + ':id')
  async update(
    @Data() data: TwoFactorAuth,
    dto: TwoFactorAuthDto,
  ): Promise<{ data: TwoFactorAuth; message: SecurityMessages }> {
    return {
      data: await this.twoFactorAuthService.update(data, dto.via),
      message: SecurityMessages.UPDATED_2FA,
    };
  }

  @UseGuards(JwtAuthGuard, CanManageData, CheckPasswordsMatch)
  @Delete(SecurityRoutes.DELETE + ':id')
  async delete(
    subject: TwoFactorAuth,
  ): Promise<{ id: string; message: SecurityMessages }> {
    return {
      id: await this.twoFactorAuthService.delete(subject),
      message: SecurityMessages.DEACTIVATED_2FA,
    };
  }
}
