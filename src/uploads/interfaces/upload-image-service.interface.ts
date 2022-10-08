export interface IUploadImageService {
  uploadImage(image: Express.Multer.File): Promise<string>;
  uploadProfileImage(image: Express.Multer.File): Promise<string>;
}

export const IUploadImageService = Symbol('IUploadImageService');
