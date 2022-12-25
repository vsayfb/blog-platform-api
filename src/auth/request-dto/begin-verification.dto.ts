import { IntersectionType } from '@nestjs/mapped-types';
import { UniqueEmailDto } from 'src/accounts/request-dto/unique-email.dto';
import { UniqueMobilePhoneDto } from 'src/accounts/request-dto/unique-mobile-phone.dto';
import { UniqueUsernameDto } from 'src/accounts/request-dto/unique-username.dto';

export class BeginVerificationWithEmailDto extends IntersectionType(
  UniqueUsernameDto,
  UniqueEmailDto,
) {}

export class BeginVerificationWithPhoneDto extends IntersectionType(
  UniqueUsernameDto,
  UniqueMobilePhoneDto,
) {}
