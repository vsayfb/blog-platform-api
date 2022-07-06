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
  Req,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post as PostEntity } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Account } from 'src/accounts/decorator/account.decorator';
import { JwtPayload } from 'src/lib/jwt.payload';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsImageFilePipe } from 'src/lib/pipes/IsImageFile';
import { TagNamePipe } from 'src/lib/pipes/TagNamePipe';
import { ApiTags } from '@nestjs/swagger';
import { CanManageData } from 'src/lib/guards/CanManageData';
import { Data } from 'src/lib/decorators/request-data.decorator';

@Controller('posts')
@ApiTags('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('titleImage'))
  @Post()
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

  @Get()
  async findAll(): Promise<{ data: PostEntity[]; message: string }> {
    return await this.postsService.getAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMyPosts(
    @Account() account: JwtPayload,
  ): Promise<{ data: PostEntity[]; message: string }> {
    return await this.postsService.getMyPosts(account.sub);
  }

  @UseGuards(AuthGuard('jwt'), CanManageData)
  @Get('id')
  async findByID(
    @Query('id') id: string,
  ): Promise<{ data: PostEntity; message: string }> {
    return await this.postsService.getOneByID(id);
  }

  @Get(':url')
  async findOneByUrl(@Param('url') url: string) {
    return await this.postsService.getOne(url);
  }

  @UseGuards(AuthGuard('jwt'), CanManageData)
  @Patch(':id')
  update(
    @Body(TagNamePipe) updatePostDto: UpdatePostDto,
    @Data() post: PostEntity,
  ) {
    return this.postsService.update(post, updatePostDto);
  }

  @UseGuards(AuthGuard('jwt'), CanManageData)
  @Delete(':id')
  remove(@Data() post: PostEntity) {
    return this.postsService.delete(post);
  }

  @UseGuards(AuthGuard('jwt'), CanManageData)
  @Put('change_post_status/:id')
  async changePostStatus(@Data() post: PostEntity) {
    return await this.postsService.changePostStatus(post);
  }

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('titleImage'))
  @Post('upload_title_image')
  async uploadTitleImage(
    @UploadedFile(IsImageFilePipe) titleImage: Express.Multer.File,
  ): Promise<{ data: string; message: string }> {
    return await this.postsService.saveTitleImage(titleImage);
  }
}
