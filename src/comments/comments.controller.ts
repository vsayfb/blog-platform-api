import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { COMMENTS_ROUTE } from 'src/lib/constants';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { CanManageData } from 'src/lib/guards/CanManageData';
import { ICreateController } from 'src/lib/interfaces/create-controller.interface';
import { IDeleteController } from 'src/lib/interfaces/delete-controller.interface';
import { IUpdateController } from 'src/lib/interfaces/update-controller.interface';
import { JwtPayload } from 'src/lib/jwt.payload';
import { CommentsService } from './services/comments.service';
import { AccountCommentsDto } from './dto/account-comments.dto';
import { CommentViewDto } from './dto/comment-view.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { RepliesViewDto } from './dto/replies-view.dto';
import { ReplyViewDto } from './dto/reply-view.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { CommentMessages } from './enums/comment-messages';
import { CommentRoutes } from './enums/comment-routes';
import { CommentedNotificationInterceptor } from './interceptors/commented-notification.interceptor';
import { SelectedCommentFields } from './types/selected-comment-fields';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { CheckClientActionsOnComment } from './interceptors/check-client-actions-on-comment';
import { CreatedCommentDto } from './dto/created-comment.dto';
import { RepliedNotificationInterceptor } from './interceptors/replied-notification.interceptor';
import { PostIDParam } from './dto/post-id-param';
import { Client } from 'src/auth/decorator/client.decorator';

@Controller(COMMENTS_ROUTE)
@ApiTags(COMMENTS_ROUTE)
export class CommentsController
  implements ICreateController, IUpdateController, IDeleteController
{
  constructor(private readonly commentsService: CommentsService) {}

  @Get(CommentRoutes.ACCOUNT_COMMENTS + ':id')
  async findAccountComments(
    @Param('id') id: string,
  ): Promise<{ data: AccountCommentsDto; message: CommentMessages }> {
    return {
      data: await this.commentsService.getAccountComments(id),
      message: CommentMessages.ALL_FOUND,
    };
  }

  @UseGuards(OptionalJwtAuthGuard)
  @UseInterceptors(CheckClientActionsOnComment)
  @Get(CommentRoutes.POST_COMMENTS + ':id')
  async findPostComments(@Param('id') id: string): Promise<{
    data: CommentViewDto[] & { liked_by: boolean; disliked_by: boolean };
    message: CommentMessages;
  }> {
    const data = await this.commentsService.getPostComments(id);

    return {
      data: data as CommentViewDto[] & {
        liked_by: boolean;
        disliked_by: boolean;
      },
      message: CommentMessages.ALL_FOUND,
    };
  }

  @UseGuards(OptionalJwtAuthGuard)
  @UseInterceptors(CheckClientActionsOnComment)
  @Get(CommentRoutes.COMMENT_REPLIES + ':id')
  async findCommentReplies(@Param('id') id: string): Promise<{
    data: RepliesViewDto & { liked_by: boolean; disliked_by: boolean };
    message: CommentMessages;
  }> {
    const data = await this.commentsService.getCommentReplies(id);

    return {
      data: data as RepliesViewDto & {
        liked_by: boolean;
        disliked_by: boolean;
      },
      message: CommentMessages.REPLIES_FOUND,
    };
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(CommentedNotificationInterceptor)
  @Post(CommentRoutes.CREATE + ':post_id')
  async create(
    @Client() client: JwtPayload,
    @Param() { post_id }: PostIDParam,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<{ data: CreatedCommentDto; message: string }> {
    return {
      data: await this.commentsService.create({
        authorID: client.sub,
        postID: post_id,
        createCommentDto,
      }),
      message: CommentMessages.CREATED,
    };
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(RepliedNotificationInterceptor)
  @Post(CommentRoutes.REPLY_TO_COMMENT + ':comment_id')
  async replyToComment(
    @Client() account: JwtPayload,
    @Param('comment_id') toID: string,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<{ data: ReplyViewDto; message: string }> {
    return {
      data: await this.commentsService.replyToComment({
        authorID: account.sub,
        toID,
        dto: createCommentDto,
      }),
      message: CommentMessages.CREATED,
    };
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @Delete(CommentRoutes.DELETE + ':id')
  async delete(
    @Data() comment: Comment,
  ): Promise<{ id: string; message: CommentMessages }> {
    return {
      id: await this.commentsService.delete(comment),
      message: CommentMessages.DELETED,
    };
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @Patch(CommentRoutes.UPDATE + ':id')
  async update(
    @Data() comment: Comment,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<{ data: SelectedCommentFields; message: string }> {
    return {
      data: await this.commentsService.update(comment, updateCommentDto),
      message: CommentMessages.UPDATED,
    };
  }
}
