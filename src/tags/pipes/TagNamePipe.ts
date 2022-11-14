import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { CreatePostDto } from 'src/posts/dto/create-post.dto';

export class TagNamePipe implements PipeTransform {
  transform(dto: CreatePostDto, _metadata: ArgumentMetadata) {
    const transformedTags: string[] = [];

    let parsedTags : string[] = [];	
  
    try{
      // maybe tags are sent in a form data
      parsedTags = JSON.parse(dto.tags as unknown as string);
    }catch(err){
      parsedTags = dto.tags; 

    }	

    if (!parsedTags || !parsedTags.length) {
      dto.tags = [];

      return dto;
    }

    parsedTags.map((tag) => {
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
