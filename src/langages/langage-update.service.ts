import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Langage } from '../langages/entities/langage.entity';
import { SYNC_LANGAGES, LangageSyncConfig } from './langage-sync.config';
import { exec as cpExec } from 'child_process';
import { promisify } from 'util';
import * as semver from 'semver';

const exec = promisify(cpExec);

@Injectable()
export class LangageUpdateService {
  private readonly logger = new Logger(LangageUpdateService.name);
  constructor(
    @InjectModel(Langage.name) private readonly langageModel: Model<Langage>,
    private readonly http: HttpService,
  ) {}

//  SYNCRO NODEJS
  async updateNodeJS() {
    const releases = await firstValueFrom(
      this.http.get('https://nodejs.org/dist/index.json')
    );
  
    const latestLts = releases.data.find((r: any) => r.lts);
    const latestCurrent = releases.data.find((r: any) => !r.lts);
  
    if (latestCurrent) {
      await this.langageModel.updateOne(
        { name: 'Node.js' },
        {
          $set: {
            'versions.$[v].label': latestCurrent.version.replace(/^v/, ''),
            'versions.$[v].releaseDate': latestCurrent.date
          }
        },
        { arrayFilters: [{ 'v.type': 'current' }] }
      );
    }
  
    if (latestLts) {
      await this.langageModel.updateOne(
        { name: 'Node.js' },
        {
          $set: {
            'versions.$[v].label': latestLts.version.replace(/^v/, ''),
            'versions.$[v].releaseDate': latestLts.date
          }
        },
        { arrayFilters: [{ 'v.type': 'lts' }] }
      );
    }
  
    this.logger.log(
      `✅ Node.js : current = ${latestCurrent?.version}, lts = ${latestLts?.version}`
    );
  }

  // SYNCRO GO
  async updateGo() {
    const response = await firstValueFrom(this.http.get('https://go.dev/dl/?mode=json'));
    const latest = response.data.find((v: any) => v.stable)?.version?.replace('go', '');
  
    if (latest) {
      await this.langageModel.updateOne(
        { name: 'Go' },
        {
          $set: {
            'versions.$[v].label': latest,
            'versions.$[v].releaseDate': new Date().toISOString()
          }
        },
        { arrayFilters: [{ 'v.type': 'current' }] }
      );
      this.logger.log(`✅ Go synchronisé : ${latest}`);
    }
  }

  // SYNCRO RUST
  async updateRust() {
    const response = await firstValueFrom(
      this.http.get('https://api.github.com/repos/rust-lang/rust/releases/latest')
    );
    const latest = response.data.tag_name;
  
    await this.langageModel.updateOne(
      { name: 'Rust' },
      {
        $set: {
          'versions.$[v].label': latest,
          'versions.$[v].releaseDate': response.data.published_at
        }
      },
      { arrayFilters: [{ 'v.type': 'current' }] }
    );
  
    this.logger.log(`✅ Rust synchronisé : ${latest}`);
  }
  // SYNCRO SWIFT
  async updateSwift() {
    const response = await firstValueFrom(
      this.http.get('https://api.github.com/repos/apple/swift/releases/latest')
    );
    const latest = response.data.tag_name;
  
    await this.langageModel.updateOne(
      { name: 'Swift' },
      {
        $set: {
          'versions.$[v].label': latest,
          'versions.$[v].releaseDate': response.data.published_at
        }
      },
      { arrayFilters: [{ 'v.type': 'current' }] }
    );
  
    this.logger.log(`✅ Swift synchronisé : ${latest}`);
  }
  // SYNCRO KOTLIN  
  async updateKotlin() {
    const response = await firstValueFrom(
      this.http.get('https://api.github.com/repos/JetBrains/kotlin/releases/latest')
    );
    const latest = response.data.tag_name;
  
    await this.langageModel.updateOne(
      { name: 'Kotlin' },
      {
        $set: {
          'versions.$[v].label': latest,
          'versions.$[v].releaseDate': response.data.published_at
        }
      },
      { arrayFilters: [{ 'v.type': 'current' }] }
    );
  
    this.logger.log(`✅ Kotlin synchronisé : ${latest}`);
  }

  // SYNCRO RUBY
  async updateRuby() {
    await this.updateFromGitHubRelease('Ruby', 'ruby/ruby');
  }

  // SYNCRO C#
  async updateCSharp() {
    await this.updateFromGitHubRelease('C#', 'dotnet/runtime');
  }

  // SYNCRO C++
  async updateCpp() {
    await this.updateFromGitHubRelease('C++', 'cplusplus/draft');
  }

