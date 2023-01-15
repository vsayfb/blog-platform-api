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
  CacheTTL,
  CacheKey,
} from '@nestjs/common';
import { PostsService } from './services/posts.service';
import { CreatePostDto } from './request-dto/create-post.dto';
import { UpdatePostDto } from './request-dto/update-post.dto';
import { JwtPayload } from 'src/lib/jwt.payload';
import { FileInterceptor } from '@nestjs/platform-express';
import { OptionalImageFile } from 'src/uploads/pipes/optional-image-file';
import { ApiTags } from '@nestjs/swagger';
import { CanManageData } from 'src/lib/guards/CanManageData';
import { Data } from 'src/lib/decorators/request-data.decorator';
import { PostRoutes } from './enums/post-routes';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PostMessages } from './enums/post-messages';
import { PublicPostDto } from './response-dto/public-post.dto';
import { PublicPostsDto } from './response-dto/public-posts.dto';
import { PostDto } from './response-dto/post.dto';
import { CreatedPostDto } from './response-dto/created-post.dto';
import { POSTS_ROUTE } from 'src/lib/constants';
import { ICreateController } from 'src/lib/interfaces/create-controller.interface';
import { IFindController } from 'src/lib/interfaces/find-controller.interface';
import { IUpdateController } from 'src/lib/interfaces/update-controller.interface';
import { IDeleteController } from 'src/lib/interfaces/delete-controller.interface';
import { RequiredImageFile } from 'src/uploads/pipes/required-image-file';
import { CheckClientActionsOnPost } from './interceptors/check-client-actions-on-post';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { PublishQueryDto } from './pipes/publish-query.pipe';
import { TagsPipe } from 'src/tags/pipes/tags.pipe';
import { NotifySubcribers } from './interceptors/notify-subscribers';
import { Client } from 'src/auth/decorator/client.decorator';
import { AccountPostsDto } from './response-dto/account-posts.dto';
import { UpdatedPostDto } from './response-dto/updated-post.dto';
import { CachePublicJSON } from 'src/cache/interceptors/cache-public-json.interceptor';

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
  @UseInterceptors(FileInterceptor('titleImage'), NotifySubcribers)
  @Post(PostRoutes.CREATE)
  async create(
    @Body(TagsPipe) createPostDto: CreatePostDto,
    @Query() { publish }: PublishQueryDto,
    @UploadedFile(OptionalImageFile) titleImage: Express.Multer.File | null,
    @Client() client: JwtPayload,
  ): Promise<{ data: CreatedPostDto; message: PostMessages }> {
    return {
      data: await this.postsService.create({
        dto: createPostDto,
        authorID: client.sub,
        titleImage,
        publish: publish === 'false' ? false : true,
      }),
      message: PostMessages.CREATED,
    };
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
  @Get(PostRoutes.FIND_CLIENT_POSTS)
  async findClientPosts(
    @Client() client: JwtPayload,
  ): Promise<{ data: AccountPostsDto; message: PostMessages }> {
    return {
      data: await this.postsService.getAccountPosts(client.sub),
      message: PostMessages.ALL_FOUND,
    };
  }

  @Get(PostRoutes.FIND_ACCOUNT_POSTS + ':id')
  async findAccountPosts(
    @Param('id') accountID: string,
  ): Promise<{ data: AccountPostsDto; message: PostMessages }> {
    return {
      data: await this.postsService.getAccountPublicPosts(accountID),
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

  @UseGuards(OptionalJwtAuthGuard)
  @UseInterceptors(CheckClientActionsOnPost, CachePublicJSON)
  @Get(PostRoutes.FIND_ONE_BY_URL + ':url')
  async findOne(@Param('url') url: string): Promise<{
    data: PublicPostDto;
    message: PostMessages;
  }> {
    return {
      data: await this.postsService.getOne(url),
      message: PostMessages.FOUND,
    };
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @Put(PostRoutes.UPDATE + ':id')
  async update(
    @Data() post: PostDto,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<{
    data: UpdatedPostDto;
    message: PostMessages;
  }> {
    return {
      data: await this.postsService.update(post, {
        ...updatePostDto,
      }),
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
  @Patch(PostRoutes.CHANGE_POST_STATUS + ':id')
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
  @Patch(PostRoutes.UPDATE_TITLE_IMAGE + ':id')
  async updateTitleImage(
    @Data() post: PostDto,
    @UploadedFile(RequiredImageFile) titleImage: Express.Multer.File,
  ): Promise<{ data: { title_image: string }; message: PostMessages }> {
    return {
      data: {
        title_image: await this.postsService.updateTitleImage(post, titleImage),
      },
      message: PostMessages.TITLE_IMAGE_UPDATED,
    };
  }
}
