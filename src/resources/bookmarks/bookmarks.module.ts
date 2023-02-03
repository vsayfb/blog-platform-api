import { Module } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookmark } from './entities/bookmark.entity';
import { MANAGE_DATA_SERVICE } from 'src/lib/constants';
import { CacheManagerModule } from 'src/cache/cache-manager.module';

@Module({
  imports: [TypeOrmModule.forFeature([Bookmark]), CacheManagerModule],
  controllers: [BookmarksController],
  providers: [
    BookmarksService,
    { provide: MANAGE_DATA_SERVICE, useClass: BookmarksService },
  ],
  exports: [BookmarksService],
})
export class BookmarksModule {}
