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
  custom('Perl', 'perl'),
  custom('Unity', 'unity', { ltsSupport: true }),
  npm('Express.js', 'express'),
  github('Spring', 'spring-projects/spring-framework'),
  custom('Django', 'django', { ltsSupport: true }),
  custom('JSON', 'json'),
  github('Bash', 'bminor/bash', { useTags: true }),
  github('Erlang', 'erlang/otp'),
  github('Nim', 'nim-lang/Nim', { useTags: true }),
  github('V', 'vlang/v'),
  github('WebAssembly', 'WebAssembly/spec', { useTags: true }),
  custom('SQL', 'sql'),
  custom('Haskell', 'haskell'),
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
  npm('GraphQL', 'graphql'),
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
  custom('SQLite', 'sqlite'),
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
  github('Maestro', 'mobile-dev-inc/maestro'),
  // Embedded - RTOS
  github('FreeRTOS', 'FreeRTOS/FreeRTOS-Kernel'),
  github('Zephyr', 'zephyrproject-rtos/zephyr'),
  github('RT-Thread', 'RT-Thread/rt-thread'),
  github('RIOT OS', 'RIOT-OS/RIOT'),
  // Embedded - Frameworks/HAL
  github('Arduino', 'arduino/Arduino'),
  github('ESP-IDF', 'espressif/esp-idf'),
  github('Mbed OS', 'ARMmbed/mbed-os'),
  github('STM32Cube', 'STMicroelectronics/STM32CubeF4', { useTags: true }),
  github('Nordic SDK', 'nrfconnect/sdk-nrf'),
  // Embedded - Build & Tools
  custom('PlatformIO', 'platformio'),
  github('OpenOCD', 'openocd-org/openocd'),
  // Embedded - Protocols
  custom('MQTT', 'mqtt'),
  custom('CoAP', 'coap'),
  custom('Modbus', 'modbus'),
  // Embedded - Testing
  github('Unity', 'ThrowTheSwitch/Unity'),
  custom('CppUTest', 'cpputest'),
  // Datascience - ML/DL Frameworks
  npm('TensorFlow', 'tensorflow'),
  npm('PyTorch', 'torch'),
  npm('Scikit-learn', 'scikit-learn'),
  npm('Keras', 'keras'),
  npm('XGBoost', 'xgboost'),
  github('LightGBM', 'microsoft/LightGBM'),
  // Datascience - Data Processing
  npm('Pandas', 'pandas'),
  npm('NumPy', 'numpy'),
  github('Apache Spark', 'apache/spark', { useTags: true }),
  github('Polars', 'pola-rs/polars'),
  npm('Dask', 'dask'),
  // Datascience - Visualization
  npm('Matplotlib', 'matplotlib'),
  npm('Plotly', 'plotly.js'),
  custom('Seaborn', 'seaborn'),
  // Datascience - Notebooks
  custom('Jupyter', 'jupyter'),
  // Datascience - MLOps
  npm('MLflow', 'mlflow'),
  github('Airflow', 'apache/airflow'),
  npm('DVC', 'dvc'),
  // IA - LLM Frameworks
  github('LangChain', 'langchain-ai/langchain'),
  github('LlamaIndex', 'run-llama/llama_index'),
  github('Haystack', 'deepset-ai/haystack'),
  github('Semantic Kernel', 'microsoft/semantic-kernel'),
  // IA - Computer Vision
  github('OpenCV', 'opencv/opencv'),
  github('YOLO', 'ultralytics/ultralytics'),
  custom('Albumentations', 'albumentations'),
  // IA - NLP
  github('spaCy', 'explosion/spaCy'),
  github('Transformers', 'huggingface/transformers'),
  github('NLTK', 'nltk/nltk', { useTags: true }),
  github('Gensim', 'RaRe-Technologies/gensim'),
  // IA - Vector Databases
  custom('Pinecone', 'pinecone'),
  github('Weaviate', 'weaviate/weaviate'),
  github('Chroma', 'chroma-core/chroma'),
  github('Milvus', 'milvus-io/milvus'),
  github('Qdrant', 'qdrant/qdrant'),
  // IA - Model Formats & Serving
  github('ONNX', 'onnx/onnx'),
  github('ONNX Runtime', 'microsoft/onnxruntime'),
  github('TensorFlow Serving', 'tensorflow/serving'),
  github('TorchServe', 'pytorch/serve'),
  github('Triton', 'triton-inference-server/server'),
  github('TensorRT', 'NVIDIA/TensorRT'),
  custom('CoreML', 'coreml'),
  custom('TFLite', 'tflite'),
  // IA - AutoML
  github('Auto-sklearn', 'automl/auto-sklearn'),
  custom('H2O.ai', 'h2o'),
  // IA - Reinforcement Learning
  github('Stable Baselines3', 'DLR-RM/stable-baselines3'),
  github('OpenAI Gym', 'Farama-Foundation/Gymnasium'),
  // Game - Game Engines 3D
  custom('Unreal Engine', 'unreal-engine'),
  github('Godot', 'godotengine/godot'),
  // Game - Game Engines 2D
  custom('GameMaker', 'gamemaker'),
  // Game - Web Game Frameworks
  npm('Phaser', 'phaser'),
  npm('Three.js', 'three'),
  npm('Babylon.js', '@babylonjs/core'),
  npm('PixiJS', 'pixi.js'),
  github('PlayCanvas', 'playcanvas/engine'),
  // Game - Cross-Platform Frameworks
  github('libGDX', 'libgdx/libgdx'),
  github('MonoGame', 'MonoGame/MonoGame'),
  custom('Cocos2d-x', 'cocos2d-x'),
  github('Defold', 'defold/defold'),
  // Game - Graphics APIs
  custom('OpenGL', 'opengl'),
  custom('Vulkan', 'vulkan'),
  custom('DirectX', 'directx'),
  custom('Metal', 'metal'),
  // Game - Physics Engines
  github('Box2D', 'erincatto/box2d'),
  github('Bullet Physics', 'bulletphysics/bullet3'),
  // Game - Audio Middleware
  custom('FMOD', 'fmod'),
  custom('Wwise', 'wwise'),
  // Game - Networking
  custom('Photon', 'photon'),
  github('Mirror', 'MirrorNetworking/Mirror'),
  // Game - Asset Tools
  github('Blender', 'blender/blender', { useTags: true }),
  github('Aseprite', 'aseprite/aseprite'),
  // DevOps - IaC
  github('Terraform', 'hashicorp/terraform'),
  github('Pulumi', 'pulumi/pulumi'),
  github('Puppet', 'puppetlabs/puppet'),
  github('Chef', 'chef/chef'),
  // DevOps - CI/CD
  github('Jenkins', 'jenkinsci/jenkins'),
  custom('GitHub Actions', 'github-actions'),
  github('GitLab CI', 'gitlabhq/gitlabhq', { useTags: true }),
  custom('CircleCI', 'circleci'),
  custom('Azure DevOps', 'azure-devops'),
  // DevOps - Containerization
  github('Podman', 'containers/podman'),
  // DevOps - Orchestration
  github('Nomad', 'hashicorp/nomad'),
  // DevOps - Monitoring
  github('Prometheus', 'prometheus/prometheus'),
  github('Grafana', 'grafana/grafana'),
  custom('Datadog', 'datadog'),
  // DevOps - Logging
  github('Fluentd', 'fluent/fluentd'),
  github('Loki', 'grafana/loki'),
  // DevOps - Service Mesh
  github('Istio', 'istio/istio'),
  github('Linkerd', 'linkerd/linkerd2'),
  github('Consul', 'hashicorp/consul'),
  // DevOps - GitOps
  github('ArgoCD', 'argoproj/argo-cd'),
  github('Flux', 'fluxcd/flux2'),
  // DevOps - Package Managers
  github('Helm', 'helm/helm'),
  github('Kustomize', 'kubernetes-sigs/kustomize'),
  // DevOps - Security
  github('Vault', 'hashicorp/vault'),
  github('SonarQube', 'SonarSource/sonarqube'),
  github('Trivy', 'aquasecurity/trivy'),
  custom('Snyk', 'snyk'),
  // DevOps - Testing
  github('Selenium', 'SeleniumHQ/selenium'),
  github('k6', 'grafana/k6')
];
