import { PartialType } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsBoolean()
  published?: true;
}
