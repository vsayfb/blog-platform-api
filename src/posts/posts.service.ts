import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import uniqueID from 'short-unique-id';
import slugify from 'slugify';
import { UploadsService } from 'src/uploads/uploads.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postsRepository: Repository<Post>,
    private readonly uploadService: UploadsService,
  ) {}

  async create(
    authorID: string,
    dto: CreatePostDto,
    image: Express.Multer.File | undefined,
  ): Promise<Post> {
    const url = `${slugify(dto.title)}-${new uniqueID()()}`;

    let titleImage: string | null = null;

    if (image) {
      const newImageUrl = await this.uploadService.uploadImage(image);
      titleImage = newImageUrl;
    }

    return this.postsRepository.save({
      ...dto,
      url,
      author: { id: authorID },
      titleImage,
    });
  }

  findAll() {
    return `This action returns all posts`;
  }

  findOne(url: string) {
    return this.postsRepository.findOne({ where: { url } });
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
