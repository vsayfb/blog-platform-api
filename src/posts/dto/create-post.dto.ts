import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePostDto {
  @MinLength(15)
  title: string;

  @MinLength(15)
  content: string;

  @IsString()
  @IsOptional()
  title_image?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];
}
