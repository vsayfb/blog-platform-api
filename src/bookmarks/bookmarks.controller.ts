import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Post,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Account } from 'src/accounts/decorator/account.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { CanManageData } from 'src/lib/guards/CanManageData';
import { ICrudController } from 'src/lib/interfaces/ICrudController';
import { JwtPayload } from 'src/lib/jwt.payload';
import { BookmarksService } from './bookmarks.service';
import { PostBookmarks } from './dto/post-bookmarks.dto';
import { AccountBookmarks } from './dto/account-bookmarks.dto';
import { Bookmark } from './entities/bookmark.entity';
import { BookmarkMessages } from './enums/bookmark-messages';
import { BookmarkRoutes } from './enums/bookmark-routes';
import { SelectedBookmarkFields } from './types/selected-bookmark-fields';

@Controller('bookmarks')
@ApiTags('bookmarks')
export class BookmarksController implements ICrudController<Bookmark> {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @UseGuards(JwtAuthGuard)
  @Post(BookmarkRoutes.CREATE + ':postId')
  async create(
    @Param('postId', ParseUUIDPipe) postID: string,
    @Account() account: JwtPayload,
  ): Promise<{ data: SelectedBookmarkFields; message: string }> {
    return {
      data: await this.bookmarksService.create({
        postID,
        accountID: account.sub,
      }),
      message: BookmarkMessages.CREATED,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(BookmarkRoutes.FIND_MY_BOOKMARKS)
  async findMyBookmarks(
    @Account() me: JwtPayload,
  ): Promise<{ data: AccountBookmarks; message: string }> {
    return {
      data: await this.bookmarksService.getAccountBookmarks(me.sub),
      message: BookmarkMessages.ALL_FOUND,
    };
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @Get(BookmarkRoutes.FIND_ONE + ':id')
  async findBookmark(
    @Data() data: Bookmark,
  ): Promise<{ data: Bookmark; message: string }> {
    return {
      data,
      message: BookmarkMessages.FOUND,
    };
  }

  @Get(BookmarkRoutes.FIND_POST_BOOKMARKS + ':postId')
  async findPostBookmarks(
    @Param('postId', ParseUUIDPipe) postId: string,
  ): Promise<{ data: PostBookmarks; message: string }> {
    return {
      data: await this.bookmarksService.getPostBookmarks(postId),
      message: BookmarkMessages.POST_BOOKMARKS_FOUND,
    };
  }

  @Delete(BookmarkRoutes.REMOVE + ':id')
  @UseGuards(JwtAuthGuard, CanManageData)
  async remove(
    @Data() subject: Bookmark,
  ): Promise<{ id: string; message: string }> {
    return {
      id: await this.bookmarksService.delete(subject),
      message: BookmarkMessages.DELETED,
    };
  }

  findOne(_id: string): Promise<{ data: any; message: string }> {
    throw new Error('Method not implemented.');
  }

  findAll(): Promise<{ data: any[]; message: string }> {
    throw new Error('Method not implemented.');
  }

  update(_dto: any, _subject: Bookmark): Promise<{ data: any; message: string }> {
    throw new Error('Method not implemented.');
  }
}
