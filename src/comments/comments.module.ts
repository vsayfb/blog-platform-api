import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { PostsModule } from 'src/posts/posts.module';
import { MANAGE_DATA_SERVICE } from 'src/lib/constants';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), PostsModule],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    { provide: MANAGE_DATA_SERVICE, useClass: CommentsService },
  ],
  exports: [CommentsService],
})
export class CommentsModule {}
