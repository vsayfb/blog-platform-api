import { Module } from '@nestjs/common';
import { CommentsService } from './services/comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostComment } from './entities/post-comment.entity';
import { PostsModule } from 'src/resources/posts/posts.module';
import { MANAGE_DATA_SERVICE } from 'src/lib/constants';
import { CommentExpression } from './entities/comment-expression.entity';
import { CommentExpressionsService } from './services/comment-expressions.service';
import { AccountsNotificationsModule } from 'src/resources/account_notifications/account-notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostComment, CommentExpression]),
    PostsModule,
    AccountsNotificationsModule,
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
