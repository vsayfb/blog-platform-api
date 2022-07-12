import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { Account } from 'src/accounts/decorator/account.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { CanManageData } from 'src/lib/guards/CanManageData';
import { ICrudController } from 'src/lib/interfaces/ICrudController';
import { JwtPayload } from 'src/lib/jwt.payload';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { Bookmark } from './entities/bookmark.entity';
import { BookmarkMessages } from './enums/bookmark-messages';

@Controller('bookmarks')
export class BookmarksController implements ICrudController<Bookmark> {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @UseGuards(JwtAuthGuard)
  async create(
    @Param() postID: string,
    @Account() account: JwtPayload,
  ): Promise<{ data: any; message: string }> {
    return {
      data: await this.bookmarksService.create({
        postID,
        accountID: account.sub,
      }),
      message: BookmarkMessages.CREATED,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<{ data: any; message: string }> {
    return {
      data: await this.bookmarksService.getOneByID(id),
      message: BookmarkMessages.FOUND,
    };
  }

  @Get('post/:postId')
  async findPostBookmarks(
    @Param('postId') postId: string,
  ): Promise<{ data: any; message: string }> {
    return {
      data: await this.bookmarksService.getPostBookmarks(postId),
      message: BookmarkMessages.POST_BOOKMARKS_FOUND,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, CanManageData)
  async remove(
    @Data() subject: Bookmark,
  ): Promise<{ id: string; message: string }> {
    return {
      id: await this.bookmarksService.delete(subject),
      message: BookmarkMessages.DELETED,
    };
  }

  findAll(): Promise<{ data: any[]; message: string }> {
    throw new Error('Method not implemented.');
  }

  update(dto: any, subject: Bookmark): Promise<{ data: any; message: string }> {
    throw new Error('Method not implemented.');
  }
}
