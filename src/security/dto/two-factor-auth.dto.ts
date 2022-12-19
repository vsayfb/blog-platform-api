import {
  IsEmail,
  IsNumber,
  IsPhoneNumber,
  MaxLength,
  MinLength,
} from 'class-validator';

export class TFADto {
  @MinLength(7)
  @MaxLength(16)
  password: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  verification_code: number;
}

export class TFAWithPhoneDto extends TFADto {
  @IsPhoneNumber()
  phone: string;
}
