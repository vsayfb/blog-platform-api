import { IntersectionType } from '@nestjs/mapped-types';
import { Allow } from 'class-validator';
import { PostContentDto } from './post-content.dto';
import { PostTitleDto } from './post-title-dto';

export class CreatePostDto extends IntersectionType(
  PostTitleDto,
  PostContentDto,
) {
  // tagnamepipe will transform tags -> look tags.pipe.ts
  @Allow()
  tags: string[];
}
