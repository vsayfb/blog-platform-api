import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TagsService } from './tags.service';

@Controller('tags')
@ApiTags('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get('tag')
  findOne(@Query('name') tag: string) {
    return this.tagsService.getByName(tag);
  }

  @Get()
  findAll() {
    return this.tagsService.findAll();
  }
}
