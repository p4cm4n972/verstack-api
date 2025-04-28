export type SyncSourceType = 'npm' | 'github' | 'custom';

export interface LangageSyncConfig {
  nameInDb: string;
  sourceType: SyncSourceType;
  sourceUrl: string;
  ltsSupport?: boolean;
  useTags?: boolean; // For GitHub, use tags instead of releases
}

export const SYNC_LANGAGES: LangageSyncConfig[] =  [
  {
  nameInDb: 'Angular',
  sourceType: 'npm',
  sourceUrl: '@angular/core',
  ltsSupport: true,
  },
  {
  nameInDb: 'React',
  sourceType: 'npm',
  sourceUrl: 'react',
  ltsSupport: false,
  },
  {
  nameInDb: 'Vue.js',
  sourceType: 'npm',
  sourceUrl: 'vue',
  ltsSupport: true,
  },
  {
  nameInDb: 'TypeScript',
  sourceType: 'npm',
  sourceUrl: 'typescript',
  ltsSupport: false,
  },
  {
  nameInDb: 'Node.js',
  sourceType: 'custom',
  sourceUrl: 'https://nodejs.org/dist/index.json',
  ltsSupport: true,
  },
  {
  nameInDb: 'NestJS',
  sourceType: 'npm',
  sourceUrl: '@nestjs/core',
  ltsSupport: false,
  },
  {
  nameInDb: 'Next.js',
  sourceType: 'npm',
  sourceUrl: 'next',
  ltsSupport: false,
  },
  {
  nameInDb: 'Nuxt',
  sourceType: 'npm',
  sourceUrl: 'nuxt',
  ltsSupport: false,
  },
  {
  nameInDb: 'Svelte',
  sourceType: 'npm',
  sourceUrl: 'svelte',
  ltsSupport: false,
  },
  {
  nameInDb: 'SolidJS',
  sourceType: 'npm',
  sourceUrl: 'solid-js',
  ltsSupport: false,
  },
  {
  nameInDb: 'Qwik',
  sourceType: 'npm',
  sourceUrl: '@builder.io/qwik',
  ltsSupport: false,
  },
  {
  nameInDb: 'Electron',
  sourceType: 'github',
  sourceUrl: 'electron/electron',
  ltsSupport: false,
  },
  {
  nameInDb: 'Flutter',
  sourceType: 'github',
  sourceUrl: 'flutter/flutter',
  ltsSupport: false,
  },
  {
  nameInDb: 'Python',
  sourceType: 'custom',
  sourceUrl: 'https://www.python.org/doc/versions/',
  ltsSupport: true,
  },
  {
  nameInDb: 'Go',
  sourceType: 'custom',
  sourceUrl: 'https://go.dev/dl/?mode=json',
  ltsSupport: false,
  },
  {
  nameInDb: 'Dart',
  sourceType: 'github',
  sourceUrl: 'dart-lang/sdk',
  ltsSupport: false,
  },
  {
  nameInDb: 'Rust',
  sourceType: 'github',
  sourceUrl: 'rust-lang/rust',
  ltsSupport: false,
  },
  {
  nameInDb: 'Java',
  sourceType: 'custom',
  sourceUrl: 'https://api.adoptium.net/v3/info/release_versions',
  ltsSupport: true,
  },
  {
  nameInDb: 'PHP',
  sourceType: 'custom',
  sourceUrl: 'https://www.php.net/releases/index.php',
  ltsSupport: true,
  },
  {
  nameInDb: 'Redis',
  sourceType: 'github',
  sourceUrl: 'redis/redis',
  ltsSupport: false,
  },
  {
  nameInDb: 'MongoDB',
  sourceType: 'github',
  sourceUrl: 'mongodb/mongo',
  ltsSupport: false,
  },
  {
  nameInDb: 'PostgreSQL',
  sourceType: 'custom',
  sourceUrl: 'https://www.postgresql.org/docs/release/',
  ltsSupport: true,
  },
  {
  nameInDb: 'MySQL',
  sourceType: 'custom',
  sourceUrl: 'https://dev.mysql.com/doc/relnotes/mysql/',
  ltsSupport: true,
  },
  {
  nameInDb: 'Laravel',
  sourceType: 'github',
  sourceUrl: 'laravel/laravel',
  ltsSupport: true,
  },
  {
  nameInDb: 'Bootstrap',
  sourceType: 'github',
  sourceUrl: 'twbs/bootstrap',
  ltsSupport: false,
  },
  {
  nameInDb: 'Docker',
  sourceType: 'github',
  sourceUrl: 'moby/moby',
  ltsSupport: false,
  },
  {
  nameInDb: 'Kubernetes',
  sourceType: 'github',
  sourceUrl: 'kubernetes/kubernetes',
  ltsSupport: false,
  },
  {
  nameInDb: 'Ansible',
  sourceType: 'github',
  sourceUrl: 'ansible/ansible',
  ltsSupport: false,
  },
  ];
