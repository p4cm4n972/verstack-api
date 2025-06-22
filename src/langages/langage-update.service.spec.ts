import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { LangageUpdateService } from './langage-update.service';
import { getModelToken } from '@nestjs/mongoose';
import { Langage } from './entities/langage.entity';

describe('LangageUpdateService', () => {
  let service: LangageUpdateService;
  let http: { get: jest.Mock };
  let model: { updateOne: jest.Mock };

  beforeEach(async () => {
    http = { get: jest.fn() } as any;
    model = { updateOne: jest.fn().mockResolvedValue({}) } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LangageUpdateService,
        { provide: HttpService, useValue: http },
        { provide: getModelToken(Langage.name), useValue: model },
      ],
    }).compile();

    service = module.get<LangageUpdateService>(LangageUpdateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should ignore non version tags', async () => {
    http.get
      .mockReturnValueOnce(of({ data: [ { name: 'code-review/2009-07-22' }, { name: 'v5.1.0' } ] }))
      .mockReturnValueOnce(of({ data: [] }));

    await service.updateFromGitHubTag('Perl', 'Perl/perl5');

    expect(model.updateOne).toHaveBeenCalledWith(
      { name: 'Perl' },
      expect.objectContaining({
        $set: expect.objectContaining({ 'versions.$[v].label': '5.1.0' })
      }),
      { arrayFilters: [ { 'v.type': 'current' } ] }
    );
  });

  it('should set lts when prefix provided', async () => {
    http.get
      .mockReturnValueOnce(of({ data: [ { name: 'v5.1.0' }, { name: 'v4.2.3' } ] }))
      .mockReturnValueOnce(of({ data: [] }));

    await service.updateFromGitHubTag('Django', 'django/django', '4.2');

    expect(model.updateOne).toHaveBeenNthCalledWith(
      1,
      { name: 'Django' },
      expect.objectContaining({
        $set: expect.objectContaining({ 'versions.$[v].label': '5.1.0' })
      }),
      { arrayFilters: [ { 'v.type': 'current' } ] }
    );
    expect(model.updateOne).toHaveBeenNthCalledWith(
      2,
      { name: 'Django' },
      expect.objectContaining({
        $set: expect.objectContaining({ 'versions.$[v].label': '4.2.3' })
      }),
      { arrayFilters: [ { 'v.type': 'lts' } ] }
    );
  });
});
