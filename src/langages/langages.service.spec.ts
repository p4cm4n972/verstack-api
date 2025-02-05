import { Test, TestingModule } from '@nestjs/testing';
import { LangagesService } from './langages.service';

describe('LangagesService', () => {
  let service: LangagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LangagesService],
    }).compile();

    service = module.get<LangagesService>(LangagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
