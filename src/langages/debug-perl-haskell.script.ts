import * as semver from 'semver';

// Test Perl tags
const perlTags = [
  'v5.43.4', 'v5.43.3', 'v5.42.0', 'v5.42.0-RC3', 'v5.42.0-RC2',
  'v5.41.13', 'v5.41.12', 'v5.40.0'
];

// Test Haskell tags
const haskellTags = [
  'ghc-9.12.2-release', 'ghc-9.14.1-rc1', 'ghc-9.12.3-rc1',
  'ghc-9.10.1-release', 'ghc-9.8.1-release'
];

console.log('=== Test Perl ===');
console.log('Filtered tags (matching ^v5\\.\\d+\\.\\d+):');
const perlFiltered = perlTags.filter(t => /^v5\.\d+\.\d+/.test(t));
perlFiltered.forEach(t => {
  const coerced = semver.coerce(t);
  const prerelease = coerced ? semver.prerelease(coerced.version) : null;
  console.log(`  ${t} -> coerce: ${coerced?.version}, prerelease: ${prerelease}`);
});

const perlVersions = perlFiltered
  .map(t => semver.coerce(t)?.version)
  .filter((v): v is string => Boolean(v) && !semver.prerelease(v))
  .sort(semver.rcompare);
console.log('\nSorted versions:', perlVersions);
console.log('Latest:', perlVersions[0]);

console.log('\n=== Test Haskell ===');
console.log('Filtered tags (matching ^ghc-\\d+\\.\\d+\\.\\d+):');
const haskellFiltered = haskellTags.filter(t => /^ghc-\d+\.\d+\.\d+/.test(t));
haskellFiltered.forEach(t => {
  const coerced = semver.coerce(t);
  const prerelease = coerced ? semver.prerelease(coerced.version) : null;
  console.log(`  ${t} -> coerce: ${coerced?.version}, prerelease: ${prerelease}`);
});

const haskellVersions = haskellFiltered
  .map(t => semver.coerce(t)?.version)
  .filter((v): v is string => Boolean(v) && !semver.prerelease(v))
  .sort(semver.rcompare);
console.log('\nSorted versions:', haskellVersions);
console.log('Latest:', haskellVersions[0]);

// Test where 2009 could come from
console.log('\n=== Where does 2009 come from? ===');
const weirdTests = [
  'perl-2009', 'release-2009', '5.34.2009', 'v2009'
];
weirdTests.forEach(t => {
  const coerced = semver.coerce(t);
  console.log(`  ${t} -> ${coerced?.version}`);
});

// Test extractFallbackVersionFromTags pattern
console.log('\n=== Fallback pattern tests ===');
const fallbackPatterns = [/release[-_]?([0-9][_0-9\.]+)/i, /v(\d+[_\.\d]*)/i, /(\d+[_\.\d]+)$/i];
const testTags = ['perl-2009', 'release_20090505'];
for (const tag of testTags) {
  for (const p of fallbackPatterns) {
    const m = tag.match(p);
    if (m && m[1]) {
      console.log(`  ${tag} matches ${p} -> ${m[1]}`);
    }
  }
}
