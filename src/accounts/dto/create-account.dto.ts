import { IsEmail, MaxLength, MinLength, Validate } from 'class-validator';
import { MaxTwoUnderscores } from 'src/lib/validators/MaxTwoUnderScores';
import { MinTwoLetters } from 'src/lib/validators/MinTwoLetters';
import { NotAllowSpecialCharsExcludeUnderScore } from 'src/lib/validators/NotAllowSpecialCharsExcludeUnderScore';

export class CreateAccountDto {
  @Validate(MinTwoLetters)
  @Validate(MaxTwoUnderscores)
  @Validate(NotAllowSpecialCharsExcludeUnderScore)
  @MaxLength(16)
  username: string;

  @IsEmail()
  email: string;

  @MinLength(2)
  @MaxLength(16)
  display_name: string;

  @MinLength(7)
  @MaxLength(16)
  password: string;

  @MinLength(6)
  verification_code: string;
}
