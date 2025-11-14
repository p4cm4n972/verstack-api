import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { LangageUpdateService } from './langage-update.service';
import { getModelToken } from '@nestjs/mongoose';
import { Langage } from '../langages/entities/langage.entity';
import { SYNC_LANGAGES } from './langage-sync.config';

const mockLangageModel = {
  findOne: jest.fn(),
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

  it('should extract latest from npm dist-tags', async () => {
    mockHttpService.get.mockReturnValueOnce(
      of({ data: { 'dist-tags': { latest: '5.0.0', lts: '4.0.0' } } })
    );
    mockLangageModel.findOne.mockResolvedValueOnce({ name: 'TestPkg', versions: [] });

    await service['updateFromNpm']({
      nameInDb: 'TestPkg',
      sourceType: 'npm',
      sourceUrl: 'test-pkg',
      ltsSupport: true
    });

    expect(mockHttpService.get).toHaveBeenCalledWith('https://registry.npmjs.org/test-pkg');
    expect(mockLangageModel.updateOne).toHaveBeenCalled();
  });

  it('should respect DRY_RUN environment variable', async () => {
    const oldEnv = process.env.DRY_RUN;
    process.env.DRY_RUN = '1';

    mockHttpService.get.mockReturnValueOnce(
      of({ data: { 'dist-tags': { latest: '1.0.0' } } })
    );

    await service['updateFromNpm']({
      nameInDb: 'DryRun',
      sourceType: 'npm',
      sourceUrl: 'dry-run',
      ltsSupport: false
    });

    // findOne should NOT be called when DRY_RUN=1
    expect(mockLangageModel.findOne).not.toHaveBeenCalled();

    process.env.DRY_RUN = oldEnv;
  });

  it('should handle missing language in database', async () => {
    mockLangageModel.findOne.mockResolvedValueOnce(null);
    mockHttpService.get.mockReturnValueOnce(
      of({ data: { 'dist-tags': { latest: '1.0.0' } } })
    );

    // Should not throw even if language doesn't exist
    await expect(
      service['updateFromNpm']({
        nameInDb: 'NonExistent',
        sourceType: 'npm',
        sourceUrl: 'non-existent',
        ltsSupport: false
      })
    ).resolves.not.toThrow();
  });

  it('should extract javascript edition from github tags', async () => {
    mockHttpService.get.mockReturnValueOnce(
      of({ data: [{ name: 'es2024' }, { name: 'es2023' }, { name: 'v1.0.0' }] })
    );
    mockLangageModel.findOne.mockResolvedValueOnce({ name: 'JavaScript', versions: [] });

    await service['updateFromGitHubTag']({
      nameInDb: 'JavaScript',
      sourceType: 'github',
      sourceUrl: 'tc39/ecma262',
      useTags: true
    });

    expect(mockLangageModel.updateOne).toHaveBeenCalled();
  });

  // ... (les autres tests restent inchangés ici)
});
