import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtPayload } from 'src/lib/jwt.payload';
import { FollowService } from './follow.service';
import { FollowMessages } from './enums/follow-messages';
import { FollowRoutes } from './enums/follow-routes';
import { Follow } from './entities/follow.entity';
import { UserFollowersDto } from './response-dto/user-followers.dto';
import { UserFollowedDto } from './response-dto/user-followed.dto';
import { FollowedNotificationInterceptor } from './interceptors/followed-notification.interceptor';
import { ApiTags } from '@nestjs/swagger';
import { FOLLOW_ROUTE } from 'src/lib/constants';
import { ICreateController } from 'src/lib/interfaces/create-controller.interface';
import { Client } from 'src/auth/decorator/client.decorator';
import { UsernameDto } from 'src/accounts/request-dto/username.dto';

@Controller(FOLLOW_ROUTE)
@ApiTags(FOLLOW_ROUTE)
export class FollowController implements ICreateController {
  constructor(private readonly followService: FollowService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FollowedNotificationInterceptor)
  @Post(FollowRoutes.FOLLOW + ':username')
  async create(
    @Client() client: JwtPayload,
    @Param() { username }: UsernameDto,
  ): Promise<{ data: Follow; message: FollowMessages }> {
    return {
      data: await this.followService.followAccount(client.sub, username),
      message: FollowMessages.FOLLOWED,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(FollowRoutes.UNFOLLOW + ':username')
  async unfollow(
    @Client() client: JwtPayload,
    @Param() { username }: UsernameDto,
  ): Promise<{ data: string; message: FollowMessages }> {
    return {
      data: await this.followService.unfollowAccount(client.username, username),
      message: FollowMessages.UNFOLLOWED,
    };
  }

  @Get(FollowRoutes.USER_FOLLOWERS + ':username')
  async findUserFollowers(@Param() { username }: UsernameDto): Promise<{
    data: UserFollowersDto;
    message: FollowMessages;
  }> {
    return {
      data: await this.followService.getUserFollowers(username),
      message: FollowMessages.FOLLOWERS_FOUND,
    };
  }

  @Get(FollowRoutes.USER_FOLLOWED + ':username')
  async findUserFollowed(@Param() { username }: UsernameDto): Promise<{
    data: UserFollowedDto;
    message: FollowMessages;
  }> {
    return {
      data: await this.followService.getUserFollowed(username),
      message: FollowMessages.FOLLOWED_FOUND,
    };
  }
}
