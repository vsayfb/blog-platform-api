import { IntersectionType } from '@nestjs/mapped-types';
import { PasswordDto } from 'src/resources/accounts/request-dto/password.dto';
import { UsernameDto } from 'src/resources/accounts/request-dto/username.dto';
import { VerificationCodeDto } from 'src/resources/verification_codes/dto/verification-code.dto';

export class TFADto extends IntersectionType(
  UsernameDto,
  PasswordDto,
  VerificationCodeDto,
) {}
