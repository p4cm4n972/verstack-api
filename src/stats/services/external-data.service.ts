import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

interface StackOverflowTag {
  name: string;
  count: number;
}

interface StackOverflowResponse {
  items: StackOverflowTag[];
}

interface GitHubSearchResponse {
  total_count: number;
  items: any[];
}

@Injectable()
export class ExternalDataService {
  private readonly STACKOVERFLOW_API = 'https://api.stackexchange.com/2.3/tags';
  private readonly GITHUB_API = 'https://api.github.com/search/repositories';
  private readonly githubToken: string;

  // Mapping des noms de langages pour les différentes sources
  private readonly LANGUAGE_MAPPING: Map<string, { stackoverflow: string; github: string }> = new Map([
    ['Python', { stackoverflow: 'python', github: 'python' }],
    ['JavaScript', { stackoverflow: 'javascript', github: 'javascript' }],
    ['Java', { stackoverflow: 'java', github: 'java' }],
    ['C++', { stackoverflow: 'c++', github: 'c++' }],
    ['C#', { stackoverflow: 'c#', github: 'c#' }],
    ['TypeScript', { stackoverflow: 'typescript', github: 'typescript' }],
    ['PHP', { stackoverflow: 'php', github: 'php' }],
    ['R', { stackoverflow: 'r', github: 'r' }],
    ['Go', { stackoverflow: 'go', github: 'go' }],
    ['Rust', { stackoverflow: 'rust', github: 'rust' }],
    ['C', { stackoverflow: 'c', github: 'c' }],
    ['Swift', { stackoverflow: 'swift', github: 'swift' }],
    ['Kotlin', { stackoverflow: 'kotlin', github: 'kotlin' }],
    ['Ruby', { stackoverflow: 'ruby', github: 'ruby' }],
    ['Scala', { stackoverflow: 'scala', github: 'scala' }],
    ['Dart', { stackoverflow: 'dart', github: 'dart' }],
    ['MATLAB', { stackoverflow: 'matlab', github: 'matlab' }],
    ['Shell', { stackoverflow: 'shell', github: 'shell' }],
    ['Objective-C', { stackoverflow: 'objective-c', github: 'objective-c' }],
    ['Perl', { stackoverflow: 'perl', github: 'perl' }],
  ]);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.githubToken = this.configService.get<string>('GITHUB_TOKEN');
  }

  /**
   * Récupère la popularité depuis Stack Overflow
   */
  async getStackOverflowPopularity(languages: string[]): Promise<Map<string, number>> {
    const tagNames = languages
      .map(lang => this.LANGUAGE_MAPPING.get(lang)?.stackoverflow)
      .filter(tag => tag !== undefined)
      .join(';');

    try {
      const params = {
        order: 'desc',
        sort: 'popular',
        site: 'stackoverflow',
        pagesize: '100',
        inname: tagNames,
      };

      const response = await firstValueFrom(
        this.httpService.get<StackOverflowResponse>(this.STACKOVERFLOW_API, { params }).pipe(
          map(res => res.data)
        )
      );

      const popularityMap = new Map<string, number>();

      // Trouver le count max pour normaliser
      const maxCount = Math.max(...response.items.map(item => item.count));

      response.items.forEach(item => {
        // Trouver le langage correspondant au tag
        for (const [language, mapping] of this.LANGUAGE_MAPPING.entries()) {
          if (mapping.stackoverflow.toLowerCase() === item.name.toLowerCase()) {
            // Normaliser le score sur 100
            const normalizedScore = (item.count / maxCount) * 100;
            popularityMap.set(language, Math.round(normalizedScore));
            break;
          }
        }
      });

      return popularityMap;
    } catch (error) {
      console.error('Error fetching Stack Overflow data:', error);
      throw new HttpException(
        'Failed to fetch Stack Overflow data',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Récupère des scores approximatifs pour TIOBE
   * Note: TIOBE n'a pas d'API publique, donc on utilise des scores estimés
   */
  getTIOBEScores(): Map<string, number> {
    // Ces scores sont des approximations basées sur le dernier index TIOBE connu
    return new Map([
      ['Python', 100],
      ['C', 80],
      ['C++', 65],
      ['Java', 71],
      ['C#', 58],
      ['JavaScript', 18],
      ['PHP', 45],
      ['Go', 15],
      ['Rust', 13],
      ['Swift', 20],
      ['R', 40],
      ['TypeScript', 0], // Pas dans TIOBE top 20
      ['Kotlin', 18],
      ['Ruby', 30],
      ['Scala', 25],
      ['Objective-C', 25],
      ['MATLAB', 35],
      ['Dart', 12],
      ['Perl', 22],
      ['Shell', 15],
    ]);
  }

  /**
   * Récupère la popularité depuis GitHub API
   */
  async getGitHubScores(languages: string[]): Promise<Map<string, number>> {
    const popularityMap = new Map<string, number>();
    const counts: number[] = [];

    try {
      // Récupérer le nombre de repos pour chaque langage
      for (const language of languages) {
        const mapping = this.LANGUAGE_MAPPING.get(language);
        if (!mapping) continue;

        try {
          const params = {
            q: `language:${mapping.github}`,
            per_page: 1,
          };

          const headers: any = {
            'Accept': 'application/vnd.github.v3+json',
          };

          // Ajouter le token si disponible
          if (this.githubToken) {
            headers['Authorization'] = `Bearer ${this.githubToken}`;
          }

          const response = await firstValueFrom(
            this.httpService.get<GitHubSearchResponse>(this.GITHUB_API, {
              params,
              headers
            }).pipe(map(res => res.data))
          );

          counts.push(response.total_count);
          popularityMap.set(language, response.total_count);

          // Petit délai pour éviter le rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error fetching GitHub data for ${language}:`, error.message);
          popularityMap.set(language, 0);
        }
      }

      // Normaliser les scores sur 100
      const maxCount = Math.max(...counts.filter(c => c > 0));
      if (maxCount > 0) {
        for (const [language, count] of popularityMap.entries()) {
          const normalizedScore = (count / maxCount) * 100;
          popularityMap.set(language, Math.round(normalizedScore));
        }
      }

      return popularityMap;
    } catch (error) {
      console.error('Error fetching GitHub data:', error);
      // Fallback vers des scores approximatifs en cas d'erreur
      return new Map([
        ['Python', 95],
        ['JavaScript', 90],
        ['Java', 68],
        ['TypeScript', 80],
        ['C++', 50],
        ['C#', 48],
        ['PHP', 35],
        ['Go', 60],
        ['Rust', 55],
        ['Ruby', 35],
        ['Swift', 45],
        ['Kotlin', 40],
        ['C', 30],
        ['R', 25],
        ['Shell', 50],
        ['Scala', 22],
        ['Dart', 28],
        ['MATLAB', 10],
        ['Objective-C', 15],
        ['Perl', 12],
      ]);
    }
  }

  /**
   * Agrège les scores de toutes les sources
   */
  async getAggregatedScores(languages: string[]): Promise<Map<string, { stackoverflow: number; tiobe: number; github: number; average: number }>> {
    const stackOverflowScores = await this.getStackOverflowPopularity(languages);
    const tiobeScores = this.getTIOBEScores();
    const githubScores = await this.getGitHubScores(languages);

    const aggregated = new Map<string, { stackoverflow: number; tiobe: number; github: number; average: number }>();

    for (const language of languages) {
      const so = stackOverflowScores.get(language) || 0;
      const tiobe = tiobeScores.get(language) || 0;
      const github = githubScores.get(language) || 0;
      const average = Math.round((so + tiobe + github) / 3);

      aggregated.set(language, {
        stackoverflow: so,
        tiobe,
        github,
        average,
      });
    }

    return aggregated;
  }
}
