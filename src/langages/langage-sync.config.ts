export type SyncSourceType = 'npm' | 'github' | 'custom';

export interface LangageSyncConfig {
  nameInDb: string;
  sourceType: SyncSourceType;
  sourceUrl: string;
  ltsSupport?: boolean;
}

export const SYNC_LANGAGES: LangageSyncConfig[] = [
  { nameInDb: 'Angular', sourceType: 'npm', sourceUrl: '@angular/core', ltsSupport: true },
  { nameInDb: 'React', sourceType: 'npm', sourceUrl: 'react' },
  { nameInDb: 'Vue.js', sourceType: 'npm', sourceUrl: 'vue' },
  { nameInDb: 'TypeScript', sourceType: 'npm', sourceUrl: 'typescript' },
  { nameInDb: 'Node.js', sourceType: 'custom', sourceUrl: 'nodejs' },
  { nameInDb: 'Go', sourceType: 'custom', sourceUrl: 'https://go.dev/dl/?mode=json' },
  { nameInDb: 'Rust', sourceType: 'github', sourceUrl: 'rust-lang/rust' },
  { nameInDb: 'Swift', sourceType: 'github', sourceUrl: 'apple/swift' },
  { nameInDb: 'Kotlin', sourceType: 'github', sourceUrl: 'JetBrains/kotlin' }
];
