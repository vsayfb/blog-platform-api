import { IntersectionType } from '@nestjs/mapped-types';
import { PasswordDto } from './password.dto';
import { UniqueMobilePhoneDto } from './unique-mobile-phone.dto';

export class AddNewPhoneDto extends IntersectionType(
  UniqueMobilePhoneDto,
  PasswordDto,
) {}
