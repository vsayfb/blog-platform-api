import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { uploadImageStub } from 'src/uploads/stub/upload-image.stub';
import { CloudinaryService } from '../cloudinary.service';

describe('CloudinaryService', () => {
  let cloudinaryService: CloudinaryService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('') },
        },
      ],
    }).compile();

    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);

    // spyOn private method
    jest
      .spyOn(CloudinaryService.prototype, 'upload' as any)
      .mockResolvedValue(uploadImageStub().newImage);
  });

  describe('uploadImage', () => {
    let result: string;
    let file: Express.Multer.File;

    describe('when uploadImage is called', () => {
      beforeEach(async () => {
        result = await cloudinaryService.uploadImage(file);
      });

      test('calls cloudinaryService.upload', () => {
        //@ts-ignore private method
        expect(cloudinaryService.upload).toHaveBeenCalledWith(file);
      });

      it('should return uploaded image url', () => {
        expect(result).toEqual(expect.any(String));
      });
    });
  });

  describe('uploadProfileImage', () => {
    let result: string;
    let file: Express.Multer.File;

    describe('when uploadProfileImage is called', () => {
      beforeEach(async () => {
        result = await cloudinaryService.uploadProfileImage(file);
      });

      test('calls cloudinaryService.upload', () => {
        //@ts-ignore private method
        expect(cloudinaryService.upload).toHaveBeenCalledWith(
          file,
          expect.any(Object),
        );
      });

      it('should return uploaded image url', () => {
        expect(result).toEqual(expect.any(String));
      });
    });
  });
});
