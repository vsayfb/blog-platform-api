import {
  Body,
  Controller,
  Get,
  HttpCode,
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
import { JwtPayload } from 'src/lib/jwt.payload';
import { IsImageFilePipe } from 'src/uploads/pipes/IsImageFile';
import { AccountsService } from './accounts.service';
import { Account } from './decorator/account.decorator';
import { AccountProfileDto } from './dto/account-profile.dto';
import { BeginVerificationDto } from './dto/begin-verification.dto';
import { EmailQueryDto } from './dto/email-query.dto';
import { UsernameQuery } from './dto/username-query.dto';
import { AccountMessages } from './enums/account-messages';
import { AccountRoutes } from './enums/account-routes';
import { SelectedAccountFields } from './types/selected-account-fields';

@Controller('accounts')
@ApiTags('accounts')
export class AccountsController implements IFindController {
  constructor(private readonly accountsService: AccountsService) {}

  @UseGuards(JwtAuthGuard)
  @Get(AccountRoutes.FIND_ME)
  findMe(@Account() account: JwtPayload): JwtPayload {
    return account;
  }

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

  @Post(AccountRoutes.BEGIN_REGISTER_VERIFICATION)
  @HttpCode(200)
  async beginVerification(
    @Body() data: BeginVerificationDto,
  ): Promise<{ message: string }> {
    return await this.accountsService.beginLocalRegisterVerification(
      data.username,
      data.email,
    );
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