  // SYNCRO SCALA
  async updateScala() {
    await this.updateFromGitHubRelease('Scala', 'scala/scala');
  }

  // SYNCRO EXPRESS
  async updateExpressJS() {
    await this.updateFromNpm('Express.js', 'express');
  }

  // SYNCRO SPRING
  async updateSpring() {
    await this.updateFromGitHubRelease('Spring', 'spring-projects/spring-framework');
  }

  // SYNCRO DJANGO
  async updateDjango() {
    await this.updateFromGitHubTag('Django', 'django/django');
  }

  // SYNCRO JSON
  async updateJson() {
    await this.updateCustom('JSON', 'json');
  }

  // SYNCRO BASH
  async updateBash() {
    await this.updateFromGitHubTag('Bash', 'bminor/bash');
  }

  // SYNCRO ERLANG
  async updateErlang() {
    await this.updateFromGitHubRelease('Erlang', 'erlang/otp');
  }

  // SYNCRO NIM
  async updateNim() {
    await this.updateFromGitHubTag('Nim', 'nim-lang/Nim');
  }

  // SYNCRO V
  async updateV() {
    await this.updateFromGitHubRelease('V', 'vlang/v');
  }

  // SYNCRO WEB ASSEMBLY
  async updateWebAssembly() {
    await this.updateFromGitHubTag('Web Assembly', 'WebAssembly/spec');
  }

  // SYNCRO SQL
  async updateSql() {
    await this.updateCustom('SQL', 'sql');
  }

  // SYNCRO HASKELL
  async updateHaskell() {
    await this.updateFromGitHubTag('Haskell', 'ghc/ghc');
  }

  // SYNCRO CLOJURE
  async updateClojure() {
    await this.updateFromGitHubTag('Clojure', 'clojure/clojure');
  }

  // SYNCRO FLANG
  async updateFlang() {
    await this.updateFromGitHubTag('Flang', 'flang-compiler/flang');
  }

  // SYNCRO OCAML
  async updateOcaml() {
    await this.updateFromGitHubRelease('OCaml', 'ocaml/ocaml');
  }
  

