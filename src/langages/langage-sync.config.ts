export type SyncSourceType = 'npm' | 'github' | 'custom';

export interface LangageSyncConfig {
  nameInDb: string;
  sourceType: SyncSourceType;
  sourceUrl: string;
  ltsSupport?: boolean;
  useTags?: boolean; // For GitHub, use tags instead of releases
}

export const SYNC_LANGAGES: LangageSyncConfig[] = [
  {
    nameInDb: 'Angular',
    sourceType: 'npm',
    sourceUrl: '@angular/core',
    ltsSupport: true,
  },
  { nameInDb: 'React', sourceType: 'npm', sourceUrl: 'react' },
  { nameInDb: 'Vue.js', sourceType: 'npm', sourceUrl: 'vue' },
  { nameInDb: 'TypeScript', sourceType: 'npm', sourceUrl: 'typescript' },
  { nameInDb: 'Node.js', sourceType: 'custom', sourceUrl: 'nodejs' },
  {
    nameInDb: 'Go',
    sourceType: 'custom',
    sourceUrl: 'https://go.dev/dl/?mode=json',
  },
  { nameInDb: 'Rust', sourceType: 'github', sourceUrl: 'rust-lang/rust' },
  { nameInDb: 'Swift', sourceType: 'github', sourceUrl: 'apple/swift' },
  { nameInDb: 'Kotlin', sourceType: 'github', sourceUrl: 'JetBrains/kotlin' },
  {
    nameInDb: 'Python',
  sourceType: 'github',
  sourceUrl: 'python/cpython',
  ltsSupport: false,
  useTags: true
  },
  {
    nameInDb: 'Rust',
    sourceType: 'github',
    sourceUrl: 'rust-lang/rust'
  },
  {
    nameInDb: 'Swift',
    sourceType: 'github',
    sourceUrl: 'apple/swift'
  },
  {
    nameInDb: 'Kotlin',
    sourceType: 'github',
    sourceUrl: 'JetBrains/kotlin',
    useTags: true
  },
  {
    nameInDb: 'Flutter',
    sourceType: 'github',
    sourceUrl: 'flutter/flutter',
    useTags: true
  },
  {
    nameInDb: 'PHP',
    sourceType: 'custom',
    sourceUrl: 'https://www.php.net/releases/index.php?json&max=1'
  },
  {
    nameInDb: 'Django',
    sourceType: 'github',
    sourceUrl: 'django/django',
    useTags: true
  },
  {
    nameInDb: 'Laravel',
    sourceType: 'github',
    sourceUrl: 'laravel/framework',
    useTags: true
  },
  {
    nameInDb: 'Next.js',
    sourceType: 'github',
    sourceUrl: 'vercel/next.js'
  },
  {
    nameInDb: 'Nuxt.js',
    sourceType: 'github',
    sourceUrl: 'nuxt/nuxt'
  },
  {
    nameInDb: 'Astro',
    sourceType: 'github',
    sourceUrl: 'withastro/astro'
  },
  {
    nameInDb: 'Symfony',
    sourceType: 'github',
    sourceUrl: 'symfony/symfony',
    useTags: true
  },
  {
    nameInDb: '.NET',
    sourceType: 'custom',
    sourceUrl: 'https://dotnetcli.blob.core.windows.net/dotnet/release-metadata/releases-index.json'
  },
  {
    nameInDb: 'Spring Boot',
    sourceType: 'github',
    sourceUrl: 'spring-projects/spring-boot'
  }
];
