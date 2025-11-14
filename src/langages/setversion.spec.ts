import { LangageUpdateService } from './langage-update.service';

describe('LangageUpdateService setVersion sanitization', () => {
  it('removes a leading v before persisting the label', async () => {
    const mockLangageModel: any = {
      findOne: jest.fn().mockResolvedValue({
        name: 'Node.js',
        versions: [{ type: 'current', label: '0.0.0' }],
      }),
      updateOne: jest.fn().mockResolvedValue({}),
    };

    const mockHttp: any = { get: jest.fn() };

    const service = new LangageUpdateService(mockLangageModel as any, mockHttp as any);

    // call private method via bracket access
    await (service as any).setVersion('Node.js', 'current', 'v1.2.3', '2025-11-14');

    expect(mockLangageModel.updateOne).toHaveBeenCalledWith(
      { name: 'Node.js', 'versions.type': 'current' },
      {
        $set: {
          'versions.$.label': '1.2.3',
          'versions.$.releaseDate': '2025-11-14',
        },
      }
    );
  });
});
