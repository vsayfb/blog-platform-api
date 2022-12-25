import { Length, Validate } from 'class-validator';
import { IsNotBlank } from 'src/lib/validators/is-not-blank';
import { MaxTwoUnderscores } from 'src/lib/validators/max-two-underscores';
import { MinTwoLetters } from 'src/lib/validators/min-two-letters';
import { NotAllowSpecialCharsExcludeUnderScore } from 'src/lib/validators/not-allow-special-chars-exclude-underscore';

export class UsernameDto {
  @Validate(MinTwoLetters)
  @Validate(MaxTwoUnderscores)
  @Validate(NotAllowSpecialCharsExcludeUnderScore)
  @Length(2, 16)
  @IsNotBlank()
  username: string;
}
