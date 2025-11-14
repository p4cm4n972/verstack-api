import * as semver from 'semver';

export function extractLatestFromTags(tags: string[]): string | null {
  if (!Array.isArray(tags) || tags.length === 0) return null;
  const versions = tags
    .map(t => semver.coerce(t)?.version)
    .filter((v): v is string => Boolean(v) && !semver.prerelease(v))
    .sort(semver.rcompare);
  return versions.length > 0 ? versions[0] : null;
}

export function extractCppDraft(tags: string[]): string | null {
  if (!Array.isArray(tags) || tags.length === 0) return null;
  const drafts = tags.filter(t => /^n\d{4}$/.test(t)).sort().reverse();
  return drafts.length > 0 ? drafts[0] : null;
}

export function extractCStandardsFromHtml(html: string): string[] {
  if (!html) return [];
  const found: string[] = [];
  ['C23', 'C17', 'C11', 'C99'].forEach(ver => {
    const regex = new RegExp(`${ver}(?:[^A-Z0-9]|$)`, 'i');
    if (regex.test(html)) found.push(ver);
  });
  return found;
}

export function extractFallbackVersionFromTags(tags: string[]): string | null {
  if (!Array.isArray(tags) || tags.length === 0) return null;
  // common fallback patterns: release-1_0, release_1_0, v1_2, v1_2_3, 1_2_3
  const patterns = [/release[-_]?([0-9][_0-9\.]+)/i, /v(\d+[_\.\d]*)/i, /(\d+[_\.\d]+)$/i];
  for (const p of patterns) {
    for (const t of tags) {
      const m = t.match(p);
      if (m && m[1]) {
        return m[1].replace(/_/g, '.');
      }
    }
  }
  return null;
}

export default { extractLatestFromTags, extractCppDraft, extractCStandardsFromHtml };
