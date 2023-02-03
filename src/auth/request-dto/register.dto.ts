import { IntersectionType } from '@nestjs/mapped-types';
import { DisplayNameDto } from 'src/resources/accounts/request-dto/display-name.dto';
import { PasswordDto } from 'src/resources/accounts/request-dto/password.dto';
import { UniqueEmailDto } from 'src/resources/accounts/request-dto/unique-email.dto';
import { UniqueMobilePhoneDto } from 'src/resources/accounts/request-dto/unique-mobile-phone.dto';
import { UniqueUsernameDto } from 'src/resources/accounts/request-dto/unique-username.dto';

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
