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
  custom('CSS', 'css', { livingStandard: true }),
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
  github('Flutter', 'flutter/flutter'),
  github('Python', 'python/cpython', { useTags: true }),
  custom('Go', 'https://go.dev/dl/?mode=json'),
  custom('Dart', 'https://storage.googleapis.com/dart-archive/channels/stable/release/latest/VERSION'),
  github('Rust', 'rust-lang/rust', { edition: '2024' }),
  custom('Java', 'https://api.adoptium.net/v3/assets/feature_releases?jvm_impl=hotspot&image_type=jdk&os=linux&page=0&page_size=100&project=jdk&sort_order=DESC', { ltsSupport: true }),
  github('PHP', 'php/php-src'),
  github('Redis', 'redis/redis'),
  custom('MongoDB', 'https://www.mongodb.com/try/download/community'),
  custom('PostgreSQL', 'https://www.postgresql.org/docs/release/'),
  custom('MySQL', 'https://dev.mysql.com/doc/relnotes/mysql/', { ltsSupport: true }),
  github('Laravel', 'laravel/laravel', { useTags: true, ltsSupport: true, ltsTagPrefix: '11' }),
  github('Bootstrap', 'twbs/bootstrap'),
  github('Docker', 'moby/moby'),
  github('Kubernetes', 'kubernetes/kubernetes'),
  github('Ansible', 'ansible/ansible'),
  github('Swift', 'apple/swift'),
  github('Kotlin', 'JetBrains/kotlin'),
  custom('Ruby', 'ruby/ruby'),
  custom('C', 'c', { standardSupport: true }),
  github('C#', 'dotnet/runtime', { useTags: true, ltsSupport: true, ltsTagPrefix: '8.0' }),
  github('C++', 'cplusplus/draft', { useTags: true, standardSupport: true }),
  github('Scala', 'scala/scala'),
  github('Symfony', 'symfony/symfony', { useTags: true, ltsSupport: true, ltsTagPrefix: '6.4' }),
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
  github('Django', 'django/django', { useTags: true, ltsSupport: true, ltsTagPrefix: '4.2' }),
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
  github('OCaml', 'ocaml/ocaml'),
  // Web tools - Build & Package
  npm('Vite', 'vite'),
  npm('Webpack', 'webpack'),
  github('npm', 'npm/cli'),
  github('Yarn', 'yarnpkg/berry'),
  github('pnpm', 'pnpm/pnpm'),
  // Web tools - Testing
  npm('Jest', 'jest'),
  npm('Vitest', 'vitest'),
  npm('Cypress', 'cypress'),
  npm('Playwright', '@playwright/test'),
  // Web tools - CSS & Frontend
  npm('Tailwind CSS', 'tailwindcss'),
  npm('Redux', 'redux'),
  npm('Zustand', 'zustand'),
  npm('Pinia', 'pinia'),
  // Web tools - Backend
  npm('Fastify', 'fastify'),
  github('Flask', 'pallets/flask'),
  github('FastAPI', 'tiangolo/fastapi'),
  github('Ruby on Rails', 'rails/rails'),
  // Web tools - API & ORM
  npm('Prisma', 'prisma'),
  npm('tRPC', '@trpc/server'),
  // Web tools - Server
  custom('Nginx', 'nginx'),
  // Mobile tools - Cross-Platform
  npm('React Native', 'react-native'),
  npm('Ionic', '@ionic/core'),
  npm('Capacitor', '@capacitor/core'),
  // Mobile tools - Native (SwiftUI/Jetpack tied to OS SDKs - no external sync)
  // Mobile tools - Backend
  npm('Firebase', 'firebase'),
  github('SQLite', 'nickhutchinson/libsqlite3-sys'),
  npm('Realm', 'realm'),
  npm('Supabase', '@supabase/supabase-js'),
  npm('AWS Amplify', 'aws-amplify'),
  // Mobile tools - Build & Distribution
  npm('Expo', 'expo'),
  github('Fastlane', 'fastlane/fastlane'),
  // Mobile tools - Frameworks
  github('.NET MAUI', 'dotnet/maui'),
  npm('NativeScript', 'nativescript'),
  // Mobile tools - Flutter State Management (pub.dev - custom)
  custom('Riverpod', 'riverpod'),
  custom('BLoC', 'bloc'),
  custom('GetX', 'get'),
  // Mobile tools - Testing
  npm('Detox', 'detox'),
  npm('Appium', 'appium'),
  github('Maestro', 'mobile-dev-inc/maestro')
];
