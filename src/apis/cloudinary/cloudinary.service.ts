import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinaryV2 } from 'cloudinary';
import * as path from 'path';
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from 'src/lib/env';

@Injectable()
export class CloudinaryService {
  constructor(configService: ConfigService) {
    cloudinaryV2.config({
      cloud_name: configService.get<string>(CLOUDINARY_CLOUD_NAME),
      api_key: configService.get<string>(CLOUDINARY_API_KEY),
      api_secret: configService.get<string>(CLOUDINARY_API_SECRET),
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

  private async upload(file: Express.Multer.File, transformation: Object = {}) {
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
