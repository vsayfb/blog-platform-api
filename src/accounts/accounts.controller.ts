import { USERNAME_AVAILABLE } from './../lib/api-messages/api-messages';
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  EMAIL_AVAILABLE,
  EMAIL_REGISTERED,
  EMAIL_TAKEN,
  USERNAME_TAKEN,
} from 'src/lib/api-messages';
import { JwtPayload } from 'src/lib/jwt.payload';
import { IsImageFilePipe } from 'src/lib/pipes/IsImageFile';
import { AccountsService } from './accounts.service';
import { Account } from './decorator/account.decorator';
import { BeginVerificationDto } from './dto/begin-verification.dto';
import { EmailQueryDto } from './dto/email-query.dto';
import { UsernameQuery } from './dto/username-query.dto';

@Controller('accounts')
@ApiTags('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @UseGuards(AuthGuard('jwt'))
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
  @Get('me')
  findMe(@Account() account: JwtPayload): JwtPayload {
    return account;
  }

  @Get('/is_available_username')
  async isAvailableUsername(
    @Query() { username }: UsernameQuery,
  ): Promise<BadRequestException | { message: string }> {
    const result = await this.accountsService.getOneByUsername(username);

    if (result) throw new BadRequestException(USERNAME_TAKEN);

    return { message: USERNAME_AVAILABLE };
  }

  @Get('/is_available_email')
  async isAvailableEmail(
    @Query() { email }: EmailQueryDto,
  ): Promise<BadRequestException | { message: string }> {
    const result = await this.accountsService.getOneByUsername(email);

    if (result) throw new BadRequestException(EMAIL_TAKEN);

    return { message: EMAIL_AVAILABLE };
  }

  @ApiOkResponse({ schema: { example: { message: 'A code sent.' } } })
  @ApiForbiddenResponse({ schema: { example: { error: EMAIL_REGISTERED } } })
  @Post('begin_register_verification')
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
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('image'))
  @Post('upload_profile_image')
  async uploadProfilePhoto(
    @Account() account: JwtPayload,
    @UploadedFile(IsImageFilePipe) image: Express.Multer.File,
  ): Promise<{ newImage: string }> {
    return await this.accountsService.changeProfileImage(account, image);
  }
}
