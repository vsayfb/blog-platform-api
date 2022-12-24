import { BadRequestException } from '@nestjs/common';
import { validateOrReject } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

class ClassType {
  constructor() {}
}

export const validateParamDto =
  (DtoClass: typeof ClassType) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = new DtoClass();

      for (const key in req.params) {
        const element = req.params[key];

        if (element) {
          dto[key] = element;
        }
      }

      await validateOrReject(dto, {
        forbidUnknownValues: true,
        whitelist: true,
      });
    } catch (error: any) {
      const messages = [];

      for (const key in error) {
        const element = error[key];
        messages.push(...Object.values(element.constraints));
      }

      throw new BadRequestException(messages);
    }

    next();
  };
