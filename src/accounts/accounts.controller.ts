import {
  Body,
  Controller,
  forwardRef,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ACCOUNTS_ROUTE } from 'src/lib/constants';
import { IFindController } from 'src/lib/interfaces/find-controller.interface';
import { JwtPayload } from 'src/lib/jwt.payload';
import { IsImageFilePipe } from 'src/uploads/pipes/IsImageFile';
import { AccountsService } from './services/accounts.service';
import { Account } from './decorator/account.decorator';
import { AccountProfileDto } from './dto/account-profile.dto';
import { EmailQueryDto } from './dto/email-query.dto';
import { UsernameQuery } from './dto/username-query.dto';
import { AccountMessages } from './enums/account-messages';
import { AccountRoutes } from './enums/account-routes';
import { SelectedAccountFields } from './types/selected-account-fields';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { CheckClientIsFollowing } from './interceptors/check-client-is-following.interceptor';

@Controller(ACCOUNTS_ROUTE)
@ApiTags(ACCOUNTS_ROUTE)
export class AccountsController implements IFindController {
  constructor(private readonly accountsService: AccountsService) {}

  @UseGuards(JwtAuthGuard)
  @Get(AccountRoutes.CLIENT)
  findMe(@Account() account: JwtPayload): JwtPayload {
    return account;
  }

  @UseGuards(OptionalJwtAuthGuard)
  @UseInterceptors(CheckClientIsFollowing)
  @Get(AccountRoutes.PROFILE + ':username')
  async findOne(@Param() { username }: UsernameQuery): Promise<{
    data: AccountProfileDto;
    message: AccountMessages;
  }> {
    return {
      data: await this.accountsService.getProfile(username),
      message: AccountMessages.FOUND,
    };
  }

  @Get(AccountRoutes.SEARCH_BY_USERNAME)
  @UseGuards(JwtAuthGuard)
  async searchByUsername(
    @Query() { username }: UsernameQuery,
  ): Promise<{ data: SelectedAccountFields[]; message: AccountMessages }> {
    return {
      data: await this.accountsService.searchByUsername(username),
      message: AccountMessages.FOUND_BY_USERNAME,
    };
  }

  @Get(AccountRoutes.IS_AVAILABLE_USERNAME)
  async isAvailableUsername(
    @Query() { username }: UsernameQuery,
  ): Promise<{ data: boolean; message: string }> {
    const account = await this.accountsService.getOneByUsername(username);

    if (account)
      return { data: false, message: AccountMessages.USERNAME_TAKEN };

    return { data: true, message: AccountMessages.USERNAME_AVAILABLE };
  }

  @Get(AccountRoutes.IS_AVAILABLE_EMAIL)
  async isAvailableEmail(
    @Query() { email }: EmailQueryDto,
  ): Promise<{ data: boolean; message: string }> {
    const account = await this.accountsService.getOneByUsername(email);

    if (account) return { data: false, message: AccountMessages.EMAIL_TAKEN };

    return { data: true, message: AccountMessages.EMAIL_AVAILABLE };
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Post(AccountRoutes.UPLOAD_PROFILE_PHOTO)
  async uploadProfilePhoto(
    @Account() account: JwtPayload,
    @UploadedFile(IsImageFilePipe) image: Express.Multer.File,
  ): Promise<{ data: string; message: AccountMessages }> {
    return {
      data: await this.accountsService.changeProfileImage(account, image),
      message: AccountMessages.PP_CHANGED,
    };
  }
}
