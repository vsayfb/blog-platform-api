import { AuthGuard } from '@nestjs/passport';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagsService } from './tags.service';
import { NotAllowUserCreate } from 'src/lib/guards/NotAllowUserCreate';
import { PermissionGuard } from 'src/lib/guards/PermissionGuard';

@Controller('tags')
@ApiTags('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get('tag')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Query('name') tag: string) {
    return await this.tagsService.getOne(tag);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), NotAllowUserCreate)
  async create(@Body() { name }: CreateTagDto) {
    return await this.tagsService.create(name);
  }

  @Get()
  async findAll() {
    return await this.tagsService.findAll();
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  async update(@Param('id') id: string, @Body() { name }: CreateTagDto) {
    return await this.tagsService.update(id, name);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: string) {
    return await this.tagsService.delete(id);
  }
}
