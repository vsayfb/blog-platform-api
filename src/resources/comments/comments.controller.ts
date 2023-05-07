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
import { AccountCommentsDto } from './response-dto/account-comments.dto';
import { CreateCommentDto } from './request-dto/create-comment.dto';
import { RepliesDto } from './response-dto/replies.dto';
import { CreatedReplyDto } from './response-dto/created-reply.dto';
import { UpdateCommentDto } from './request-dto/update-comment.dto';
import { PostComment } from './entities/post-comment.entity';
import { CommentMessages } from './enums/comment-messages';
import { CommentRoutes } from './enums/comment-routes';
import { CommentedNotificationInterceptor } from './interceptors/commented-notification.interceptor';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { CheckClientActionsOnComment } from './interceptors/check-client-actions-on-comment';
import { CreatedCommentDto } from './response-dto/created-comment.dto';
import { RepliedNotificationInterceptor } from './interceptors/replied-notification.interceptor';
import { PostIDParam } from './request-dto/post-id-param';
import { Client } from 'src/auth/decorator/client.decorator';
import { PostCommentsDto } from './response-dto/post-comments.dto';
import { UpdatedCommentDto } from './response-dto/updated-comment.dto';

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
    data: PostCommentsDto;
    message: CommentMessages;
  }> {
    return {
      data: await this.commentsService.getPostComments(id),
      message: CommentMessages.ALL_FOUND,
    };
  }

  @UseGuards(OptionalJwtAuthGuard)
  @UseInterceptors(CheckClientActionsOnComment)
  @Get(CommentRoutes.COMMENT_REPLIES + ':id')
  async findCommentReplies(@Param('id') id: string): Promise<{
    data: RepliesDto;
    message: CommentMessages;
  }> {
    return {
      data: await this.commentsService.getCommentReplies(id),
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
  ): Promise<{ data: CreatedReplyDto; message: string }> {
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
    @Data() comment: PostComment,
  ): Promise<{ id: string; message: CommentMessages }> {
    return {
      id: await this.commentsService.delete(comment),
      message: CommentMessages.DELETED,
    };
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @Patch(CommentRoutes.UPDATE + ':id')
  async update(
    @Data() comment: PostComment,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<{ data: UpdatedCommentDto; message: string }> {
    return {
      data: await this.commentsService.update(comment, updateCommentDto),
      message: CommentMessages.UPDATED,
    };
  }
}
