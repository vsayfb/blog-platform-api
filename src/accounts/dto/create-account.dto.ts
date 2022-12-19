import {
  IsEmail,
  IsMobilePhone,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { MaxTwoUnderscores } from 'src/lib/validators/MaxTwoUnderScores';
import { MinTwoLetters } from 'src/lib/validators/MinTwoLetters';
import { NotAllowSpecialCharsExcludeUnderScore } from 'src/lib/validators/NotAllowSpecialCharsExcludeUnderScore';
import { UniqueEmail } from '../validators/check-unique-email';
import { UniqueUsername } from '../validators/check-unique-username';
import { UniquePhone } from '../validators/check-unique.phone';

export class CreateAccountDto {
  @Validate(MinTwoLetters)
  @Validate(MaxTwoUnderscores)
  @Validate(NotAllowSpecialCharsExcludeUnderScore)
  @MaxLength(16)
  @UniqueUsername()
  username: string;

  @MinLength(2)
  @MaxLength(16)
  display_name: string;

  @MinLength(7)
  @MaxLength(16)
  password: string;

  @MinLength(6)
  verification_code: string;
}

export class CreateAccountWithEmailDto extends CreateAccountDto {
  @IsEmail()
  @UniqueEmail()
  email: string;
}
export class CreateAccountWithPhoneDto extends CreateAccountDto {
  @IsMobilePhone()
  @UniquePhone()
  phone: string;
}
