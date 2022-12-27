import { IntersectionType } from '@nestjs/mapped-types';
import { GoogleAccessTokenDto } from 'src/auth/request-dto/google-access-token.dto';
import { NewPasswordDto } from './new-password.dto';

export class UpdateGoogleAccountPasswordDto extends IntersectionType(
  GoogleAccessTokenDto,
  NewPasswordDto,
) {}
