import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({ minLength: 2 })
  @MinLength(2)
  username: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 7 })
  @MinLength(7)
  password: string;

  @ApiProperty({ minLength: 5 })
  @MinLength(5)
  verification_code: string;
}
