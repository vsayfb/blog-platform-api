import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { UploadsModule } from 'src/uploads/uploads.module';
import { TagsModule } from 'src/tags/tags.module';
import { MANAGE_DATA_SERVICE } from 'src/lib/constants';
import { CacheManagerModule } from 'src/cache/cache-manager.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    UploadsModule,
    TagsModule,
    CacheManagerModule,
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    { provide: MANAGE_DATA_SERVICE, useClass: PostsService },
  ],
  exports: [PostsService],
})
export class PostsModule {}
