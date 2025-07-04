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

const npm = (nameInDb: string, pkg: string, opts: Partial<LangageSyncConfig> = {}): LangageSyncConfig => ({
  nameInDb,
  sourceType: 'npm',
  sourceUrl: pkg,
  ...opts
});

const github = (nameInDb: string, repo: string, opts: Partial<LangageSyncConfig> = {}): LangageSyncConfig => ({
  nameInDb,
  sourceType: 'github',
  sourceUrl: repo,
  ...opts
});

const custom = (nameInDb: string, url: string, opts: Partial<LangageSyncConfig> = {}): LangageSyncConfig => ({
  nameInDb,
  sourceType: 'custom',
  sourceUrl: url,
  ...opts
});

export const SYNC_LANGAGES: LangageSyncConfig[] = [
  custom('HTML', 'html', { livingStandard: true }),
  /* custom('CSS', 'css', { livingStandard: true }), */
  github('JavaScript', 'tc39/ecma262', { useTags: true }),
  github('ECMAScript', 'tc39/ecma262', { useTags: true }),
  npm('Angular', '@angular/core', { ltsSupport: true }),
  npm('React', 'react'),
  npm('Vue.js', 'vue', { ltsSupport: true }),
  npm('TypeScript', 'typescript'),
  custom('Node.js', 'nodejs', { ltsSupport: true }),
  npm('NestJS', '@nestjs/core'),
  npm('Next.js', 'next'),
  npm('Nuxt', 'nuxt'),
  npm('Svelte', 'svelte'),
  npm('SolidJS', 'solid-js'),
  npm('Qwik', '@builder.io/qwik'),
  github('Electron', 'electron/electron', { useTags: true }),
  github('Flutter', 'flutter/flutter', { useTags: true }),
  github('Python', 'python/cpython', { useTags: true, ltsSupport: true, ltsTagPrefix: '3.10' }),
  custom('Go', 'https://go.dev/dl/?mode=json'),
  custom('Dart', 'https://storage.googleapis.com/dart-archive/channels/stable/release/latest/VERSION'),
  github('Rust', 'rust-lang/rust'),
  custom('Java', 'https://api.adoptium.net/v3/assets/feature_releases?jvm_impl=hotspot&image_type=jdk&os=linux&page=0&page_size=100&project=jdk&sort_order=DESC', { ltsSupport: true }),
  github('PHP', 'php/php-src'),
  github('Redis', 'redis/redis'),
  custom('MongoDB', 'https://www.mongodb.com/try/download/community', { ltsSupport: true }),
  custom('PostgreSQL', 'https://www.postgresql.org/docs/release/', { ltsSupport: true }),
  custom('MySQL', 'https://dev.mysql.com/doc/relnotes/mysql/', { ltsSupport: true }),
  github('Laravel', 'laravel/laravel'),
  github('Bootstrap', 'twbs/bootstrap'),
  github('Docker', 'moby/moby'),
  github('Kubernetes', 'kubernetes/kubernetes'),
  github('Ansible', 'ansible/ansible'),
  github('Swift', 'apple/swift'),
  github('Kotlin', 'JetBrains/kotlin'),
  custom('Ruby', 'ruby/ruby'),
  custom('C', 'c', { standardSupport: true }),
  github('C#', 'dotnet/runtime'),
  github('C++', 'cplusplus/draft', { useTags: true, standardSupport: true }),
  github('Scala', 'scala/scala'),
  github('Symfony', 'symfony/symfony'),
  npm('Astro', 'astro'),
  github('Deno', 'denoland/deno'),
  github('Bun', 'oven-sh/bun'),
  custom('Delphi', 'delphi'),
  github('Lua', 'lua/lua'),
  custom('MATLAB', 'matlab'),
  github('Julia', 'JuliaLang/julia'),
  github('Elixir', 'elixir-lang/elixir'),
  github('Zig', 'ziglang/zig'),
  github('Fortran', 'fortran-lang/stdlib'),
  custom('R', 'wch/r-source', { useTags: true }),
  github('Perl', 'Perl/perl5', { useTags: true }),
  custom('Unity', 'unity', { ltsSupport: true }),
  npm('Express.js', 'express'),
  github('Spring', 'spring-projects/spring-framework'),
  github('Django', 'django/django', { useTags: true, ltsTagPrefix: '4.2' }),
  custom('JSON', 'json'),
  github('Bash', 'bminor/bash', { useTags: true }),
  github('Erlang', 'erlang/otp'),
  github('Nim', 'nim-lang/Nim', { useTags: true }),
  github('V', 'vlang/v'),
  github('WebAssembly', 'WebAssembly/spec', { useTags: true }),
  custom('SQL', 'sql'),
  github('Haskell', 'ghc/ghc', { useTags: true }),
  github('Clojure', 'clojure/clojure', { useTags: true }),
  github('Flang', 'flang-compiler/flang', { useTags: true }),
  github('OCaml', 'ocaml/ocaml')
];
