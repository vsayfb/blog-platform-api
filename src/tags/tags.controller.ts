import { Controller, Get, Query } from '@nestjs/common';
import { TagsService } from './tags.service';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get("tag")
  findOne(@Query('name') tag: string) {
    return this.tagsService.getByName(tag);
  }

  @Get()
  findAll() {
    return this.tagsService.findAll();
  }
}
