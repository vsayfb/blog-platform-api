import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { UploadsModule } from 'src/uploads/uploads.module';
import { TagsModule } from 'src/tags/tags.module';
import { MANAGE_DATA_SERVICE } from 'src/lib/constants';
import { IsPostFoundByIdParam } from 'src/global/middlewares/is-post-found';
import { PostRoutes } from './enums/post-routes';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), UploadsModule, TagsModule],
  controllers: [PostsController],
  providers: [
    PostsService,
    { provide: MANAGE_DATA_SERVICE, useClass: PostsService },
  ],
  exports: [PostsService],
})
export class PostsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IsPostFoundByIdParam).forRoutes(
      {
        path: 'posts' + PostRoutes.FIND_BY_ID + ':id',
        method: RequestMethod.GET,
      },
      {
        path: 'posts' + PostRoutes.UPDATE + ':id',
        method: RequestMethod.PATCH,
      },
      {
        path: 'posts' + PostRoutes.REMOVE + ':id',
        method: RequestMethod.DELETE,
      },
    );
  }
}
