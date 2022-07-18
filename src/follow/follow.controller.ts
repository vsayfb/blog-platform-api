import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Account } from 'src/accounts/decorator/account.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtPayload } from 'src/lib/jwt.payload';
import { FollowService } from './follow.service';
import { FollowMessages } from './enums/follow-messages';
import { FollowRoutes } from './enums/follow-routes';
import { SelectedAccountFields } from 'src/accounts/types/selected-account-fields';
import { Follow } from './entities/follow.entity';
import { UserFollowers } from './dto/user-followers.dto';
import { UserFollowed } from './dto/user-followed.dto';

@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @UseGuards(JwtAuthGuard)
  @Post(FollowRoutes.FOLLOW + ':username')
  async follow(
    @Account() account: JwtPayload,
    @Param('username') followedUsername: string,
  ): Promise<{ data: Follow; message: FollowMessages }> {
    return {
      data: await this.followService.followAccount(
        account.sub,
        followedUsername,
      ),
      message: FollowMessages.FOLLOWED,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(FollowRoutes.UNFOLLOW + ':username')
  async unfollow(
    @Account() account: JwtPayload,
    @Param('username') unfollowedUsername: string,
  ): Promise<{ data: string; message: FollowMessages }> {
    return {
      data: await this.followService.unfollowAccount(
        account.username,
        unfollowedUsername,
      ),
      message: FollowMessages.UNFOLLOWED,
    };
  }

  @Get(FollowRoutes.USER_FOLLOWERS + ':username')
  async findUserFollowers(@Param('username') username: string): Promise<{
    data: UserFollowers;
    message: FollowMessages;
  }> {
    return {
      data: await this.followService.getUserFollowers(username),
      message: FollowMessages.FOLLOWERS_FOUND,
    };
  }

  @Get(FollowRoutes.USER_FOLLOWED + ':username')
  async findUserFollowed(@Param('username') username: string): Promise<{
    data: UserFollowed;
    message: FollowMessages;
  }> {
    return {
      data: await this.followService.getUserFollowed(username),
      message: FollowMessages.FOLLOWED_FOUND,
    };
  }
}
