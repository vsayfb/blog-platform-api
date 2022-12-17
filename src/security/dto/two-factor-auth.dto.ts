import { IsNumber, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { TFAVia } from '../entities/two-factor-auth.entity';

export class TwoFactorAuthDto {
  @MinLength(7)
  @MaxLength(16)
  password: string;

  @ValidateIf((_o, value) => Object.keys(TFAVia).some((v) => v === value))
  via: TFAVia;

  @IsNumber()
  @MinLength(6)
  code: number;
}
