import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { LangageUpdateService } from './langage-update.service';
import { getModelToken } from '@nestjs/mongoose';
import { Langage } from '../langages/entities/langage.entity';
import { SYNC_LANGAGES } from './langage-sync.config';

const mockLangageModel = {
  updateOne: jest.fn().mockResolvedValue({})
};

const mockHttpService = {
  get: jest.fn()
};

describe('LangageUpdateService', () => {
  let service: LangageUpdateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LangageUpdateService,
        { provide: getModelToken(Langage.name), useValue: mockLangageModel },
        { provide: HttpService, useValue: mockHttpService }
      ]
    }).compile();

    service = module.get<LangageUpdateService>(LangageUpdateService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should handle error during updateFromNpm gracefully', async () => {
    mockHttpService.get.mockReturnValueOnce(throwError(() => new Error('NPM service unavailable')));

    await expect(
      service['updateFromNpm']({
        nameInDb: 'TestLang',
        sourceType: 'npm',
        sourceUrl: 'testlang',
        ltsSupport: true
      })
    ).rejects.toThrow('NPM service unavailable');
  });

  it('should handle error during updateFromGitHubRelease gracefully', async () => {
    mockHttpService.get.mockReturnValueOnce(throwError(() => new Error('GitHub release error')));

    await expect(
      service['updateFromGitHubRelease']({
        nameInDb: 'GitLang',
        sourceType: 'github',
        sourceUrl: 'org/repo',
        ltsSupport: false
      })
    ).rejects.toThrow('GitHub release error');
  });

  it('should handle error during updateCustom gracefully', async () => {
    mockHttpService.get.mockReturnValueOnce(throwError(() => new Error('Custom source error')));

    await expect(
      service['updateCustom']({
        nameInDb: 'CustomLang',
        sourceType: 'custom',
        sourceUrl: 'nodejs',
        ltsSupport: true
      })
    ).rejects.toThrow('Custom source error');
  });

  // ... (les autres tests restent inchangés ici)
});
