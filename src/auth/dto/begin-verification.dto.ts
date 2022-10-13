import { IsEmail, Validate } from 'class-validator';
import { MaxTwoUnderscores } from 'src/lib/validators/MaxTwoUnderScores';
import { MinTwoLetters } from 'src/lib/validators/MinTwoLetters';
import { NotAllowSpecialCharsExcludeUnderScore } from 'src/lib/validators/NotAllowSpecialCharsExcludeUnderScore';

export class BeginVerificationDto {
  @IsEmail()
  email: string;

  @Validate(MinTwoLetters)
  @Validate(MaxTwoUnderscores)
  @Validate(NotAllowSpecialCharsExcludeUnderScore)
  username: string;
}
