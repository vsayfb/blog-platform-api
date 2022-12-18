import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Account } from 'src/accounts/entities/account.entity';
import { CheckClientIsFollowing } from 'src/accounts/interceptors/check-client-is-following.interceptor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { PROFILES_ROUTE } from 'src/lib/constants';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { CanManageData } from 'src/lib/guards/CanManageData';
import { IFindController } from 'src/lib/interfaces/find-controller.interface';
import { JwtPayload } from 'src/lib/jwt.payload';
import { RequiredImageFile } from 'src/uploads/pipes/required-image-file';
import { UploadsService } from 'src/uploads/uploads.service';
import { ProfileDto } from './dto/profile.dto';
import { UpdateDisplayNameDto } from './dto/update-display-name.dto';
import { ProfileMessages } from './enums/profile-messages';
import { ProfileRoutes } from './enums/profile-routes';
import { ProfilesService } from './profiles.service';

@Controller(PROFILES_ROUTE)
@ApiTags(PROFILES_ROUTE)
export class ProfilesController implements IFindController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly uploadsService: UploadsService,
  ) {}

  @UseGuards(OptionalJwtAuthGuard)
  @UseInterceptors(CheckClientIsFollowing)
  @Get(ProfileRoutes.FIND_ONE + ':username')
  async findOne(
    @Param('username') username: string,
  ): Promise<{ data: ProfileDto; message: string }> {
    return {
      data: await this.profilesService.getOneByAccountUsername(username),
      message: ProfileMessages.FOUND,
    };
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @UseInterceptors(FileInterceptor('image'))
  @Patch(ProfileRoutes.UPDATE_IMAGE + ':id')
  async updateImage(
    @Data() profile: Account,
    @UploadedFile(RequiredImageFile) image: Express.Multer.File,
  ): Promise<{ data: string; message: ProfileMessages }> {
    const newURL = await this.uploadsService.uploadProfileImage(image);

    await this.profilesService.update(profile, { image: newURL });

    return {
      data: newURL,
      message: ProfileMessages.IMAGE_CHANGED,
    };
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @Patch(ProfileRoutes.UPDATE_DISPLAY_NAME + ':id')
  async updateDisplayname(
    @Data() profile: Account,
    @Body() body: UpdateDisplayNameDto,
  ): Promise<{ data: string; message: ProfileMessages }> {
    return {
      data: await this.profilesService.update(profile, body),
      message: ProfileMessages.DISPLAY_NAME_UPDATED,
    };
  }
}
