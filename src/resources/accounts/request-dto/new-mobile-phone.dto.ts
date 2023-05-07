import { IntersectionType } from '@nestjs/mapped-types';
import { PasswordDto } from './password.dto';
import { UniqueMobilePhoneDto } from './unique-mobile-phone.dto';

export class NewMobilePhoneDto extends IntersectionType(
  UniqueMobilePhoneDto,
  PasswordDto,
) {}
