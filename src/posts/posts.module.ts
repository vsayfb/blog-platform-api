import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { UploadsModule } from 'src/uploads/uploads.module';
import { TagsModule } from 'src/tags/tags.module';
import { MANAGE_DATA_SERVICE } from 'src/lib/constants';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), UploadsModule, TagsModule],
  controllers: [PostsController],
  providers: [
    PostsService,
    { provide: MANAGE_DATA_SERVICE, useClass: PostsService },
  ],
  exports: [PostsService],
})
export class PostsModule {}
