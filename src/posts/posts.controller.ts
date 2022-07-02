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
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsImageFilePipe } from 'src/lib/pipes/IsImageFile';
import { TagNamePipe } from 'src/lib/pipes/TagNamePipe';
import { ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from 'src/lib/guards/PermissionGuard';

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
  ) {
    const data = { authorID: account.sub, dto: createPostDto };

    if (published)
      return await this.postsService.create({ ...data, published });

    return await this.postsService.create(data);
  }

  @Get()
  async findAll() {
    return await this.postsService.getAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMyPosts(@Account() account: JwtPayload) {
    return await this.postsService.getMyPosts(account.sub);
  }

  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @Get('id')
  async findByID(@Query('id') id: string) {
    return await this.postsService.getOneByID(id);
  }

  @Get(':url')
  async findOneByUrl(@Param('url') url: string) {
    return await this.postsService.getOne(url);
  }

  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(TagNamePipe) updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.delete(id);
  }

  @UseGuards(AuthGuard('jwt'), PermissionGuard)
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
