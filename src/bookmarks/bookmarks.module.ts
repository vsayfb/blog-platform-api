import { Module } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookmark } from './entities/bookmark.entity';
import { MANAGE_DATA_SERVICE } from 'src/lib/constants';

@Module({
  imports: [TypeOrmModule.forFeature([Bookmark])],
  controllers: [BookmarksController],
  providers: [
    BookmarksService,
    { provide: MANAGE_DATA_SERVICE, useClass: BookmarksService },
  ],
})
export class BookmarksModule {}
