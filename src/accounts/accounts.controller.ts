import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  MethodNotAllowedException,
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
import { EMAIL_REGISTERED } from 'src/common/error-messages';
import { JwtPayload } from 'src/common/jwt.payload';
import { AccountsService } from './accounts.service';
import { Account } from './decorator/account.decorator';
import { EmailQueryDto } from './dto/email-query.dto';
import { FileUploadDto } from './dto/file-upload.dto';
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
      },
    },
  })
  @Get('me')
  findMe(@Account() account: JwtPayload): JwtPayload {
    return account;
  }

  @Get('/is_available_username')
  async isAvailableUsername(@Query() query: UsernameQuery): Promise<boolean> {
    return !(await this.accountsService.getOneByUsername(query.username));
  }

  @Get('/is_available_email')
  async isAvailableEmail(@Query() query: EmailQueryDto): Promise<boolean> {
    return !(await this.accountsService.getOneByEmail(query.email));
  }

  @ApiOkResponse({ schema: { example: { message: 'A code sent.' } } })
  @ApiForbiddenResponse({ schema: { example: { error: EMAIL_REGISTERED } } })
  @Post('begin_verification')
  @HttpCode(200)
  async beginVerification(
    @Body() data: EmailQueryDto,
  ): Promise<{ message: string } | ForbiddenException> {
    return await this.accountsService.beginRegisterVerification(data.email);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'A profile image',
    type: FileUploadDto,
  })
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('image'))
  @Post('upload_profile_photo')
  async uploadProfilePhoto(
    @Account() account: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ newImage: string }> {
    if (!file) throw new MethodNotAllowedException();

    return await this.accountsService.changeProfileImage(account, file);
  }
}
