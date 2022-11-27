import { Module } from '@nestjs/common';
import { CommentsService } from './services/comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { PostsModule } from 'src/posts/posts.module';
import { MANAGE_DATA_SERVICE } from 'src/lib/constants';
import { CommentExpression } from './entities/comment-expression.entity';
import { CommentExpressionsService } from './services/comment-expressions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, CommentExpression]),
    PostsModule,
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    CommentExpressionsService,
    { provide: MANAGE_DATA_SERVICE, useClass: CommentsService },
  ],
  exports: [CommentsService, CommentExpressionsService],
})
export class CommentsModule {}
