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
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Account } from 'src/accounts/decorator/account.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { COMMENTS_ROUTE } from 'src/lib/constants';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { CanManageData } from 'src/lib/guards/CanManageData';
import { ICreateController } from 'src/lib/interfaces/create-controller.interface';
import { IDeleteController } from 'src/lib/interfaces/delete-controller.interface';
import { IUpdateController } from 'src/lib/interfaces/update-controller.interface';
import { JwtPayload } from 'src/lib/jwt.payload';
import { CommentsService } from './comments.service';
import { CommentViewDto } from './dto/comment-view.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { RepliesViewDto } from './dto/replies-view.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { CommentMessages } from './enums/comment-messages';
import { CommentRoutes } from './enums/comment-routes';
import { CommentedNotificationInterceptor } from './interceptors/commented-notification.interceptor';
import { SelectedCommentFields } from './types/selected-comment-fields';

@Controller(COMMENTS_ROUTE)
@ApiTags(COMMENTS_ROUTE)
export class CommentsController
  implements ICreateController, IUpdateController, IDeleteController
{
  constructor(private readonly commentsService: CommentsService) {}

  @Get(CommentRoutes.POST_COMMENTS + ':id')
  async findPostComments(
    @Param('id') id: string,
  ): Promise<{ data: CommentViewDto[]; message: CommentMessages }> {
    return {
      data: await this.commentsService.getPostComments(id),
      message: CommentMessages.ALL_FOUND,
    };
  }

  @Get(CommentRoutes.COMMENT_REPLIES + ':id')
  async findCommentReplies(
    @Param('id') id: string,
  ): Promise<{ data: RepliesViewDto; message: CommentMessages }> {
    return {
      data: await this.commentsService.getCommentReplies(id),
      message: CommentMessages.REPLIES_FOUND,
    };
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(CommentedNotificationInterceptor)
  @Post(CommentRoutes.CREATE + ':postID')
  async create(
    @Account() account: JwtPayload,
    @Param('postID', ParseUUIDPipe) postID: string,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<{ data: SelectedCommentFields; message: string }> {
    return {
      data: await this.commentsService.create({
        authorID: account.sub,
        postID,
        createCommentDto,
      }),
      message: CommentMessages.CREATED,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(CommentRoutes.REPLY_TO_COMMENT + ':commentID')
  async replyToComment(
    @Account() account: JwtPayload,
    @Param('commentID', ParseUUIDPipe) toID: string,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<{ data: SelectedCommentFields; message: string }> {
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
