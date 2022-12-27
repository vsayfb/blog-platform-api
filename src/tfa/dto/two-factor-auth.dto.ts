import { Length, MaxLength, MinLength } from 'class-validator';

export class TFADto {
  @MinLength(7)
  @MaxLength(16)
  password: string;

  @Length(6)
  verification_code: string;
}
