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
  ValidationPipe,
  ParseBoolPipe,
  NotAcceptableException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Account } from 'src/accounts/decorator/account.decorator';
import { JwtPayload } from 'src/common/jwt.payload';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('titleImage'))
  @Post()
  async create(
    @Account() account: JwtPayload,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() titleImage: Express.Multer.File,
    @Query('published') published: false | undefined,
  ) {
    return await this.postsService.create(
      account.sub,
      createPostDto,
      titleImage,
      published,
    );
  }

  @Get()
  async findAll() {
    return await this.postsService.findAll();
  }

  @Get(':url')
  findOne(@Param('url') url: string) {
    return this.postsService.getOne(url);
  }

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('titleImage'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() titleImage: Express.Multer.File,
  ) {
    return this.postsService.update(id, updatePostDto, titleImage);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}
