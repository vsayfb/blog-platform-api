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
import { PostsService } from './services/posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Account } from 'src/accounts/decorator/account.decorator';
import { JwtPayload } from 'src/lib/jwt.payload';
import { FileInterceptor } from '@nestjs/platform-express';
import { OptionalImageFile } from 'src/uploads/pipes/optional-image-file';
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
import { RequiredImageFile } from 'src/uploads/pipes/required-image-file';
import { CheckClientActions } from './interceptors/check-client-actions';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { PublishQueryDto } from './pipes/publish-query.pipe';
import { TagsPipe } from 'src/tags/pipes/tags.pipe';
import { NotifySubcribers } from './interceptors/notify-subscribers';

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
    @Account() account: JwtPayload,
  ): Promise<{ data: CreatedPostDto; message: PostMessages }> {
    return {
      data: await this.postsService.create({
        dto: createPostDto,
        authorID: account.sub,
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
    @Account() account: JwtPayload,
  ): Promise<{ data: PostsDto; message: PostMessages }> {
    return {
      data: await this.postsService.getAccountPosts(account.sub),
      message: PostMessages.ALL_FOUND,
    };
  }

  @Get(PostRoutes.FIND_ACCOUNT_POSTS + ':id')
  async findAccountPosts(
    @Param('id') accountID: string,
  ): Promise<{ data: PostsDto; message: PostMessages }> {
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
  @UseInterceptors(CheckClientActions)
  @Get(PostRoutes.FIND_ONE_BY_URL + ':url')
  async findOne(@Param('url') url: string): Promise<{
    data: PublicPostDto & {
      bookmarked_by: boolean;
      liked_by: boolean;
      disliked_by: boolean;
    };
    message: PostMessages;
  }> {
    const post = await this.postsService.getOne(url);

    return {
      data: post as PublicPostDto & {
        bookmarked_by: boolean;
        liked_by: boolean;
        disliked_by: boolean;
      },
      message: PostMessages.FOUND,
    };
  }

  @UseGuards(JwtAuthGuard, CanManageData)
  @Put(PostRoutes.UPDATE + ':id')
  async update(
    @Data() post: PostDto,
    @Body() updatePostDto: UpdatePostDto,
    @Query() { publish }: PublishQueryDto,
  ) {
    return {
      data: await this.postsService.update(post, {
        ...updatePostDto,
        published:
          publish === 'true' ? true : publish === 'false' ? false : undefined,
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
  ): Promise<{ data: string; message: PostMessages }> {
    return {
      data: await this.postsService.updateTitleImage(post, titleImage),
      message: PostMessages.TITLE_IMAGE_UPDATED,
    };
  }
}
