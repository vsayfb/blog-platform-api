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
} from '@nestjs/swagger';
import {
  EMAIL_REGISTERED,
  EMAIL_TAKEN,
  USERNAME_TAKEN,
} from 'src/lib/error-messages';
import { JwtPayload } from 'src/lib/jwt.payload';
import { IsImageFilePipe } from 'src/lib/pipes/IsImageFile';
import { AccountsService } from './accounts.service';
import { Account } from './decorator/account.decorator';
import { BeginVerificationDto } from './dto/begin-verification.dto';
import { EmailQueryDto } from './dto/email-query.dto';
import { UsernameQuery } from './dto/username-query.dto';

@Controller({
  path: 'accounts',
})
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

    return { message: 'The username is available.' };
  }

  @Get('/is_available_email')
  async isAvailableEmail(
    @Query() { email }: EmailQueryDto,
  ): Promise<BadRequestException | { message: string }> {
    const result = await this.accountsService.getOneByUsername(email);

    if (result) throw new BadRequestException(EMAIL_TAKEN);

    return { message: 'The email is available.' };
  }

  @ApiOkResponse({ schema: { example: { message: 'A code sent.' } } })
  @ApiForbiddenResponse({ schema: { example: { error: EMAIL_REGISTERED } } })
  @Post('begin_verification')
  @HttpCode(200)
  async beginVerification(
    @Body() data: BeginVerificationDto,
  ): Promise<{ message: string } | ForbiddenException> {
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
