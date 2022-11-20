import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { map, Observable, of } from 'rxjs';
import { BookmarksService } from 'src/bookmarks/bookmarks.service';
import { JwtPayload } from 'src/lib/jwt.payload';
import { PublicPostDto } from '../dto/public-post.dto';
import { PostMessages } from '../enums/post-messages';

@Injectable()
export class CheckClientBookmark implements NestInterceptor {
  private bookmarkService: BookmarksService;

  constructor(private moduleRef: ModuleRef) {
    this.bookmarkService = this.moduleRef.get(BookmarksService, {
      strict: false,
    });
  }

  intercept(context: ExecutionContext, next: CallHandler<any>) {
    const request: Request & { user: JwtPayload | null } = context
      .switchToHttp()
      .getRequest();

    const client = request.user;

    return next.handle().pipe(
      map(async (result: { data: PublicPostDto }) => {
        let bookmarked_by = false;

        if (client) {
          bookmarked_by =
            await this.bookmarkService.checkAccountHaveBookmarkOnPost(
              client.sub,
              result.data.id,
            );
        }

        return {
          data: { ...result.data, bookmarked_by },
          message: PostMessages.FOUND,
        };
      }),
    );
  }
}
