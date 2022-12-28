import { IntersectionType } from '@nestjs/mapped-types';
import { DisplayNameDto } from 'src/accounts/request-dto/display-name.dto';
import { PasswordDto } from 'src/accounts/request-dto/password.dto';
import { UniqueEmailDto } from 'src/accounts/request-dto/unique-email.dto';
import { UniqueMobilePhoneDto } from 'src/accounts/request-dto/unique-mobile-phone.dto';
import { UniqueUsernameDto } from 'src/accounts/request-dto/unique-username.dto';

export class RegisterWithEmailDto extends IntersectionType(
  UniqueUsernameDto,
  DisplayNameDto,
  PasswordDto,
  UniqueEmailDto,
) {}

export class RegisterWithMobilePhoneDto extends IntersectionType(
  UniqueUsernameDto,
  DisplayNameDto,
  PasswordDto,
  UniqueMobilePhoneDto,
) {}
