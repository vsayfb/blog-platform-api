import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Account } from 'src/accounts/decorator/account.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { CanManageData } from 'src/lib/guards/CanManageData';
import { JwtPayload } from 'src/lib/jwt.payload';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { CommentRoutes } from './enums/comment-routes';

@Controller('comments')
@ApiTags('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(CommentRoutes.CREATE + ':id')
  async create(
    @Account() account: JwtPayload,
    @Param('id') postID: string,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<{ data: Comment; message: string }> {
    return await this.commentsService.create({
      authorID: account.sub,
      postID,
      createCommentDto,
    });
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @Delete(CommentRoutes.DELETE + ':id')
  async delete(
    @Data() comment: Comment,
  ): Promise<{ id: string; message: string }> {
    return await this.commentsService.delete(comment);
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @Patch(CommentRoutes.PATCH + ':id')
  async update(
    @Data() comment: Comment,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<{ data: Comment; message: string }> {
    return await this.commentsService.update(comment, updateCommentDto);
  }
}
