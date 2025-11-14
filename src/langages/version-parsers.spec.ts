import { extractLatestFromTags, extractCppDraft, extractCStandardsFromHtml } from './version-parsers';

describe('version-parsers', () => {
  test('extractLatestFromTags - picks the highest semver', () => {
  const tags = ['v1.2.3', 'release-2.0.0', '1.10.0', 'bad-tag', '2.1.0-beta'];
  const latest = extractLatestFromTags(tags);
  // semver.coerce will coerce '2.1.0-beta' to '2.1.0', so we expect 2.1.0
  expect(latest).toBe('2.1.0');
  });

  test('extractLatestFromTags - returns null on empty', () => {
    expect(extractLatestFromTags([])).toBeNull();
  });

  test('extractCppDraft - finds latest draft tag', () => {
    const tags = ['n5012', 'n5014', 'n5009', 'v1.0.0'];
    const draft = extractCppDraft(tags);
    expect(draft).toBe('n5014');
  });

  test('extractCStandardsFromHtml - finds C standards', () => {
    const html = '<p>The ISO standard C17 and C11 are commonly referenced; C23 is the latest.</p>';
    const found = extractCStandardsFromHtml(html);
    expect(found).toContain('C23');
    expect(found).toContain('C17');
    expect(found).toContain('C11');
  });
});
