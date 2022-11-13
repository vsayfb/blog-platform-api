import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  OnModuleInit,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Request } from 'express';
import { map, Observable } from 'rxjs';
import { FollowService } from 'src/follow/follow.service';
import { JwtPayload } from 'src/lib/jwt.payload';
import { AccountProfileDto } from '../dto/account-profile.dto';
import { AccountMessages } from '../enums/account-messages';

@Injectable()
export class CheckClientIsFollowing implements NestInterceptor, OnModuleInit {
  private followService: FollowService;

  constructor(private readonly moduleRef: ModuleRef) {}

  async onModuleInit() {

    // use global scope because for prevent circulary dependency between follow -> account modules
    this.followService = this.moduleRef.get(FollowService, { strict: false });
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<
    Observable<Promise<{ data: AccountProfileDto; message: AccountMessages }>>
  > {
    const request: Request & { user: JwtPayload | null } = context
      .switchToHttp()
      .getRequest();

    const clientLogin = request.user;

    return next.handle().pipe(
      map(async (profile: { data: AccountProfileDto }) => {
        //

        let clientFollowsProfile = false;

        if (clientLogin) {
          clientFollowsProfile = await this.followService.checkUserByFollowing(
            profile.data.username,
            clientLogin.username,
          );
        }

        return {
          data: { ...profile.data, following_by: clientFollowsProfile },
          message: AccountMessages.FOUND,
        };
      }),
    );
  }
}
