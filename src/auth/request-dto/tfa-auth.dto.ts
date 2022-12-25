import { IntersectionType } from '@nestjs/mapped-types';
import { PasswordDto } from 'src/accounts/request-dto/password.dto';
import { UsernameDto } from 'src/accounts/request-dto/username.dto';
import { VerificationCodeDto } from 'src/verification_codes/dto/verification-code.dto';

export class TFAAuthDto extends IntersectionType(
  UsernameDto,
  PasswordDto,
  VerificationCodeDto,
) {}
