import {
  BadRequestException,
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
import {
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CodeMessages } from 'src/codes/enums/code-messages';
import { JwtPayload } from 'src/lib/jwt.payload';
import { IsImageFilePipe } from 'src/uploads/pipes/IsImageFile';
import { AccountsService } from './accounts.service';
import { Account } from './decorator/account.decorator';
import { BeginVerificationDto } from './dto/begin-verification.dto';
import { EmailQueryDto } from './dto/email-query.dto';
import { UsernameQuery } from './dto/username-query.dto';
import { AccountMessages } from './enums/account-messages';
import { AccountRoutes } from './enums/account-routes';

@Controller('accounts')
@ApiTags('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    schema: {
      example: {
        username: 'string',
        image: 'string',
        id: 'string',
        iat: 'number',
        exp: 'number',
      },
    },
  })
  @Get(AccountRoutes.FIND_ME)
  findMe(@Account() account: JwtPayload): JwtPayload {
    return account;
  }

  @Get(AccountRoutes.PROFILE + ':username')
  async findProfile(@Param('username') username: string) {
    return {
      data: await this.accountsService.getProfile(username),
      message: AccountMessages.FOUND,
    };
  }

  @Get(AccountRoutes.IS_AVAILABLE_USERNAME)
  async isAvailableUsername(
    @Query() { username }: UsernameQuery,
  ): Promise<{ message: string }> {
    const result = await this.accountsService.getOneByUsername(username);

    if (result) throw new BadRequestException(AccountMessages.USERNAME_TAKEN);

    return { message: AccountMessages.USERNAME_AVAILABLE };
  }

  @Get(AccountRoutes.IS_AVAILABLE_USERNAME)
  async isAvailableEmail(
    @Query() { email }: EmailQueryDto,
  ): Promise<{ message: string }> {
    const result = await this.accountsService.getOneByUsername(email);

    if (result) throw new BadRequestException(AccountMessages.EMAIL_TAKEN);

    return { message: AccountMessages.EMAIL_AVAILABLE };
  }

  @ApiOkResponse({ schema: { example: { message: CodeMessages.CODE_SENT } } })
  @ApiForbiddenResponse({
    schema: { example: { error: AccountMessages.EMAIL_TAKEN } },
  })
  @Post(AccountRoutes.BEGIN_REGISTER_VERIFICATION)
  @HttpCode(200)
  async beginVerification(
    @Body() data: BeginVerificationDto,
  ): Promise<{ message: string }> {
    return await this.accountsService.beginRegisterVerification(
      data.username,
      data.email,
    );
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'A profile image',
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Post(AccountRoutes.UPLOAD_PROFILE_PHOTO)
  async uploadProfilePhoto(
    @Account() account: JwtPayload,
    @UploadedFile(IsImageFilePipe) image: Express.Multer.File,
  ): Promise<{ newImage: string }> {
    return await this.accountsService.changeProfileImage(account, image);
  }
}