  private githubHeaders(): Record<string, string> {
    return {
      'User-Agent': 'verstack-bot',
      ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {})
    };
  }
  






  async syncAll(): Promise<{ success: string[]; failed: { name: string; error: string }[] }> {
    const success: string[] = [];
    const failed: { name: string; error: string }[] = [];
  
    this.logger.log('🚀 Début de la synchronisation des langages...');
  
    for (const lang of SYNC_LANGAGES) {
      try {
        switch (lang.sourceType) {
          case 'npm':
            await this.updateFromNpm(lang.nameInDb, lang.sourceUrl, lang.ltsSupport);
            break;
          case 'github':
            lang.useTags
              ? await this.updateFromGitHubTag(lang.nameInDb, lang.sourceUrl)
              : await this.updateFromGitHubRelease(lang.nameInDb, lang.sourceUrl);
            break;
          case 'custom':
            await this.updateCustom(lang.nameInDb, lang.sourceUrl);
            break;
        }
        success.push(lang.nameInDb);
      } catch (error) {
        const errorMsg = error?.message || error.toString();
        failed.push({ name: lang.nameInDb, error: errorMsg });
        this.logger.error(`❌ Erreur sur ${lang.nameInDb}`, error);
      }
    }
  
    this.logger.log(`✅ Terminé : ${success.length} ok / ${failed.length} échecs`);
    if (failed.length > 0) {
      this.logger.warn(`❌ Échecs : ${failed.map(f => f.name).join(', ')}`);
    }
  
    return { success, failed };
  }
  

  async updateFromNpm(nameInDb: string, npmPackage: string, ltsSupport = false) {
    const res = await firstValueFrom(
      this.http.get(`https://registry.npmjs.org/${npmPackage}`)
    );

    const distTags = res.data['dist-tags'] || {};
    const latest = distTags.latest;
    let lts = distTags.lts as string | undefined;

    if (ltsSupport && !lts) {
      if (npmPackage === '@angular/core') {
        const ltsKeys = Object.keys(distTags).filter(k => /^v\d+-lts$/.test(k));
        if (ltsKeys.length > 0) {
          const maxKey = ltsKeys.sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1))).pop();
          if (maxKey) {
            lts = distTags[maxKey];
          }
        }
      } else if (npmPackage === 'vue') {
        lts = distTags.legacy || distTags['v2-latest'];
      }
    }

    await this.setVersion(nameInDb, 'current', latest);
    if (ltsSupport && lts) {
      await this.setVersion(nameInDb, 'lts', lts);
    }

    const ltsInfo = ltsSupport && lts ? `, lts=${lts}` : ltsSupport ? ', lts=N/A' : '';
    this.logger.log(`✅ ${nameInDb} (npm): latest=${latest}${ltsInfo}`);
  }



  async updateFromGitHubTag(nameInDb: string, repo: string) {
  const res = await firstValueFrom(
    this.http.get(`https://api.github.com/repos/${repo}/tags`, {
      headers: this.githubHeaders()
    })
  );

  const version = res.data?.[0]?.name?.replace(/^v/, '') ?? null;

  if (version) {
    await this.setVersion(nameInDb, 'current', version);
    this.logger.log(`✅ ${nameInDb} (GitHub tags) : ${version}`);
  } else {
    this.logger.warn(`⚠️ Aucune version trouvée pour ${nameInDb}`);
  }
}

  async updateFromGitHubRelease(nameInDb: string, repo: string) {
    const res = await firstValueFrom(
      this.http.get(`https://api.github.com/repos/${repo}/releases/latest`, {
        headers: this.githubHeaders()
      })
    );

    const version = res.data?.tag_name?.replace(/^v/, '') ?? null;
    const releaseDate = res.data?.published_at ?? null;

    if (version) {
      await this.setVersion(nameInDb, 'current', version, releaseDate);
      this.logger.log(`✅ ${nameInDb} (GitHub releases) : ${version}`);
    } else {
      this.logger.warn(`⚠️ Aucune version trouvée pour ${nameInDb}`);
    }
  }



  async updateCustom(nameInDb: string, url: string) {
    if (url.includes('wch/r-source')) {
      try {
        const branches: string[] = [];
        for (let page = 1; page <= 5; page++) {
          const res = await firstValueFrom(
            this.http.get(`https://api.github.com/repos/wch/r-source/branches`, {
              params: { per_page: 100, page },
              headers: this.githubHeaders()
            })
          );
          branches.push(
            ...res.data
              .map((b: any) => b.name)
              .filter((n: string) => n.startsWith('tags/R-'))
          );
          if (res.data.length < 100) break;
        }
        const versions = branches
          .map(b => b.replace('tags/R-', '').replace(/-/g, '.'))
          .map(v => semver.coerce(v)?.version)
          .filter((v): v is string => Boolean(v));

        const latest = versions.sort(semver.rcompare)[0];

        if (latest) {
          await this.setVersion(nameInDb, 'current', latest);
          this.logger.log(`✅ ${nameInDb} (custom): ${latest}`);
        } else {
          this.logger.warn(`⚠️ Aucune version trouvée pour ${nameInDb}`);
        }
      } catch (err: any) {
        this.logger.error(`❌ ${nameInDb}: ${err.message}`);
      }
      return;
    }
    if (url === 'nodejs' || url.includes('nodejs.org')) {
      const res = await firstValueFrom(this.http.get('https://nodejs.org/dist/index.json'));
      const lts = res.data.find((r: any) => r.lts);
      const current = res.data.find((r: any) => !r.lts);

      if (current) {
        await this.setVersion(nameInDb, 'current', current.version.replace(/^v/, ''), current.date);
      }
      if (lts) {
        await this.setVersion(nameInDb, 'lts', lts.version.replace(/^v/, ''), lts.date);
      }

      this.logger.log(`✅ Node.js: current=${current?.version}, lts=${lts?.version}`);
    }

    if (url.includes('go.dev')) {
      const res = await firstValueFrom(this.http.get(url));
      const latest = res.data.find((v: any) => v.stable)?.version.replace('go', '');

      await this.setVersion(nameInDb, 'current', latest);
      this.logger.log(`✅ Go (custom): ${latest}`);
    }


    if (url.includes('dotnetcli')) {
      const res = await firstValueFrom(this.http.get(url));
      const latest = res.data?.releases?.[0]?.latestSdk;
    
      if (latest) {
        await this.setVersion(nameInDb, 'current', latest);
        this.logger.log(`✅ .NET SDK: ${latest}`);
      }
    }
    
  }

  private async setVersion(name: string, type: string, label: string, releaseDate?: string) {
    await this.langageModel.updateOne(
      { name },
      {
        $set: {
          'versions.$[v].label': label,
          'versions.$[v].releaseDate': releaseDate || new Date().toISOString()
        }
      },
      { arrayFilters: [{ 'v.type': type }] }
    );
  }
}
