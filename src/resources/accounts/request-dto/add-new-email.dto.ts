import { IntersectionType } from '@nestjs/mapped-types';
import { PasswordDto } from './password.dto';
import { UniqueEmailDto } from './unique-email.dto';

export class AddNewEmail extends IntersectionType(
  UniqueEmailDto,
  PasswordDto,
) {}
