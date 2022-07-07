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
  UploadedFile,
  Query,
  Put,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post as PostEntity } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Account } from 'src/accounts/decorator/account.decorator';
import { JwtPayload } from 'src/lib/jwt.payload';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsImageFilePipe } from 'src/uploads/pipes/IsImageFile';
import { TagNamePipe } from 'src/tags/pipes/TagNamePipe';
import { ApiTags } from '@nestjs/swagger';
import { CanManageData } from 'src/lib/guards/CanManageData';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { PostRoutes } from './enums/post-routes';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('posts')
@ApiTags('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('titleImage'))
  @Post(PostRoutes.CREATE)
  async create(
    @Account() account: JwtPayload,
    @Body(TagNamePipe) createPostDto: CreatePostDto,
    @Query('published') published?: boolean,
  ): Promise<{ data: PostEntity; message: string }> {
    const data = { authorID: account.sub, dto: createPostDto };

    if (published === undefined) {
      return await this.postsService.create(data);
    }
    return await this.postsService.create({ ...data, published });
  }

  @Get(PostRoutes.FIND_ALL)
  async findAll(): Promise<{ data: PostEntity[]; message: string }> {
    return await this.postsService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(PostRoutes.GET_MY_POSTS)
  async getMyPosts(
    @Account() account: JwtPayload,
  ): Promise<{ data: PostEntity[]; message: string }> {
    return await this.postsService.getMyPosts(account.sub);
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @Get(PostRoutes.FIND_BY_ID)
  async findByID(
    @Query('id') id: string,
  ): Promise<{ data: PostEntity; message: string }> {
    return await this.postsService.getOneByID(id);
  }

  @Get(PostRoutes.FIND_ONE_BY_URL + ':url')
  async findOneByUrl(@Param('url') url: string) {
    return await this.postsService.getOne(url);
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @Patch(PostRoutes.UPDATE + ':id')
  update(
    @Body(TagNamePipe) updatePostDto: UpdatePostDto,
    @Data() post: PostEntity,
  ) {
    return this.postsService.update(post, updatePostDto);
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @Delete(PostRoutes.REMOVE + ':id')
  remove(@Data() post: PostEntity) {
    return this.postsService.delete(post);
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @Put(PostRoutes.CHANGE_POST_STATUS + ':id')
  async changePostStatus(@Data() post: PostEntity) {
    return await this.postsService.changePostStatus(post);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('titleImage'))
  @Post(PostRoutes.UPLOAD_TITLE_IMAGE)
  async uploadTitleImage(
    @UploadedFile(IsImageFilePipe) titleImage: Express.Multer.File,
  ): Promise<{ data: string; message: string }> {
    return await this.postsService.saveTitleImage(titleImage);
  }
}
