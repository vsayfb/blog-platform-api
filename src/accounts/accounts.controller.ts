import {
  Body,
  Controller,
  Get,
  MethodNotAllowedException,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtPayload } from 'src/common/jwt.payload';
import { AccountsService } from './accounts.service';
import { Account } from './decorator/account.decorator';
import { EmailQueryDto } from './dto/email-query.dto';
import { UsernameQuery } from './dto/username-query.dto';

@Controller({
  path: 'accounts',
})
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  findMe(@Account() account: JwtPayload) {
    return account;
  }

  @Get('/is_available_username')
  async isAvailableUsername(@Query() query: UsernameQuery) {
    return !(await this.accountsService.getOneByUsername(query.username));
  }

  @Get('/is_available_email')
  async isAvailableEmail(@Query() query: EmailQueryDto) {
    return !(await this.accountsService.getOneByEmail(query.email));
  }

  @Post('begin_verification')
  async beginVerification(@Body() data: EmailQueryDto) {
    return await this.accountsService.beginRegisterVerification(data.email);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('upload_profile_photo')
  @UseInterceptors(FileInterceptor('image'))
  async uploadProfilePhoto(
    @Account() account: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new MethodNotAllowedException();

    return await this.accountsService.changeProfileImage(account, file);
  }
}
