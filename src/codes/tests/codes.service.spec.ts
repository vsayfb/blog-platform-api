import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Code } from '../entities/code.entity';
import { CodesService } from '../codes.service';

describe('CodesService', () => {
  let service: CodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CodesService,
        { provide: getRepositoryToken(Code), useValue: {} },
      ],
    }).compile();

    service = module.get<CodesService>(CodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
