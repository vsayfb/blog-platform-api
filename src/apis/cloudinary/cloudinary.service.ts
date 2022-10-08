import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinaryV2 } from 'cloudinary';
import * as path from 'path';
import { ProcessEnv } from 'src/lib/enums/env';
import { IUploadImageService } from 'src/uploads/interfaces/upload-image-service.interface';

@Injectable()
export class CloudinaryService implements IUploadImageService {
  constructor(configService: ConfigService) {
    cloudinaryV2.config({
      cloud_name: configService.get<string>(ProcessEnv.CLOUDINARY_CLOUD_NAME),
      api_key: configService.get<string>(ProcessEnv.CLOUDINARY_API_KEY),
      api_secret: configService.get<string>(ProcessEnv.CLOUDINARY_API_SECRET),
    });
  }

  private getProfileImageTransformation() {
    return {
      transformation: [
        {
          aspect_ratio: '1.0',
          zoom: '0.7',
          crop: 'thumb',
        },
        { radius: 'max' },
        {
          width: 200,
          height: 200,
          crop: 'thumb',
          radius: 'max',
          quality: 100,
          q_auto: 'best',
        },
      ],
    };
  }

  private async convertBase64(file: Express.Multer.File): Promise<string> {
    const DataURIParser = require('datauri/parser');

    const parser = new DataURIParser().format(
      path.extname(file.mimetype),
      file.buffer,
    ).content;

    return parser;
  }

  private async upload(
    file: Express.Multer.File,
    transformation?: Record<string, unknown>,
  ) {
    const { secure_url } = await cloudinaryV2.uploader.upload(
      await this.convertBase64(file),
      transformation,
    );

    return secure_url;
  }

  async uploadImage(file: Express.Multer.File) {
    return await this.upload(file);
  }

  async uploadProfileImage(file: Express.Multer.File): Promise<string> {
    const transformation = this.getProfileImageTransformation();

    return await this.upload(file, transformation);
  }
}
