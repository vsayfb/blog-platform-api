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
import { PostMessages } from './enums/post-messages';
import { PublicPostDto } from './dto/public-post.dto';
import { PublicPostsDto } from './dto/public-posts.dto';
import { PostsDto } from './dto/posts.dto';
import { PostDto } from './dto/post.dto';
import { CreatedPostDto } from './dto/created-post.dto';
import { CacheJsonInterceptor } from 'src/cache/cache-json.interceptor';
import { POSTS_ROUTE } from 'src/lib/constants';
import { ICreateController } from 'src/lib/interfaces/create-controller.interface';
import { IFindController } from 'src/lib/interfaces/find-controller.interface';
import { IUpdateController } from 'src/lib/interfaces/update-controller.interface';
import { IDeleteController } from 'src/lib/interfaces/delete-controller.interface';

@Controller(POSTS_ROUTE)
@ApiTags(POSTS_ROUTE)
export class PostsController
  implements
    ICreateController,
    IFindController,
    IUpdateController,
    IDeleteController
{
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('titleImage'))
  @Post(PostRoutes.CREATE)
  async create(
    @Body(TagNamePipe) createPostDto: CreatePostDto,
    @UploadedFile(IsImageFilePipe) titleImage: Express.Multer.File | null,
    @Account() account: JwtPayload,
    @Query('published') published?: boolean,
  ): Promise<{ data: CreatedPostDto; message: PostMessages }> {
    let data: CreatedPostDto;

    const saveData = { authorID: account.sub, dto: createPostDto, titleImage };

    if (published === undefined) {
      data = await this.postsService.create(saveData);
    }
    data = await this.postsService.create({ ...saveData, published });

    return { data, message: PostMessages.CREATED };
  }

  @Get(PostRoutes.FIND_ALL)
  async findAll(): Promise<{
    data: PublicPostsDto;
    message: string;
  }> {
    return {
      data: await this.postsService.getAll(),
      message: PostMessages.ALL_FOUND,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(PostRoutes.GET_MY_POSTS)
  async getMyPosts(
    @Account() account: JwtPayload,
  ): Promise<{ data: PostsDto; message: PostMessages }> {
    return {
      data: await this.postsService.getMyPosts(account.sub),
      message: PostMessages.ALL_FOUND,
    };
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @Get(PostRoutes.FIND_BY_ID + ':id')
  async findByID(
    @Data() data: PostDto,
  ): Promise<{ data: PostDto; message: PostMessages }> {
    return {
      data,
      message: PostMessages.FOUND,
    };
  }

  @Get(PostRoutes.FIND_ONE_BY_URL + ':url')
  @UseInterceptors(CacheJsonInterceptor)
  async findOne(
    @Param('url') url: string,
  ): Promise<{ data: PublicPostDto; message: PostMessages }> {
    return {
      data: await this.postsService.getOne(url),
      message: PostMessages.FOUND,
    };
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @Patch(PostRoutes.UPDATE + ':id')
  async update(
    @Data() post: PostDto,
    @Body(TagNamePipe) updatePostDto: UpdatePostDto,
  ) {
    return {
      data: await this.postsService.update(post, updatePostDto),
      message: PostMessages.UPDATED,
    };
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @Delete(PostRoutes.DELETE + ':id')
  async delete(
    @Data() post: PostDto,
  ): Promise<{ id: string; message: PostMessages }> {
    return {
      id: await this.postsService.delete(post),
      message: PostMessages.DELETED,
    };
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @Put(PostRoutes.CHANGE_POST_STATUS + ':id')
  async changePostStatus(@Data() post: PostDto): Promise<{
    data: { id: string; published: boolean };
    message: PostMessages;
  }> {
    return {
      data: await this.postsService.changePostStatus(post),
      message: PostMessages.UPDATED,
    };
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @UseInterceptors(FileInterceptor('titleImage'))
  @Put(PostRoutes.UPDATE_TITLE_IMAGE + ':id')
  async updateTitleImage(
    @Data() post: PostDto,
    @UploadedFile(IsImageFilePipe) titleImage: Express.Multer.File | null,
  ): Promise<{ data: string; message: PostMessages }> {
    return {
      data: await this.postsService.updateTitleImage(post, titleImage),
      message: PostMessages.TITLE_IMAGE_UPDATED,
    };
  }
}
