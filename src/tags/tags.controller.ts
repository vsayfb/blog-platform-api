import { AuthGuard } from '@nestjs/passport';
import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagsService } from './tags.service';
import { NotAllowUserCreate } from 'src/lib/guards/NotAllowUserCreate';
import { CanManageData } from 'src/lib/guards/CanManageData';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { Tag } from './entities/tag.entity';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagRoutes } from './enums/tag-routes';

@Controller('tags')
@ApiTags('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get(TagRoutes.FIND_ONE)
  @UseGuards(AuthGuard('jwt'))
  async findOne(
    @Query('name') tag: string,
  ): Promise<{ data: Tag; message: string }> {
    return await this.tagsService.getOne(tag);
  }

  @Post(TagRoutes.CREATE)
  @UseGuards(AuthGuard('jwt'), NotAllowUserCreate)
  async create(
    @Body() { name }: CreateTagDto,
  ): Promise<{ data: Tag; message: string }> {
    return await this.tagsService.create(name);
  }

  @Get()
  async findAll(): Promise<{ data: Tag[]; message: string }> {
    return await this.tagsService.getAll();
  }

  @Patch(TagRoutes.UPDATE + ':id')
  @UseGuards(AuthGuard('jwt'), CanManageData)
  async update(
    @Body() { name }: UpdateTagDto,
    @Data() tag: Tag,
  ): Promise<{ data: Tag; message: string }> {
    return await this.tagsService.update(tag, name);
  }

  @Delete(TagRoutes.DELETE + ':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Data() tag: Tag): Promise<{ id: string; message: string }> {
    return await this.tagsService.delete(tag);
  }
}
