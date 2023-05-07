import { IntersectionType } from '@nestjs/mapped-types';
import { PasswordDto } from './password.dto';
import { UniqueEmailDto } from './unique-email.dto';

export class NewEmailDto extends IntersectionType(
  UniqueEmailDto,
  PasswordDto,
) {}
