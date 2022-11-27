import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Post,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Account } from 'src/accounts/decorator/account.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { CanManageData } from 'src/lib/guards/CanManageData';
import { JwtPayload } from 'src/lib/jwt.payload';
import { BookmarksService } from './bookmarks.service';
import { PostBookmarks } from './dto/post-bookmarks.dto';
import { AccountBookmarks } from './dto/account-bookmarks.dto';
import { Bookmark } from './entities/bookmark.entity';
import { BookmarkMessages } from './enums/bookmark-messages';
import { BookmarkRoutes } from './enums/bookmark-routes';
import { SelectedBookmarkFields } from './types/selected-bookmark-fields';
import { BOOKMARKS_ROUTE } from 'src/lib/constants';
import { ICreateController } from 'src/lib/interfaces/create-controller.interface';
import { IDeleteController } from 'src/lib/interfaces/delete-controller.interface';

@Controller(BOOKMARKS_ROUTE)
@ApiTags(BOOKMARKS_ROUTE)
export class BookmarksController
  implements ICreateController, IDeleteController
{
  constructor(private readonly bookmarksService: BookmarksService) {}

  @UseGuards(JwtAuthGuard)
  @Post(BookmarkRoutes.CREATE + ':postId')
  async create(
    @Param('postId') postID: string,
    @Account() client: JwtPayload,
  ): Promise<{ data: SelectedBookmarkFields; message: string }> {
    return {
      data: await this.bookmarksService.create({
        postID,
        accountID: client.sub,
      }),
      message: BookmarkMessages.CREATED,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(BookmarkRoutes.FIND_CLIENT_BOOKMARKS)
  async findClientBookmarks(
    @Account() client: JwtPayload,
  ): Promise<{ data: AccountBookmarks; message: string }> {
    return {
      data: await this.bookmarksService.getAccountBookmarks(client.sub),
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

  @Delete(BookmarkRoutes.DELETE + ':id')
  @UseGuards(JwtAuthGuard, CanManageData)
  async delete(
    @Data() subject: Bookmark,
  ): Promise<{ id: string; message: string }> {
    return {
      id: await this.bookmarksService.delete(subject),
      message: BookmarkMessages.DELETED,
    };
  }

  @Delete(BookmarkRoutes.DELETE + 'post/:id')
  @UseGuards(JwtAuthGuard)
  async deleteByPost(
    @Account() client: JwtPayload,
    @Param('id') postID: string,
  ): Promise<{ id: string; message: string }> {
    const bookmark = await this.bookmarksService.getByPostAndAccount(
      postID,
      client.sub,
    );

    if (!bookmark) throw new BadRequestException(BookmarkMessages.NOT_FOUND);

    return {
      id: await this.bookmarksService.delete(bookmark),
      message: BookmarkMessages.DELETED,
    };
  }
}
