import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from 'src/apis/cloudinary/cloudinary.service';
import { UploadsService } from '../uploads.service';

jest.mock('src/apis/cloudinary/cloudinary.service');

describe('UploadsService', () => {
  let uploadsService: UploadsService;
  let cloudinaryService: CloudinaryService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadsService, CloudinaryService],
    }).compile();

    uploadsService = module.get<UploadsService>(UploadsService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });

  describe('uploadProfileImage', () => {
    describe('when uploadProfileImage is called', () => {
      let result: string;
      let file: Express.Multer.File;

      beforeEach(async () => {
        result = await uploadsService.uploadProfileImage(file);
      });

      test('calls cloudinaryService.uploadProfileImage with given file', () => {
        expect(cloudinaryService.uploadProfileImage).toHaveBeenCalledWith(file);
      });

      it('should return the uploaded image url', () => {
        expect(result).toEqual(expect.any(String));
      });
    });
  });
  describe('uploadImage', () => {
    describe('when uploadImage is called', () => {
      let result: string;
      let file: Express.Multer.File;

      beforeEach(async () => {
        result = await uploadsService.uploadImage(file);
      });
      test('calls cloudinaryService.uploadImage with given file', () => {
        expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(file);
      });

      it('should return the uploaded image url', () => {
        expect(result).toEqual(expect.any(String));
      });
    });
  });
});
