import {
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';

export class TFAAuthDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @MinLength(7)
  @MaxLength(16)
  password: string;

  @Length(6)
  verification_code: string;
}
