import { Test, TestingModule } from '@nestjs/testing';
import { FrameworksService } from './frameworks.service';

describe('FrameworksService', () => {
  let service: FrameworksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FrameworksService],
    }).compile();

    service = module.get<FrameworksService>(FrameworksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
