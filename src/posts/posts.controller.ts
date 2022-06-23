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
import { JwtPayload } from 'src/common/jwt.payload';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsImageFilePipe } from 'src/common/pipes/IsImageFile';
import { TagNamePipe } from 'src/common/pipes/TagNamePipe';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('titleImage'))
  @Post()
  async create(
    @Account() account: JwtPayload,
    @Body(TagNamePipe) createPostDto: CreatePostDto,
    @Query('published') published: false | undefined,
  ) {
    return await this.postsService.create(
      account.sub,
      createPostDto,
      published,
    );
  }

  @Get()
  async findAll() {
    return await this.postsService.getAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMyPosts(@Account() account: JwtPayload) {
    return await this.postsService.getMyArticles(account.sub);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('id')
  async findByID(@Query('id') id: string) {
    return await this.postsService.getOne(id);
  }

  @Get(':url')
  findOne(@Param('url') url: string) {
    return this.postsService.getPost(url);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(TagNamePipe) updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('change_post_status/:id')
  async changePostStatus(
    @Param('id') id: string,
    @Account() account: JwtPayload,
  ) {
    return await this.postsService.changePostStatus(id, account);
  }

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('titleImage'))
  @Post('upload_title_image')
  async uploadTitleImage(
    @UploadedFile(IsImageFilePipe) titleImage: Express.Multer.File,
  ) {
    return await this.postsService.saveTitleImage(titleImage);
  }
}
