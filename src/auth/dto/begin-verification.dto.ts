import { IsEmail, IsMobilePhone, MaxLength, Validate } from 'class-validator';
import { UniqueEmail } from 'src/accounts/validators/check-unique-email';
import { UniqueUsername } from 'src/accounts/validators/check-unique-username';
import { UniquePhone } from 'src/accounts/validators/check-unique.phone';
import { MaxTwoUnderscores } from 'src/lib/validators/MaxTwoUnderScores';
import { MinTwoLetters } from 'src/lib/validators/MinTwoLetters';
import { NotAllowSpecialCharsExcludeUnderScore } from 'src/lib/validators/NotAllowSpecialCharsExcludeUnderScore';

class BeginVerificationDto {
  @Validate(MinTwoLetters)
  @Validate(MaxTwoUnderscores)
  @Validate(NotAllowSpecialCharsExcludeUnderScore)
  @MaxLength(16)
  @UniqueUsername()
  username: string;
}
export class BeginVerificationWithEmailDto extends BeginVerificationDto {
  @IsEmail()
  @UniqueEmail()
  email: string;
}

export class BeginVerificationWithPhoneDto extends BeginVerificationDto {
  @IsMobilePhone()
  @UniquePhone()
  mobile_phone: string;
}
