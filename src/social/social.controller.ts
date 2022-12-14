import { Controller, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SOCIAL_ROUTE } from 'src/lib/constants';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { IUpdateController } from 'src/lib/interfaces/update-controller.interface';
import { UpdateSocialDto } from './dto/update-social.dto';
import { Social } from './entity/social.entity';
import { SocialMessages } from './enums/social-messages';
import { SocialRoutes } from './enums/social-routes';
import { SocialService } from './social.service';

@Controller(SOCIAL_ROUTE)
@ApiTags(SOCIAL_ROUTE)
@UseGuards(JwtAuthGuard)
export class SocialController implements IUpdateController {
  constructor(private readonly socialService: SocialService) {}

  @Put(SocialRoutes.UPDATE + ':id')
  async update(
    dto: UpdateSocialDto,
    @Data() subject: Social,
  ): Promise<{ data: any; message: string }> {
    return {
      data: await this.socialService.update(subject, dto),
      message: SocialMessages.UPDATED,
    };
  }
}
