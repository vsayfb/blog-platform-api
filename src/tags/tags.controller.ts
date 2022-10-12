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
import { CanManageData } from 'src/lib/guards/CanManageData';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { Tag } from './entities/tag.entity';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagRoutes } from './enums/tag-routes';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TagMessages } from './enums/tag-messages';
import { TagsDto } from './dto/tags.dto';
import { SelectedTagFields } from './types/selected-tag-fields';
import { DontAllowUserCreate } from 'src/lib/guards/DontAllowUserCreate';
import { TAGS_ROUTE } from 'src/lib/constants';
import { ICreateController } from 'src/lib/interfaces/create-controller.interface';
import { IDeleteController } from 'src/lib/interfaces/delete-controller.interface';
import { IFindController } from 'src/lib/interfaces/find-controller.interface';
import { IUpdateController } from 'src/lib/interfaces/update-controller.interface';

@Controller(TAGS_ROUTE)
@ApiTags(TAGS_ROUTE)
export class TagsController
  implements
    ICreateController,
    IFindController,
    IUpdateController,
    IDeleteController
{
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  async findAll(): Promise<{ data: TagsDto; message: string }> {
    return {
      data: await this.tagsService.getAll(),
      message: TagMessages.ALL_FOUND,
    };
  }

  @Get(TagRoutes.FIND_ONE)
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Query('name') tag: string,
  ): Promise<{ data: SelectedTagFields; message: string }> {
    return {
      data: await this.tagsService.getOne(tag),
      message: TagMessages.FOUND,
    };
  }

  @Post(TagRoutes.CREATE)
  @UseGuards(JwtAuthGuard, DontAllowUserCreate)
  async create(
    @Body() { name }: CreateTagDto,
  ): Promise<{ data: SelectedTagFields; message: string }> {
    return {
      data: await this.tagsService.create(name),
      message: TagMessages.CREATED,
    };
  }

  @Patch(TagRoutes.UPDATE + ':id')
  @UseGuards(JwtAuthGuard, CanManageData)
  async update(
    @Body() { name }: UpdateTagDto,
    @Data() tag: Tag,
  ): Promise<{ data: SelectedTagFields; message: string }> {
    return {
      data: await this.tagsService.update(tag, name),
      message: TagMessages.UPDATED,
    };
  }

  @Delete(TagRoutes.DELETE + ':id')
  @UseGuards(JwtAuthGuard, CanManageData)
  async delete(@Data() tag: Tag): Promise<{ id: string; message: string }> {
    return {
      id: await this.tagsService.delete(tag),
      message: TagMessages.DELETED,
    };
  }
}
