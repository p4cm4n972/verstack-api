import { CUSTOM_UPDATERS } from './custom-updaters';
import { of } from 'rxjs';

describe('custom-updaters', () => {
  test('C updater parses standards from Wikipedia API output', async () => {
    const fakeHtml = '<p>ISO/IEC 9899:2023 (C23) is the latest. Previous: C17 and C11.</p>';
    const http = { get: jest.fn(() => of({ data: { parse: { text: { '*': fakeHtml } } } })) } as any;
    const setVersion = jest.fn(async () => {});
    const logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;
    const normalizeLabel = (n: string, l: string) => l;

    await CUSTOM_UPDATERS['C']({ nameInDb: 'C', sourceUrl: 'c' } as any, { http, setVersion, logger, normalizeLabel });

    // Expect setVersion called for standards and current
    expect(setVersion).toHaveBeenCalled();
    expect(setVersion).toHaveBeenCalledWith('C', 'standard', 'C23');
    expect(setVersion).toHaveBeenCalledWith('C', 'current', 'C23');
  });

  test('Ruby updater extracts stable version from HTML', async () => {
    const fakeHtml = 'Stable releases: Latest Ruby 3.4.7 and older';
    const http = { get: jest.fn(() => of({ data: fakeHtml })) } as any;
    const setVersion = jest.fn(async () => {});
    const logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;

    await CUSTOM_UPDATERS['Ruby']({ nameInDb: 'Ruby', sourceUrl: 'ruby' } as any, { http, setVersion, logger } as any);

    expect(setVersion).toHaveBeenCalledWith('Ruby', 'current', '3.4.7');
  });

  test('Delphi updater extracts versions from Wikipedia API', async () => {
    const fakeHtml = '<p>Delphi version 11.2 and earlier versions</p>';
    const http = { get: jest.fn(() => of({ data: { parse: { text: { '*': fakeHtml } } } })) } as any;
    const setVersion = jest.fn(async () => {});
    const logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;

    await CUSTOM_UPDATERS['Delphi']({ nameInDb: 'Delphi', sourceUrl: 'delphi' } as any, { http, setVersion, logger } as any);

    // expect at least one call to setVersion with a coerced version (11.2 -> 11.2.0)
    expect(setVersion).toHaveBeenCalled();
    expect(setVersion).toHaveBeenCalledWith('Delphi', 'current', expect.stringMatching(/^11\.2/));
  });

  test('SQL updater detects SQL standard from Wikipedia API', async () => {
    const fakeHtml = '<p>SQL:2016 is the standard, approved by ISO.</p>';
    const http = { get: jest.fn(() => of({ data: { parse: { text: { '*': fakeHtml } } } })) } as any;
    const setVersion = jest.fn(async () => {});
    const logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;

    await CUSTOM_UPDATERS['sql']({ nameInDb: 'SQL', sourceUrl: 'sql' } as any, { http, setVersion, logger } as any);

    expect(setVersion).toHaveBeenCalledWith('SQL', 'standard', 'SQL:2016');
    expect(setVersion).toHaveBeenCalledWith('SQL', 'current', 'SQL:2016');
  });

  test('JSON updater sets livingStandard', async () => {
    const setVersion = jest.fn(async () => {});
    const logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;

    await CUSTOM_UPDATERS['json']({ nameInDb: 'JSON', sourceUrl: 'json' } as any, { setVersion, logger } as any);

    expect(setVersion).toHaveBeenCalledWith('JSON', 'livingStandard', 'ECMA-404 / RFC 8259');
  });
});
