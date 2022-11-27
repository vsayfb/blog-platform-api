import { Module } from '@nestjs/common';
import { CommentsModule } from 'src/comments/comments.module';
import { PostsModule } from 'src/posts/posts.module';
import { CommentExpressionsController } from './controllers/comment-expressions.controller';
import { PostExpressionsController } from './controllers/post-expressions.controller';

@Module({
  imports: [PostsModule, CommentsModule],
  controllers: [PostExpressionsController, CommentExpressionsController],
})
export class ExpressionsModule {}
