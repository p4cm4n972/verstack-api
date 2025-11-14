import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { getModelToken } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { LangageUpdateOptimizedService } from './langage-update-optimized.service';
import { Langage } from './entities/langage.entity';

describe('LangageUpdateOptimizedService - basic structure', () => {
  let service: LangageUpdateOptimizedService;
  let httpService: HttpService;
  let langageModel: any;

  beforeEach(async () => {
    httpService = { get: jest.fn() } as any;
    langageModel = {
      findOne: jest.fn(),
      updateOne: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LangageUpdateOptimizedService,
        { provide: HttpService, useValue: httpService },
        { provide: getModelToken(Langage.name), useValue: langageModel }
      ]
    }).compile();

    service = module.get<LangageUpdateOptimizedService>(LangageUpdateOptimizedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have cache management methods', () => {
    expect(service.getCacheStats).toBeDefined();
    expect(service.clearCache).toBeDefined();
    expect(service.invalidateLanguageCache).toBeDefined();
  });

  it('should provide cache statistics', async () => {
    const stats = service.getCacheStats();
    expect(stats).toHaveProperty('size');
    expect(typeof stats.size).toBe('number');
  });

  it('should clear cache', async () => {
    await service.clearCache();
    const stats = service.getCacheStats();
    expect(stats.size).toBe(0);
  });

  it('should have normalizeLabel method', () => {
    // Test the private method via a public context or check it exists
    expect(service['normalizeLabel']).toBeDefined();
  });

  it('should have githubHeaders method', () => {
    const headers = service['githubHeaders']();
    expect(headers).toHaveProperty('User-Agent');
    expect(headers['User-Agent']).toBe('verstack-bot');
  });

  it('should respect DRY_RUN in setVersion (mocked public flow)', async () => {
    const oldEnv = process.env.DRY_RUN;
    process.env.DRY_RUN = '1';

    // Call setVersion via reflection to avoid routing through HTTP
    await service['setVersion']('TestLang', 'current', '1.0.0');

    // findOne should not be called when DRY_RUN=1
    expect(langageModel.findOne).not.toHaveBeenCalled();

    process.env.DRY_RUN = oldEnv;
  });

  it('should handle missing language in setVersion gracefully', async () => {
    langageModel.findOne.mockResolvedValueOnce(null);

    // Should not throw even if language doesn't exist
    await expect(service['setVersion']('NonExistent', 'current', '1.0.0')).resolves.not.toThrow();
  });
});
