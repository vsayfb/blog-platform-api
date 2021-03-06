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
import { Account } from 'src/accounts/decorator/account.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { CanManageData } from 'src/lib/guards/CanManageData';
import { ICrudController } from 'src/lib/interfaces/ICrudController';
import { JwtPayload } from 'src/lib/jwt.payload';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PostCommentsDto } from './dto/post-comments.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { CommentMessages } from './enums/comment-messages';
import { CommentRoutes } from './enums/comment-routes';
import { CommentsNotificationInterceptor } from './interceptors/comments-notification.interceptor';
import { SelectedCommentFields } from './types/selected-comment-fields';

@Controller('comments')
@ApiTags('comments')
export class CommentsController implements ICrudController<Comment> {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(CommentRoutes.POST_COMMENTS + ':id')
  async findPostComments(
    @Param('id') id: string,
  ): Promise<{ data: PostCommentsDto; message: CommentMessages }> {
    return {
      data: await this.commentsService.getPostComments(id),
      message: CommentMessages.ALL_FOUND,
    };
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(CommentsNotificationInterceptor)
  @Post(CommentRoutes.CREATE + ':postID')
  async create(
    @Account() account: JwtPayload,
    @Param('postID') postID: string,
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

  @UseGuards(JwtAuthGuard, CanManageData)
  @Delete(CommentRoutes.DELETE + ':id')
  async remove(
    @Data() comment: Comment,
  ): Promise<{ id: string; message: string }> {
    return {
      id: await this.commentsService.delete(comment),
      message: CommentMessages.DELETED,
    };
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @Patch(CommentRoutes.PATCH + ':id')
  async update(
    @Data() comment: Comment,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<{ data: SelectedCommentFields; message: string }> {
    return {
      data: await this.commentsService.update(comment, updateCommentDto),
      message: CommentMessages.UPDATED,
    };
  }

  findAll(): Promise<{ data: any[]; message: string }> {
    throw new Error('Method not implemented.');
  }
  findOne(id: string): Promise<{ data: any; message: string }> {
    throw new Error('Method not implemented.');
  }
}
