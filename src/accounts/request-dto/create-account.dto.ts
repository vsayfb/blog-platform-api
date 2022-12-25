import { IntersectionType } from '@nestjs/mapped-types';
import { VerificationCodeDto } from 'src/verification_codes/dto/verification-code.dto';
import { UniqueUsername } from '../validators/check-unique-username';
import { DisplayNameDto } from './display-name.dto';
import { EmailDto } from './email.dto';
import { MobilePhoneDto } from './mobil-phone-dto';
import { PasswordDto } from './password.dto';
import { UniqueEmailDto } from './unique-email.dto';
import { UniqueMobilePhoneDto } from './unique-mobile-phone.dto';
import { UniqueUsernameDto } from './unique-username.dto';
import { UsernameDto } from './username.dto';

export class CreateAccountDto extends IntersectionType(
  UniqueUsernameDto,
  PasswordDto,
  DisplayNameDto,
  VerificationCodeDto,
) {}

export class CreateAccountWithEmailDto extends IntersectionType(
  UniqueUsernameDto,
  PasswordDto,
  DisplayNameDto,
  VerificationCodeDto,
  UniqueEmailDto,
) {}

export class CreateAccountWithMobilePhoneDto extends IntersectionType(
  UsernameDto,
  PasswordDto,
  DisplayNameDto,
  VerificationCodeDto,
  UniqueMobilePhoneDto,
) {}
