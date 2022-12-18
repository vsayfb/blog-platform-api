import { Injectable } from '@nestjs/common';
import { MaxLength, Validate } from 'class-validator';
import { MaxTwoUnderscores } from 'src/lib/validators/MaxTwoUnderScores';
import { MinTwoLetters } from 'src/lib/validators/MinTwoLetters';
import { NotAllowSpecialCharsExcludeUnderScore } from 'src/lib/validators/NotAllowSpecialCharsExcludeUnderScore';
import { UniqueUsername } from '../validators/check-unique-username';

export class UpdateAccountDto {
  @Validate(MinTwoLetters)
  @Validate(MaxTwoUnderscores)
  @Validate(NotAllowSpecialCharsExcludeUnderScore)
  @MaxLength(16)
  @UniqueUsername({ message: 'Username already exists.' })
  username: string;
}
