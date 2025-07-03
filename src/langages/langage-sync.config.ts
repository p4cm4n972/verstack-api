export type SyncSourceType = 'npm' | 'github' | 'custom';

export interface LangageSyncConfig {
  nameInDb: string;
  sourceType: SyncSourceType;
  sourceUrl: string;
  ltsSupport?: boolean;
  ltsTagPrefix?: string;
  useTags?: boolean;
  edition?: string; 
  livingStandard?: boolean;
  standardSupport?: boolean;
}

export const SYNC_LANGAGES: LangageSyncConfig[] =  [
  {
    nameInDb: 'HTML',
    sourceType: 'custom',
    sourceUrl: 'html',
    livingStandard: true
  },
 /* {
    nameInDb: 'CSS',
    sourceType: 'custom',
    sourceUrl: 'css',
    livingStandard: true
  },*/
  {
    nameInDb: 'JavaScript',
    sourceType: 'github',
    sourceUrl: 'tc39/ecma262',
    useTags: true
  },
  {
    nameInDb: 'ECMAScript',
    sourceType: 'github',
    sourceUrl: 'tc39/ecma262',
    useTags: true
  },
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
  sourceUrl: 'nodejs',
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
  useTags: true
  },
  {
  nameInDb: 'Flutter',
  sourceType: 'github',
  sourceUrl: 'flutter/flutter',
  ltsSupport: false,
  useTags: true
  },
  {
  nameInDb: 'Python',
  sourceType: 'github',
  sourceUrl: 'python/cpython',
  ltsSupport: true,
  useTags: true,
  ltsTagPrefix: '3.10'
  },
  {
  nameInDb: 'Go',
  sourceType: 'custom',
  sourceUrl: 'https://go.dev/dl/?mode=json',
  ltsSupport: false,
  },
  {
    nameInDb: 'Dart',
    sourceType: 'custom',
    sourceUrl: 'https://storage.googleapis.com/dart-archive/channels/stable/release/latest/VERSION',
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
  sourceUrl: 'https://api.adoptium.net/v3/assets/feature_releases?jvm_impl=hotspot&image_type=jdk&os=linux&page=0&page_size=100&project=jdk&sort_order=DESC',
  ltsSupport: true,
  },
  {
  nameInDb: 'PHP',
  sourceType: 'github',
  sourceUrl: 'php/php-src',
  ltsSupport: false,
  },
  {
  nameInDb: 'Redis',
  sourceType: 'github',
  sourceUrl: 'redis/redis',
  ltsSupport: false,
  },
  {
    nameInDb: 'MongoDB',
    sourceType: 'custom',
    sourceUrl: 'https://www.mongodb.com/try/download/community',
    ltsSupport: true,
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
  ltsSupport: false,
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
  {
  nameInDb: 'Swift',
  sourceType: 'github',
  sourceUrl: 'apple/swift',
  ltsSupport: false,
  },
  {
  nameInDb: 'Kotlin',
  sourceType: 'github',
  sourceUrl: 'JetBrains/kotlin',
  ltsSupport: false,
  },
  {
  nameInDb: 'Ruby',
  sourceType: 'custom',
  sourceUrl: 'ruby/ruby',
  ltsSupport: false,
  },
  {
  nameInDb: 'C',
  sourceType: 'custom',
  sourceUrl: 'c',
  standardSupport: true
}
, 
  {
  nameInDb: 'C#',
  sourceType: 'github',
  sourceUrl: 'dotnet/runtime',
  ltsSupport: false,
  },
  {
  nameInDb: 'C++',
  sourceType: 'github',
  sourceUrl: 'cplusplus/draft',
  ltsSupport: false,
  useTags: true,
  standardSupport: true,
  },
  {
  nameInDb: 'Scala',
  sourceType: 'github',
  sourceUrl: 'scala/scala',
  ltsSupport: false,
  },
  {
  nameInDb: 'Symfony',
  sourceType: 'github',
  sourceUrl: 'symfony/symfony',
  ltsSupport: false,
  },
  {
  nameInDb: 'Astro',
  sourceType: 'npm',
  sourceUrl: 'astro',
  ltsSupport: false,
  },
  {
  nameInDb: 'Deno',
  sourceType: 'github',
  sourceUrl: 'denoland/deno',
  ltsSupport: false,
  },
  {
  nameInDb: 'Bun',
  sourceType: 'github',
  sourceUrl: 'oven-sh/bun',
  ltsSupport: false,
  },
  {
  nameInDb: 'Delphi',
  sourceType: 'custom',
  sourceUrl: 'delphi',
  ltsSupport: false,
  },
  {
  nameInDb: 'Lua',
  sourceType: 'github',
  sourceUrl: 'lua/lua',
  ltsSupport: false,
  },
  {
  nameInDb: 'MATLAB',
  sourceType: 'custom',
  sourceUrl: 'matlab',
  ltsSupport: false,
  },
  {
  nameInDb: 'Julia',
  sourceType: 'github',
  sourceUrl: 'JuliaLang/julia',
  ltsSupport: false,
  },
  {
  nameInDb: 'Elixir',
  sourceType: 'github',
  sourceUrl: 'elixir-lang/elixir',
  ltsSupport: false,
  },
  {
  nameInDb: 'Zig',
  sourceType: 'github',
  sourceUrl: 'ziglang/zig',
  ltsSupport: false,
  },
  {
  nameInDb: 'Fortran',
  sourceType: 'github',
  sourceUrl: 'fortran-lang/stdlib',
  ltsSupport: false,
  },
  {
  nameInDb: 'R',
  sourceType: 'custom',
  sourceUrl: 'wch/r-source',
  ltsSupport: false,
  useTags: true,
  },
  {
  nameInDb: 'Perl',
  sourceType: 'github',
  sourceUrl: 'Perl/perl5',
  ltsSupport: false,
  useTags: true,
  },
  {
  nameInDb: 'Unity',
  sourceType: 'custom',
  sourceUrl: 'unity',
  ltsSupport: true,
  },
  {
  nameInDb: 'Express.js',
  sourceType: 'npm',
  sourceUrl: 'express',
  ltsSupport: false,
  },
  {
  nameInDb: 'Spring',
  sourceType: 'github',
  sourceUrl: 'spring-projects/spring-framework',
  ltsSupport: false,
  },
  {
  nameInDb: 'Django',
  sourceType: 'github',
  sourceUrl: 'django/django',
  ltsSupport: false,
  ltsTagPrefix: '4.2',
  useTags: true,
  },
  {
  nameInDb: 'JSON',
  sourceType: 'custom',
  sourceUrl: 'json',
  ltsSupport: false,
  },
  {
  nameInDb: 'Bash',
  sourceType: 'github',
  sourceUrl: 'bminor/bash',
  ltsSupport: false,
  useTags: true,
  },
  {
  nameInDb: 'Erlang',
  sourceType: 'github',
  sourceUrl: 'erlang/otp',
  ltsSupport: false,
  },
  {
  nameInDb: 'Nim',
  sourceType: 'github',
  sourceUrl: 'nim-lang/Nim',
  ltsSupport: false,
  useTags: true,
  },
  {
  nameInDb: 'V',
  sourceType: 'github',
  sourceUrl: 'vlang/v',
  ltsSupport: false,
  },
  {
  nameInDb: 'WebAssembly',
  sourceType: 'github',
  sourceUrl: 'WebAssembly/spec',
  ltsSupport: false,
  useTags: true,
  },
  {
  nameInDb: 'SQL',
  sourceType: 'custom',
  sourceUrl: 'sql',
  ltsSupport: false,
  },
  {
  nameInDb: 'Haskell',
  sourceType: 'github',
  sourceUrl: 'ghc/ghc',
  ltsSupport: false,
  useTags: true,
  },
  {
  nameInDb: 'Clojure',
  sourceType: 'github',
  sourceUrl: 'clojure/clojure',
  ltsSupport: false,
  useTags: true,
  },
  {
  nameInDb: 'Flang',
  sourceType: 'github',
  sourceUrl: 'flang-compiler/flang',
  ltsSupport: false,
  useTags: true,
  },
  {
  nameInDb: 'OCaml',
  sourceType: 'github',
  sourceUrl: 'ocaml/ocaml',
  ltsSupport: false,
  },
  ];
