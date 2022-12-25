import { Module } from '@nestjs/common';
import { PostsService } from './services/posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { UploadsModule } from 'src/uploads/uploads.module';
import { TagsModule } from 'src/tags/tags.module';
import { MANAGE_DATA_SERVICE } from 'src/lib/constants';
import { CacheManagerModule } from 'src/cache/cache-manager.module';
import { PostExpression } from './entities/post-expression.entity';
import { PostExpressionsService } from './services/post-expressions.service';
import { CheckPostExists } from './validators/check-post-exists';
import { AccountsNotificationsModule } from 'src/account_notifications/account-notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostExpression]),
    UploadsModule,
    TagsModule,
    CacheManagerModule,
    AccountsNotificationsModule,
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostExpressionsService,
    { provide: MANAGE_DATA_SERVICE, useClass: PostsService },
    CheckPostExists,
  ],
  exports: [PostsService, PostExpressionsService],
})
export class PostsModule {}
