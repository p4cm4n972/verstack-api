import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Langage } from './entities/langage.entity';
import { SYNC_LANGAGES, LangageSyncConfig } from './langage-sync.config';

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
  








  async syncAll() {
    for (const lang of SYNC_LANGAGES) {
      try {
        switch (lang.sourceType) {
          case 'npm':
            await this.updateFromNpm(lang.nameInDb, lang.sourceUrl, lang.ltsSupport);
            break;
          case 'github':
            await this.updateFromGitHubRelease(lang.nameInDb, lang.sourceUrl);
            break;
          case 'custom':
            await this.updateCustom(lang.nameInDb, lang.sourceUrl);
            break;
        }
      } catch (err) {
        this.logger.error(`❌ Erreur de synchro ${lang.nameInDb}`, err);
      }
    }
  }

  async updateFromNpm(nameInDb: string, npmPackage: string, ltsSupport = false) {
    const res = await firstValueFrom(this.http.get(`https://registry.npmjs.org/${npmPackage}`));
    const latest = res.data['dist-tags']?.latest;
    const lts = res.data['dist-tags']?.lts;

    await this.setVersion(nameInDb, 'current', latest);
    if (ltsSupport && lts) {
      await this.setVersion(nameInDb, 'lts', lts);
    }

    this.logger.log(`✅ ${nameInDb} (npm): latest=${latest}${ltsSupport ? `, lts=${lts}` : ''}`);
  }

  async updateFromGitHubRelease(nameInDb: string, repo: string) {
    const res = await firstValueFrom(
      this.http.get(`https://api.github.com/repos/${repo}/releases/latest`)
    );
    const version = res.data.tag_name?.replace(/^v/, '');

    await this.setVersion(nameInDb, 'current', version, res.data.published_at);
    this.logger.log(`✅ ${nameInDb} (GitHub): ${version}`);
  }

  async updateCustom(nameInDb: string, url: string) {
    if (url === 'nodejs') {
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
