import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { CreatePostDto } from 'src/posts/dto/create-post.dto';

export class TagNamePipe implements PipeTransform {
  transform(dto: CreatePostDto, _metadata: ArgumentMetadata) {
    const transformedTags: string[] = [];

    if (!dto.tags || !dto.tags.length) return dto;

    dto.tags.map((tag) => {
      if (tag.length >= 2) {
        transformedTags.push(
          tag
            .toLowerCase()
            .trim()
            .replace(/ /g, '-')
            .replace(/[^a-zA-Z-]/g, ''),
        );
      }
    });

    return { ...dto, tags: transformedTags };
  }
}
