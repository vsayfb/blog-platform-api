import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Codes } from './codes.entity';
import { CodesService } from './codes.service';

describe('CodesService', () => {
  let service: CodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CodesService,
        { provide: getRepositoryToken(Codes), useValue: {} },
      ],
    }).compile();

    service = module.get<CodesService>(CodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
