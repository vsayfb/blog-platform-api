import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { CanManageData } from 'src/lib/guards/CanManageData';
import { JwtPayload } from 'src/lib/jwt.payload';
import { BookmarksService } from './bookmarks.service';
import { AccountBookmarkDto } from './response-dto/account-bookmark.dto';
import { Bookmark } from './entities/bookmark.entity';
import { BookmarkMessages } from './enums/bookmark-messages';
import { BookmarkRoutes } from './enums/bookmark-routes';
import { BOOKMARKS_ROUTE } from 'src/lib/constants';
import { ICreateController } from 'src/lib/interfaces/create-controller.interface';
import { IDeleteController } from 'src/lib/interfaces/delete-controller.interface';
import { Client } from 'src/auth/decorator/client.decorator';
import { NewBookmarkDto } from './response-dto/new-bookmark.dto';

@Controller(BOOKMARKS_ROUTE)
@ApiTags(BOOKMARKS_ROUTE)
export class BookmarksController
  implements ICreateController, IDeleteController
{
  constructor(private readonly bookmarksService: BookmarksService) {}

  @UseGuards(JwtAuthGuard)
  @Post(BookmarkRoutes.CREATE + ':post_id')
  async create(
    @Param('post_id') postID: string,
    @Client() client: JwtPayload,
  ): Promise<{ data: NewBookmarkDto; message: string }> {
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
    @Client() client: JwtPayload,
  ): Promise<{ data: AccountBookmarkDto[]; message: string }> {
    return {
      data: await this.bookmarksService.getAccountBookmarks(client.sub),
      message: BookmarkMessages.ALL_FOUND,
    };
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @Get(BookmarkRoutes.FIND_ONE + ':id')
  async findBookmark(
    @Data() data: Bookmark,
  ): Promise<{ data: AccountBookmarkDto; message: string }> {
    delete data.account;

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
    @Client() client: JwtPayload,
    @Param('id') postID: string,
  ): Promise<{ id: string; message: string }> {
    const bookmark = await this.bookmarksService.getByPostAndAccount(
      postID,
      client.sub,
    );

    if (!bookmark) throw new BadRequestException(BookmarkMessages.NOT_FOUND);

    return {
      id: await this.bookmarksService.delete(bookmark as Bookmark),
      message: BookmarkMessages.DELETED,
    };
  }
}
